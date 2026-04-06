import {
	addItem,
	markWatched,
	removeItem,
	reorderItem,
	unmarkWatched,
} from "../server/functions/queue";

export type GroupActionType =
	| "ADD_ITEM"
	| "REMOVE_ITEM"
	| "REORDER_ITEM"
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

export class ServerFnDispatcher implements GroupActionDispatcher {
	async dispatch(action: GroupAction): Promise<unknown> {
		switch (action.type) {
			case "ADD_ITEM":
				return addItem({
					data: {
						groupId: action.groupId,
						tmdbId: action.payload.tmdbId as number,
						contentType: action.payload.contentType as "movie" | "tv",
					},
				});
			case "REMOVE_ITEM":
				return removeItem({
					data: {
						groupId: action.groupId,
						queueItemId: action.payload.queueItemId as string,
					},
				});
			case "REORDER_ITEM":
				return reorderItem({
					data: {
						groupId: action.groupId,
						queueItemId: action.payload.queueItemId as string,
						newPosition: action.payload.newPosition as number,
						contentType: action.payload.contentType as "movie" | "tv",
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
						contentType: action.payload.contentType as "movie" | "tv",
					},
				});
		}
	}
}

export const serverFnDispatcher = new ServerFnDispatcher();
