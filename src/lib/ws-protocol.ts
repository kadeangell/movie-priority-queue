import type { GroupActionType } from "./group-actions";

// ─── Client → Server ───

export interface JoinMessage {
	type: "join";
	groupId: string;
}

export interface LeaveMessage {
	type: "leave";
	groupId: string;
}

export interface MutationMessage {
	type: "mutation";
	requestId: string;
	action: {
		type: GroupActionType;
		groupId: string;
		payload: Record<string, unknown>;
	};
}

export interface PongMessage {
	type: "pong";
}

export type ClientMessage =
	| JoinMessage
	| LeaveMessage
	| MutationMessage
	| PongMessage;

// ─── Server → Client ───

export interface JoinedMessage {
	type: "joined";
	groupId: string;
}

export interface MutationAckMessage {
	type: "mutation:ack";
	requestId: string;
	result: unknown;
}

export interface MutationErrorMessage {
	type: "mutation:error";
	requestId: string;
	error: string;
}

export interface MutationBroadcastMessage {
	type: "mutation:broadcast";
	action: {
		type: GroupActionType;
		groupId: string;
		payload: Record<string, unknown>;
	};
	userId: string;
	username: string;
	timestamp: number;
}

export interface PingMessage {
	type: "ping";
}

export interface ErrorMessage {
	type: "error";
	message: string;
}

export type ServerMessage =
	| JoinedMessage
	| MutationAckMessage
	| MutationErrorMessage
	| MutationBroadcastMessage
	| PingMessage
	| ErrorMessage;
