import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { createServerFn } from "@tanstack/react-start";
import { clearSession, useSession } from "@tanstack/react-start/server";
import type postgres from "postgres";
import { z } from "zod";
import { sql } from "../db/index";
import type { SessionData } from "../lib/session";
import { sessionConfig } from "../lib/session";
import { consumeChallenge, rpConfig, storeChallenge } from "../lib/webauthn";
import { authMiddleware } from "../middleware/auth";

// ─── Registration ───

export const getRegistrationOptions = createServerFn({ method: "POST" })
	.inputValidator(z.object({ username: z.string().min(1).max(32) }))
	.handler(async ({ data }) => {
		const { username } = data;

		// Check username availability
		const existing = await sql`
			SELECT id FROM users WHERE username = ${username}
		`;
		if (existing.length > 0) {
			throw new Error("Username already taken");
		}

		const options = await generateRegistrationOptions({
			rpName: rpConfig.rpName,
			rpID: rpConfig.rpID,
			userName: username,
			attestationType: "none",
			authenticatorSelection: {
				residentKey: "preferred",
				userVerification: "preferred",
			},
		});

		storeChallenge(`reg:${username}`, options.challenge);

		return options;
	});

export const verifyRegistration = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			username: z.string().min(1).max(32),
			credential: z.any(),
		}),
	)
	.handler(async ({ data }) => {
		const { username, credential } = data;

		const expectedChallenge = consumeChallenge(`reg:${username}`);
		if (!expectedChallenge) {
			throw new Error("Challenge expired or not found");
		}

		const verification = await verifyRegistrationResponse({
			response: credential,
			expectedChallenge,
			expectedOrigin: rpConfig.origin,
			expectedRPID: rpConfig.rpID,
		});

		if (!verification.verified || !verification.registrationInfo) {
			throw new Error("Registration verification failed");
		}

		const { credential: cred } = verification.registrationInfo;

		// Insert user and passkey in a transaction
		const user = await sql.begin(async (tx: postgres.TransactionSql) => {
			const [newUser] = await tx`
				INSERT INTO users (username) VALUES (${username})
				RETURNING id, username, created_at
			`;

			await tx`
				INSERT INTO passkeys (user_id, credential_id, public_key, counter, transports)
				VALUES (
					${newUser.id},
					${cred.id},
					${Buffer.from(cred.publicKey)},
					${cred.counter},
					${credential.response?.transports ?? []}
				)
			`;

			return newUser;
		});

		// Set session
		const session = await useSession<SessionData>(sessionConfig);
		await session.update({
			userId: user.id,
			username: user.username,
		});

		return { userId: user.id, username: user.username };
	});

// ─── Authentication ───

export const getAuthenticationOptions = createServerFn({ method: "POST" })
	.inputValidator(z.object({ username: z.string().min(1).max(32) }))
	.handler(async ({ data }) => {
		const { username } = data;

		// Look up user's passkeys
		const rows = await sql`
			SELECT p.credential_id, p.transports
			FROM passkeys p
			JOIN users u ON u.id = p.user_id
			WHERE u.username = ${username}
		`;

		if (rows.length === 0) {
			throw new Error("User not found");
		}

		const allowCredentials = rows.map((row) => ({
			id: row.credential_id,
			transports: row.transports ?? [],
		}));

		const options = await generateAuthenticationOptions({
			rpID: rpConfig.rpID,
			allowCredentials,
			userVerification: "preferred",
		});

		storeChallenge(`auth:${username}`, options.challenge);

		return options;
	});

export const verifyAuthentication = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			username: z.string().min(1).max(32),
			credential: z.any(),
		}),
	)
	.handler(async ({ data }) => {
		const { username, credential } = data;

		const expectedChallenge = consumeChallenge(`auth:${username}`);
		if (!expectedChallenge) {
			throw new Error("Challenge expired or not found");
		}

		// Find the passkey
		const [passkey] = await sql`
			SELECT p.id, p.credential_id, p.public_key, p.counter, p.transports, p.user_id, u.username
			FROM passkeys p
			JOIN users u ON u.id = p.user_id
			WHERE p.credential_id = ${credential.id}
			AND u.username = ${username}
		`;

		if (!passkey) {
			throw new Error("Passkey not found");
		}

		const verification = await verifyAuthenticationResponse({
			response: credential,
			expectedChallenge,
			expectedOrigin: rpConfig.origin,
			expectedRPID: rpConfig.rpID,
			credential: {
				id: passkey.credential_id,
				publicKey: new Uint8Array(passkey.public_key),
				counter: Number(passkey.counter),
				transports: passkey.transports ?? [],
			},
		});

		if (!verification.verified) {
			throw new Error("Authentication verification failed");
		}

		// Update counter
		await sql`
			UPDATE passkeys SET counter = ${verification.authenticationInfo.newCounter}
			WHERE id = ${passkey.id}
		`;

		// Set session
		const session = await useSession<SessionData>(sessionConfig);
		await session.update({
			userId: passkey.user_id,
			username: passkey.username,
		});

		return { userId: passkey.user_id, username: passkey.username };
	});

// ─── Session ───

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
	const session = await useSession<SessionData>(sessionConfig);
	const { userId, username } = session.data;

	if (!userId || !username) {
		return null;
	}

	const [user] = await sql`
		SELECT (settings).theme FROM users WHERE id = ${userId}
	`;

	return {
		userId,
		username,
		theme: (user?.theme as string) ?? "overworld",
	};
});

export const updateSettings = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		z.object({
			theme: z.enum(["overworld", "dungeon", "town", "battle"]),
		}),
	)
	.handler(async ({ data, context }) => {
		await sql`
			UPDATE users
			SET settings = ROW(${data.theme}::pixel_theme)::user_settings
			WHERE id = ${context.user.userId}
		`;
		return { success: true };
	});

export const logout = createServerFn({ method: "POST" }).handler(async () => {
	await clearSession(sessionConfig);
	return { success: true };
});
