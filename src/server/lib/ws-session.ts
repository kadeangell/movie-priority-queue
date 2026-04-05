import type { IncomingMessage } from "node:http";
import { parse as parseCookie } from "cookie-es";
import * as iron from "iron-webcrypto";
import { sessionConfig } from "./session";

interface SessionPayload {
	id: string;
	createdAt: number;
	data: {
		userId?: string;
		username?: string;
	};
}

export async function parseSessionFromUpgrade(
	req: IncomingMessage,
): Promise<{ userId: string; username: string } | null> {
	const cookieHeader = req.headers.cookie;
	if (!cookieHeader) return null;

	const cookies = parseCookie(cookieHeader);
	const sealed = cookies[sessionConfig.name ?? "mpq-session"];
	if (!sealed) return null;

	try {
		const unsealed = (await iron.unseal(
			sealed,
			sessionConfig.password,
			iron.defaults,
		)) as SessionPayload;

		const data = unsealed?.data;
		if (!data?.userId || !data?.username) return null;

		return { userId: data.userId, username: data.username };
	} catch {
		return null;
	}
}
