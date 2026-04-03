import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { dispatcher } from "../lib/group-actions";

export function useGroupActions(groupId: string) {
	const queryClient = useQueryClient();

	const invalidateQueue = useCallback(
		() => queryClient.invalidateQueries({ queryKey: ["queue", groupId] }),
		[queryClient, groupId],
	);

	const addMovie = useCallback(
		async (tmdbId: number) => {
			await dispatcher.dispatch({
				type: "ADD_MOVIE",
				groupId,
				payload: { tmdbId },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue],
	);

	const removeMovie = useCallback(
		async (queueItemId: string) => {
			await dispatcher.dispatch({
				type: "REMOVE_MOVIE",
				groupId,
				payload: { queueItemId },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue],
	);

	const reorderMovie = useCallback(
		async (queueItemId: string, newPosition: number) => {
			await dispatcher.dispatch({
				type: "REORDER_MOVIE",
				groupId,
				payload: { queueItemId, newPosition },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue],
	);

	const markWatched = useCallback(
		async (queueItemId: string) => {
			await dispatcher.dispatch({
				type: "MARK_WATCHED",
				groupId,
				payload: { queueItemId },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue],
	);

	const unmarkWatched = useCallback(
		async (queueItemId: string) => {
			await dispatcher.dispatch({
				type: "UNMARK_WATCHED",
				groupId,
				payload: { queueItemId },
			});
			await invalidateQueue();
		},
		[groupId, invalidateQueue],
	);

	return { addMovie, removeMovie, reorderMovie, markWatched, unmarkWatched };
}
