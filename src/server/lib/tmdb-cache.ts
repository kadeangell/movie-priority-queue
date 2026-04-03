interface CacheEntry {
	data: unknown;
	expiresAt: number;
}

const MAX_ENTRIES = 500;
const cache = new Map<string, CacheEntry>();

function evictExpired(): void {
	const now = Date.now();
	for (const [key, entry] of cache) {
		if (entry.expiresAt < now) {
			cache.delete(key);
		}
	}
}

function evictOldest(): void {
	if (cache.size <= MAX_ENTRIES) return;
	// Delete the first (oldest) entry
	const firstKey = cache.keys().next().value;
	if (firstKey !== undefined) {
		cache.delete(firstKey);
	}
}

export function cacheGet<T>(key: string): T | null {
	const entry = cache.get(key);
	if (!entry) return null;
	if (entry.expiresAt < Date.now()) {
		cache.delete(key);
		return null;
	}
	return entry.data as T;
}

export function cacheSet(key: string, data: unknown, ttlMs: number): void {
	evictExpired();
	evictOldest();
	cache.set(key, {
		data,
		expiresAt: Date.now() + ttlMs,
	});
}
