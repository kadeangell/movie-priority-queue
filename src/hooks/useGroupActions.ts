import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { ContentType } from "../lib/content-type";
import type { GroupActionDispatcher } from "../lib/group-actions";
import { serverFnDispatcher } from "../lib/group-actions";
import { useGroupWebSocket } from "./useGroupWebSocket";

export function useGroupActions(groupId: string) {
	const queryClient = useQueryClient();
	const { dispatcher: wsDispatcher, isConnected } = useGroupWebSocket(groupId);

	const activeDispatcher: GroupActionDispatcher = useMemo(
		() => (isConnected && wsDispatcher ? wsDispatcher : serverFnDispatcher),
		[isConnected, wsDispatcher],
	);

	const invalidateQueue = useCallback(
		(contentType: ContentType) =>
			queryClient.invalidateQueries({
				queryKey: ["queue", groupId, contentType],
			}),
		[queryClient, groupId],
	);

	const addItem = useCallback(
		async (tmdbId: number, contentType: ContentType) => {
			await activeDispatcher.dispatch({
				type: "ADD_ITEM",
				groupId,
				payload: { tmdbId, contentType },
			});
			await invalidateQueue(contentType);
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	const removeItem = useCallback(
		async (queueItemId: string, contentType: ContentType) => {
			await activeDispatcher.dispatch({
				type: "REMOVE_ITEM",
				groupId,
				payload: { queueItemId, contentType },
			});
			await invalidateQueue(contentType);
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	const reorderItem = useCallback(
		async (
			queueItemId: string,
			newPosition: number,
			contentType: ContentType,
		) => {
			await activeDispatcher.dispatch({
				type: "REORDER_ITEM",
				groupId,
				payload: { queueItemId, newPosition, contentType },
			});
			await invalidateQueue(contentType);
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	const markWatched = useCallback(
		async (queueItemId: string, contentType: ContentType) => {
			await activeDispatcher.dispatch({
				type: "MARK_WATCHED",
				groupId,
				payload: { queueItemId },
			});
			await invalidateQueue(contentType);
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	const unmarkWatched = useCallback(
		async (queueItemId: string, contentType: ContentType) => {
			await activeDispatcher.dispatch({
				type: "UNMARK_WATCHED",
				groupId,
				payload: { queueItemId, contentType },
			});
			await invalidateQueue(contentType);
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	return {
		addItem,
		removeItem,
		reorderItem,
		markWatched,
		unmarkWatched,
		isRealtime: isConnected,
	};
}
