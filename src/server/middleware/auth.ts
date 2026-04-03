import { createMiddleware } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import type { SessionData } from "../lib/session";
import { sessionConfig } from "../lib/session";

export const authMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const session = await useSession<SessionData>(sessionConfig);
		const { userId, username } = session.data;

		if (!userId || !username) {
			throw new Error("Unauthorized");
		}

		return next({
			context: {
				user: { userId, username },
				session,
			},
		});
	},
);
