import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	executeAddItem,
	executeMarkWatched,
	executeRemoveItem,
	executeReorderItem,
	executeUnmarkWatched,
	fetchQueueItems,
	validateMembership,
} from "../lib/queue-operations";
import { authMiddleware } from "../middleware/auth";

const contentTypeSchema = z.enum(["movie", "tv"]).default("movie");

export const getQueueItems = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			groupId: z.string(),
			contentType: contentTypeSchema,
		}),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return fetchQueueItems(data.groupId, data.contentType);
	});

export const addItem = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			groupId: z.string(),
			tmdbId: z.number().int(),
			contentType: contentTypeSchema,
		}),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return executeAddItem(
			data.groupId,
			data.tmdbId,
			context.user.userId,
			data.contentType,
		);
	});

export const removeItem = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			groupId: z.string(),
			queueItemId: z.string(),
		}),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return executeRemoveItem(data.groupId, data.queueItemId);
	});

export const reorderItem = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			groupId: z.string(),
			queueItemId: z.string(),
			newPosition: z.number().int(),
			contentType: contentTypeSchema,
		}),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return executeReorderItem(
			data.groupId,
			data.queueItemId,
			data.newPosition,
			data.contentType,
		);
	});

export const markWatched = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			groupId: z.string(),
			queueItemId: z.string(),
		}),
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
		z.object({
			groupId: z.string(),
			queueItemId: z.string(),
			contentType: contentTypeSchema,
		}),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);
		return executeUnmarkWatched(
			data.groupId,
			data.queueItemId,
			data.contentType,
		);
	});
