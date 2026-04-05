import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { WebSocketServer } from "ws";
import type { ClientMessage } from "../../lib/ws-protocol";
import {
	executeAddMovie,
	executeMarkWatched,
	executeRemoveMovie,
	executeReorderMovie,
	executeUnmarkWatched,
	validateMembership,
} from "./queue-operations";
import type { AuthenticatedWebSocket } from "./ws-rooms";
import { GroupRoomManager } from "./ws-rooms";
import { parseSessionFromUpgrade } from "./ws-session";

const rooms = new GroupRoomManager();

const HEARTBEAT_INTERVAL = 30_000;

export function setupHeartbeat(wss: WebSocketServer): void {
	setInterval(() => {
		for (const client of wss.clients) {
			const ws = client as AuthenticatedWebSocket;
			if (!ws.isAlive) {
				ws.terminate();
				rooms.leaveAll(ws);
				continue;
			}
			ws.isAlive = false;
			ws.send(JSON.stringify({ type: "ping" }));
		}
	}, HEARTBEAT_INTERVAL);
}

export async function handleUpgrade(
	wss: WebSocketServer,
	req: IncomingMessage,
	socket: Duplex,
	head: Buffer,
): Promise<void> {
	const session = await parseSessionFromUpgrade(req);

	if (!session) {
		socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
		socket.destroy();
		return;
	}

	wss.handleUpgrade(req, socket, head, (ws) => {
		const authedWs = ws as AuthenticatedWebSocket;
		authedWs.userId = session.userId;
		authedWs.username = session.username;
		authedWs.isAlive = true;
		authedWs.joinedGroups = new Set();

		authedWs.on("message", (data) => {
			try {
				const msg = JSON.parse(String(data)) as ClientMessage;
				handleMessage(authedWs, msg);
			} catch {
				authedWs.send(
					JSON.stringify({ type: "error", message: "Invalid message" }),
				);
			}
		});

		authedWs.on("close", () => {
			rooms.leaveAll(authedWs);
		});

		authedWs.on("error", () => {
			rooms.leaveAll(authedWs);
		});
	});
}

async function handleMessage(
	ws: AuthenticatedWebSocket,
	msg: ClientMessage,
): Promise<void> {
	switch (msg.type) {
		case "pong":
			ws.isAlive = true;
			return;

		case "join":
			await handleJoin(ws, msg.groupId);
			return;

		case "leave":
			rooms.leave(msg.groupId, ws);
			return;

		case "mutation":
			await handleMutation(ws, msg);
			return;
	}
}

async function handleJoin(
	ws: AuthenticatedWebSocket,
	groupId: string,
): Promise<void> {
	try {
		await validateMembership(groupId, ws.userId);
		// Leave any previous rooms first
		rooms.leaveAll(ws);
		rooms.join(groupId, ws);
		ws.send(JSON.stringify({ type: "joined", groupId }));
	} catch {
		ws.send(
			JSON.stringify({ type: "error", message: "Not a member of this group" }),
		);
	}
}

async function handleMutation(
	ws: AuthenticatedWebSocket,
	msg: ClientMessage & { type: "mutation" },
): Promise<void> {
	const { requestId, action } = msg;

	try {
		await validateMembership(action.groupId, ws.userId);

		const result = await executeMutation(
			action.type,
			action.groupId,
			action.payload,
			ws.userId,
		);

		// Ack to sender
		ws.send(JSON.stringify({ type: "mutation:ack", requestId, result }));

		// Broadcast to others
		rooms.broadcast(
			action.groupId,
			{
				type: "mutation:broadcast",
				action,
				userId: ws.userId,
				username: ws.username,
				timestamp: Date.now(),
			},
			ws,
		);
	} catch (err) {
		ws.send(
			JSON.stringify({
				type: "mutation:error",
				requestId,
				error: err instanceof Error ? err.message : "Mutation failed",
			}),
		);
	}
}

async function executeMutation(
	type: string,
	groupId: string,
	payload: Record<string, unknown>,
	userId: string,
): Promise<unknown> {
	switch (type) {
		case "ADD_MOVIE":
			return executeAddMovie(groupId, payload.tmdbId as number, userId);
		case "REMOVE_MOVIE":
			return executeRemoveMovie(groupId, payload.queueItemId as string);
		case "REORDER_MOVIE":
			return executeReorderMovie(
				groupId,
				payload.queueItemId as string,
				payload.newPosition as number,
			);
		case "MARK_WATCHED":
			return executeMarkWatched(groupId, payload.queueItemId as string, userId);
		case "UNMARK_WATCHED":
			return executeUnmarkWatched(groupId, payload.queueItemId as string);
		default:
			throw new Error(`Unknown mutation type: ${type}`);
	}
}
