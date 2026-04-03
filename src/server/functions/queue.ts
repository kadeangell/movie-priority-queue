import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sql } from "../db/index";
import { authMiddleware } from "../middleware/auth";

// Helper: validate group membership
async function validateMembership(groupId: string, userId: string) {
	const [row] = await sql`
		SELECT 1 FROM group_members
		WHERE group_id = ${groupId} AND user_id = ${userId}
	`;
	if (!row) throw new Error("Not a member of this group");
}

export const getQueueItems = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ groupId: z.string().uuid() }))
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);

		const queue = await sql`
			SELECT id, group_id, tmdb_id, added_by, position, created_at
			FROM queue_items
			WHERE group_id = ${data.groupId} AND is_watched = false
			ORDER BY position ASC
		`;

		const watched = await sql`
			SELECT id, group_id, tmdb_id, added_by, watched_at, watched_by, created_at
			FROM queue_items
			WHERE group_id = ${data.groupId} AND is_watched = true
			ORDER BY watched_at DESC
		`;

		return { queue, watched };
	});

export const addMovie = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({ groupId: z.string().uuid(), tmdbId: z.number().int() }),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);

		// Get max position
		const [maxRow] = await sql`
			SELECT COALESCE(MAX(position), 0) AS max_pos
			FROM queue_items
			WHERE group_id = ${data.groupId} AND is_watched = false
		`;
		const newPosition = Number(maxRow.max_pos) + 1000;

		const [item] = await sql`
			INSERT INTO queue_items (group_id, tmdb_id, added_by, position)
			VALUES (${data.groupId}, ${data.tmdbId}, ${context.user.userId}, ${newPosition})
			ON CONFLICT (group_id, tmdb_id) DO NOTHING
			RETURNING id, group_id, tmdb_id, added_by, position, created_at
		`;

		if (!item) {
			throw new Error("Movie already in queue");
		}

		return item;
	});

export const removeMovie = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({ groupId: z.string().uuid(), queueItemId: z.string().uuid() }),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);

		await sql`
			DELETE FROM queue_items
			WHERE id = ${data.queueItemId} AND group_id = ${data.groupId}
		`;

		return { success: true };
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

		await sql`
			UPDATE queue_items
			SET position = ${data.newPosition}
			WHERE id = ${data.queueItemId} AND group_id = ${data.groupId}
		`;

		// Check if reindex is needed (positions too close)
		const items = await sql`
			SELECT id, position FROM queue_items
			WHERE group_id = ${data.groupId} AND is_watched = false
			ORDER BY position ASC
		`;

		let needsReindex = false;
		for (let i = 1; i < items.length; i++) {
			if (Number(items[i].position) - Number(items[i - 1].position) < 1) {
				needsReindex = true;
				break;
			}
		}

		if (needsReindex) {
			for (let i = 0; i < items.length; i++) {
				await sql`
					UPDATE queue_items
					SET position = ${(i + 1) * 1000}
					WHERE id = ${items[i].id}
				`;
			}
		}

		return { success: true };
	});

export const markWatched = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({ groupId: z.string().uuid(), queueItemId: z.string().uuid() }),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);

		await sql`
			UPDATE queue_items
			SET is_watched = true, watched_at = now(), watched_by = ${context.user.userId}
			WHERE id = ${data.queueItemId} AND group_id = ${data.groupId}
		`;

		return { success: true };
	});

export const unmarkWatched = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({ groupId: z.string().uuid(), queueItemId: z.string().uuid() }),
	)
	.handler(async ({ data, context }) => {
		await validateMembership(data.groupId, context.user.userId);

		// Get max position for re-adding to queue
		const [maxRow] = await sql`
			SELECT COALESCE(MAX(position), 0) AS max_pos
			FROM queue_items
			WHERE group_id = ${data.groupId} AND is_watched = false
		`;
		const newPosition = Number(maxRow.max_pos) + 1000;

		await sql`
			UPDATE queue_items
			SET is_watched = false, watched_at = NULL, watched_by = NULL, position = ${newPosition}
			WHERE id = ${data.queueItemId} AND group_id = ${data.groupId}
		`;

		return { success: true };
	});
