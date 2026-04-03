import type { SessionConfig } from "@tanstack/react-start/server";

export interface SessionData {
	userId: string;
	username: string;
}

export const sessionConfig: SessionConfig = {
	password:
		process.env.SESSION_SECRET ?? "dev-secret-key-that-is-at-least-32-chars",
	name: "mpq-session",
	maxAge: 60 * 60 * 24 * 30, // 30 days
	cookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
	},
};
