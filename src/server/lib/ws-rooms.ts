import type { WebSocket } from "ws";

export interface AuthenticatedWebSocket extends WebSocket {
	userId: string;
	username: string;
	isAlive: boolean;
	joinedGroups: Set<string>;
}

export class GroupRoomManager {
	private rooms = new Map<string, Set<AuthenticatedWebSocket>>();

	join(groupId: string, ws: AuthenticatedWebSocket): void {
		let room = this.rooms.get(groupId);
		if (!room) {
			room = new Set();
			this.rooms.set(groupId, room);
		}
		room.add(ws);
		ws.joinedGroups.add(groupId);
	}

	leave(groupId: string, ws: AuthenticatedWebSocket): void {
		const room = this.rooms.get(groupId);
		if (room) {
			room.delete(ws);
			if (room.size === 0) {
				this.rooms.delete(groupId);
			}
		}
		ws.joinedGroups.delete(groupId);
	}

	leaveAll(ws: AuthenticatedWebSocket): void {
		for (const groupId of ws.joinedGroups) {
			this.leave(groupId, ws);
		}
	}

	broadcast(
		groupId: string,
		message: object,
		exclude?: AuthenticatedWebSocket,
	): void {
		const room = this.rooms.get(groupId);
		if (!room) return;

		const data = JSON.stringify(message);
		for (const client of room) {
			if (client !== exclude && client.readyState === client.OPEN) {
				client.send(data);
			}
		}
	}
}
