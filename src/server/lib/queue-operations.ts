import { sql } from "../db/index";

export async function validateMembership(
	groupId: string,
	userId: string,
): Promise<void> {
	const [row] = await sql`
		SELECT 1 FROM group_members
		WHERE group_id = ${groupId} AND user_id = ${userId}
	`;
	if (!row) throw new Error("Not a member of this group");
}

export async function fetchQueueItems(groupId: string) {
	const queue = await sql`
		SELECT id, group_id, tmdb_id, added_by, position, created_at
		FROM queue_items
		WHERE group_id = ${groupId} AND is_watched = false
		ORDER BY position ASC
	`;

	const watched = await sql`
		SELECT id, group_id, tmdb_id, added_by, watched_at, watched_by, created_at
		FROM queue_items
		WHERE group_id = ${groupId} AND is_watched = true
		ORDER BY watched_at DESC
	`;

	return { queue, watched };
}

export async function executeAddMovie(
	groupId: string,
	tmdbId: number,
	userId: string,
) {
	const [maxRow] = await sql`
		SELECT COALESCE(MAX(position), 0) AS max_pos
		FROM queue_items
		WHERE group_id = ${groupId} AND is_watched = false
	`;
	const newPosition = Number(maxRow.max_pos) + 1000;

	const [item] = await sql`
		INSERT INTO queue_items (group_id, tmdb_id, added_by, position)
		VALUES (${groupId}, ${tmdbId}, ${userId}, ${newPosition})
		ON CONFLICT (group_id, tmdb_id) DO NOTHING
		RETURNING id, group_id, tmdb_id, added_by, position, created_at
	`;

	if (!item) {
		throw new Error("Movie already in queue");
	}

	return item;
}

export async function executeRemoveMovie(groupId: string, queueItemId: string) {
	await sql`
		DELETE FROM queue_items
		WHERE id = ${queueItemId} AND group_id = ${groupId}
	`;
	return { success: true as const };
}

export async function executeReorderMovie(
	groupId: string,
	queueItemId: string,
	newPosition: number,
) {
	await sql`
		UPDATE queue_items
		SET position = ${newPosition}
		WHERE id = ${queueItemId} AND group_id = ${groupId}
	`;

	// Check if reindex is needed
	const items = await sql`
		SELECT id, position FROM queue_items
		WHERE group_id = ${groupId} AND is_watched = false
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

	return { success: true as const };
}

export async function executeMarkWatched(
	groupId: string,
	queueItemId: string,
	userId: string,
) {
	await sql`
		UPDATE queue_items
		SET is_watched = true, watched_at = now(), watched_by = ${userId}
		WHERE id = ${queueItemId} AND group_id = ${groupId}
	`;
	return { success: true as const };
}

export async function executeUnmarkWatched(
	groupId: string,
	queueItemId: string,
) {
	const [maxRow] = await sql`
		SELECT COALESCE(MAX(position), 0) AS max_pos
		FROM queue_items
		WHERE group_id = ${groupId} AND is_watched = false
	`;
	const newPosition = Number(maxRow.max_pos) + 1000;

	await sql`
		UPDATE queue_items
		SET is_watched = false, watched_at = NULL, watched_by = NULL, position = ${newPosition}
		WHERE id = ${queueItemId} AND group_id = ${groupId}
	`;
	return { success: true as const };
}
