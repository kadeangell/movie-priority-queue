import type { GroupAction, GroupActionDispatcher } from "./group-actions";
import type { MutationAckMessage, MutationErrorMessage } from "./ws-protocol";

interface PendingMutation {
	resolve: (value: unknown) => void;
	reject: (reason: unknown) => void;
	timer: ReturnType<typeof setTimeout>;
}

const MUTATION_TIMEOUT = 10_000;

export class WebSocketDispatcher implements GroupActionDispatcher {
	private ws: WebSocket;
	private pending = new Map<string, PendingMutation>();

	constructor(ws: WebSocket) {
		this.ws = ws;
	}

	async dispatch(action: GroupAction): Promise<unknown> {
		if (this.ws.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket not connected");
		}

		const requestId = crypto.randomUUID();

		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(requestId);
				reject(new Error("WebSocket mutation timeout"));
			}, MUTATION_TIMEOUT);

			this.pending.set(requestId, { resolve, reject, timer });

			this.ws.send(
				JSON.stringify({
					type: "mutation",
					requestId,
					action,
				}),
			);
		});
	}

	handleAck(msg: MutationAckMessage): void {
		const pending = this.pending.get(msg.requestId);
		if (!pending) return;
		this.pending.delete(msg.requestId);
		clearTimeout(pending.timer);
		pending.resolve(msg.result);
	}

	handleError(msg: MutationErrorMessage): void {
		const pending = this.pending.get(msg.requestId);
		if (!pending) return;
		this.pending.delete(msg.requestId);
		clearTimeout(pending.timer);
		pending.reject(new Error(msg.error));
	}

	rejectAll(): void {
		for (const [, pending] of this.pending) {
			clearTimeout(pending.timer);
			pending.reject(new Error("WebSocket disconnected"));
		}
		this.pending.clear();
	}
}
