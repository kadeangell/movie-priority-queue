import {
	addMovie,
	markWatched,
	removeMovie,
	reorderMovie,
	unmarkWatched,
} from "../server/functions/queue";

export type GroupActionType =
	| "ADD_MOVIE"
	| "REMOVE_MOVIE"
	| "REORDER_MOVIE"
	| "MARK_WATCHED"
	| "UNMARK_WATCHED";

export interface GroupAction {
	type: GroupActionType;
	groupId: string;
	payload: Record<string, unknown>;
}

export interface GroupActionDispatcher {
	dispatch(action: GroupAction): Promise<unknown>;
}

// Current implementation: direct server function calls
// Future: swap to WebSocketDispatcher for real-time
export class ServerFnDispatcher implements GroupActionDispatcher {
	async dispatch(action: GroupAction): Promise<unknown> {
		switch (action.type) {
			case "ADD_MOVIE":
				return addMovie({
					data: {
						groupId: action.groupId,
						tmdbId: action.payload.tmdbId as number,
					},
				});
			case "REMOVE_MOVIE":
				return removeMovie({
					data: {
						groupId: action.groupId,
						queueItemId: action.payload.queueItemId as string,
					},
				});
			case "REORDER_MOVIE":
				return reorderMovie({
					data: {
						groupId: action.groupId,
						queueItemId: action.payload.queueItemId as string,
						newPosition: action.payload.newPosition as number,
					},
				});
			case "MARK_WATCHED":
				return markWatched({
					data: {
						groupId: action.groupId,
						queueItemId: action.payload.queueItemId as string,
					},
				});
			case "UNMARK_WATCHED":
				return unmarkWatched({
					data: {
						groupId: action.groupId,
						queueItemId: action.payload.queueItemId as string,
					},
				});
		}
	}
}

export const dispatcher = new ServerFnDispatcher();
