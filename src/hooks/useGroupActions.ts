import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
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
		() => queryClient.invalidateQueries({ queryKey: ["queue", groupId] }),
		[queryClient, groupId],
	);

	const addMovie = useCallback(
		async (tmdbId: number) => {
			await activeDispatcher.dispatch({
				type: "ADD_MOVIE",
				groupId,
				payload: { tmdbId },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	const removeMovie = useCallback(
		async (queueItemId: string) => {
			await activeDispatcher.dispatch({
				type: "REMOVE_MOVIE",
				groupId,
				payload: { queueItemId },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	const reorderMovie = useCallback(
		async (queueItemId: string, newPosition: number) => {
			await activeDispatcher.dispatch({
				type: "REORDER_MOVIE",
				groupId,
				payload: { queueItemId, newPosition },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	const markWatched = useCallback(
		async (queueItemId: string) => {
			await activeDispatcher.dispatch({
				type: "MARK_WATCHED",
				groupId,
				payload: { queueItemId },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	const unmarkWatched = useCallback(
		async (queueItemId: string) => {
			await activeDispatcher.dispatch({
				type: "UNMARK_WATCHED",
				groupId,
				payload: { queueItemId },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue, activeDispatcher],
	);

	return {
		addMovie,
		removeMovie,
		reorderMovie,
		markWatched,
		unmarkWatched,
		isRealtime: isConnected,
	};
}
