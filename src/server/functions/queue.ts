import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	executeAddMovie,
	executeMarkWatched,
	executeRemoveMovie,
	executeReorderMovie,
	executeUnmarkWatched,
	fetchQueueItems,
	validateMembership,
} from "../lib/queue-operations";
import { authMiddleware } from "../middleware/auth";

export const getQueueItems = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ groupId: z.string().uuid() }))
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return fetchQueueItems(data.groupId);
	});

export const addMovie = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({ groupId: z.string().uuid(), tmdbId: z.number().int() }),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return executeAddMovie(data.groupId, data.tmdbId, context.user.userId);
	});

export const removeMovie = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({ groupId: z.string().uuid(), queueItemId: z.string().uuid() }),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return executeRemoveMovie(data.groupId, data.queueItemId);
	});

export const reorderMovie = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			groupId: z.string().uuid(),
			queueItemId: z.string().uuid(),
			newPosition: z.number().int(),
		}),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return executeReorderMovie(
			data.groupId,
			data.queueItemId,
			data.newPosition,
		);
	});

export const markWatched = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({ groupId: z.string().uuid(), queueItemId: z.string().uuid() }),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return executeMarkWatched(
			data.groupId,
			data.queueItemId,
			context.user.userId,
		);
	});

export const unmarkWatched = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({ groupId: z.string().uuid(), queueItemId: z.string().uuid() }),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return executeUnmarkWatched(data.groupId, data.queueItemId);
	});
