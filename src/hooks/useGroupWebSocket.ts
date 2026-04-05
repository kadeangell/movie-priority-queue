import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { WebSocketDispatcher } from "../lib/ws-dispatcher";
import type { ServerMessage } from "../lib/ws-protocol";

const MAX_RECONNECT_DELAY = 30_000;
const BASE_RECONNECT_DELAY = 1_000;

export function useGroupWebSocket(groupId: string) {
	const [isConnected, setIsConnected] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const dispatcherRef = useRef<WebSocketDispatcher | null>(null);
	const reconnectAttempt = useRef(0);
	const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const queryClient = useQueryClient();

	const connect = useCallback(() => {
		if (typeof window === "undefined") return;

		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const url = `${protocol}//${window.location.host}/ws`;

		const ws = new WebSocket(url);
		wsRef.current = ws;

		ws.onopen = () => {
			reconnectAttempt.current = 0;
			const dispatcher = new WebSocketDispatcher(ws);
			dispatcherRef.current = dispatcher;
			setIsConnected(true);

			// Join the group room
			ws.send(JSON.stringify({ type: "join", groupId }));
		};

		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data) as ServerMessage;
				handleServerMessage(msg);
			} catch {
				// Ignore malformed messages
			}
		};

		ws.onclose = () => {
			cleanup();
			scheduleReconnect();
		};

		ws.onerror = () => {
			// onclose will fire after onerror
		};

		function handleServerMessage(msg: ServerMessage) {
			switch (msg.type) {
				case "mutation:ack":
					dispatcherRef.current?.handleAck(msg);
					break;
				case "mutation:error":
					dispatcherRef.current?.handleError(msg);
					break;
				case "mutation:broadcast":
					// Another user mutated the queue — invalidate our cache
					queryClient.invalidateQueries({
						queryKey: ["queue", msg.action.groupId],
					});
					break;
				case "ping":
					ws.send(JSON.stringify({ type: "pong" }));
					break;
				case "joined":
				case "error":
					break;
			}
		}

		function cleanup() {
			dispatcherRef.current?.rejectAll();
			dispatcherRef.current = null;
			setIsConnected(false);
		}

		function scheduleReconnect() {
			const attempt = reconnectAttempt.current;
			const delay = Math.min(
				BASE_RECONNECT_DELAY * 2 ** attempt + Math.random() * 1000,
				MAX_RECONNECT_DELAY,
			);
			reconnectAttempt.current = attempt + 1;

			reconnectTimer.current = setTimeout(() => {
				connect();
			}, delay);
		}
	}, [groupId, queryClient]);

	useEffect(() => {
		connect();

		return () => {
			if (reconnectTimer.current) {
				clearTimeout(reconnectTimer.current);
			}
			if (wsRef.current) {
				wsRef.current.onclose = null; // Prevent reconnect on intentional close
				wsRef.current.close();
			}
			dispatcherRef.current?.rejectAll();
			dispatcherRef.current = null;
			setIsConnected(false);
		};
	}, [connect]);

	return {
		dispatcher: dispatcherRef.current,
		isConnected,
	};
}
