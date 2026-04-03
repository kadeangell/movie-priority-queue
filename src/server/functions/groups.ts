import { createServerFn } from "@tanstack/react-start";
import type postgres from "postgres";
import { z } from "zod";
import { sql } from "../db/index";
import { generateInviteCode } from "../lib/invite-code";
import { authMiddleware } from "../middleware/auth";

export const createGroup = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ name: z.string().min(1).max(100) }))
	.handler(async ({ data, context }) => {
		const { user } = context;

		// Generate unique invite code (retry on collision)
		let inviteCode = generateInviteCode();
		let retries = 5;
		while (retries > 0) {
			const existing =
				await sql`SELECT id FROM groups WHERE invite_code = ${inviteCode}`;
			if (existing.length === 0) break;
			inviteCode = generateInviteCode();
			retries--;
		}
		if (retries === 0) {
			throw new Error("Could not generate unique invite code");
		}

		const group = await sql.begin(async (tx: postgres.TransactionSql) => {
			const [newGroup] = await tx`
				INSERT INTO groups (name, invite_code, created_by)
				VALUES (${data.name}, ${inviteCode}, ${user.userId})
				RETURNING id, name, invite_code, created_by, created_at
			`;

			await tx`
				INSERT INTO group_members (group_id, user_id)
				VALUES (${newGroup.id}, ${user.userId})
			`;

			return newGroup;
		});

		return group;
	});

export const listMyGroups = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const { user } = context;

		const groups = await sql`
			SELECT g.id, g.name, g.invite_code, g.created_at,
				(SELECT count(*) FROM group_members gm2 WHERE gm2.group_id = g.id) AS member_count
			FROM groups g
			JOIN group_members gm ON gm.group_id = g.id
			WHERE gm.user_id = ${user.userId}
			ORDER BY g.created_at DESC
		`;

		return groups;
	});

export const getGroup = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ groupId: z.string().uuid() }))
	.handler(async ({ data, context }) => {
		const { user } = context;

		// Validate membership
		const [membership] = await sql`
			SELECT 1 FROM group_members
			WHERE group_id = ${data.groupId} AND user_id = ${user.userId}
		`;
		if (!membership) {
			throw new Error("Not a member of this group");
		}

		const [group] = await sql`
			SELECT id, name, invite_code, created_by, created_at
			FROM groups WHERE id = ${data.groupId}
		`;
		if (!group) {
			throw new Error("Group not found");
		}

		const members = await sql`
			SELECT u.id, u.username, gm.joined_at
			FROM group_members gm
			JOIN users u ON u.id = gm.user_id
			WHERE gm.group_id = ${data.groupId}
			ORDER BY gm.joined_at
		`;

		return { ...group, members };
	});

export const joinGroup = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ inviteCode: z.string().length(6) }))
	.handler(async ({ data, context }) => {
		const { user } = context;

		const [group] =
			await sql`SELECT id, name FROM groups WHERE invite_code = ${data.inviteCode.toUpperCase()}`;
		if (!group) {
			throw new Error("Invalid invite code");
		}

		// Check if already a member
		const [existing] = await sql`
			SELECT 1 FROM group_members
			WHERE group_id = ${group.id} AND user_id = ${user.userId}
		`;
		if (existing) {
			return group; // Already a member, just return the group
		}

		await sql`
			INSERT INTO group_members (group_id, user_id)
			VALUES (${group.id}, ${user.userId})
		`;

		return group;
	});

export const leaveGroup = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ groupId: z.string().uuid() }))
	.handler(async ({ data, context }) => {
		const { user } = context;

		await sql`
			DELETE FROM group_members
			WHERE group_id = ${data.groupId} AND user_id = ${user.userId}
		`;

		return { success: true };
	});
