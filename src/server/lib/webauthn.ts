export const rpConfig = {
	rpName: process.env.WEBAUTHN_RP_NAME ?? "Movie Priority Queue",
	rpID: process.env.WEBAUTHN_RP_ID ?? "localhost",
	origin: process.env.WEBAUTHN_ORIGIN ?? "http://localhost:4000",
};

// In-memory challenge store with TTL
// Sufficient for single-server deployment
interface StoredChallenge {
	challenge: string;
	expiresAt: number;
}

const challenges = new Map<string, StoredChallenge>();

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function storeChallenge(key: string, challenge: string): void {
	// Lazy cleanup of expired entries
	const now = Date.now();
	for (const [k, v] of challenges) {
		if (v.expiresAt < now) {
			challenges.delete(k);
		}
	}

	challenges.set(key, {
		challenge,
		expiresAt: now + CHALLENGE_TTL_MS,
	});
}

export function consumeChallenge(key: string): string | null {
	const stored = challenges.get(key);
	if (!stored) return null;

	challenges.delete(key);

	if (stored.expiresAt < Date.now()) return null;

	return stored.challenge;
}
