const TMDB_BASE = "https://api.themoviedb.org/3";

function getApiKey(): string {
	const key = process.env.TMDB_API_KEY;
	if (!key) {
		throw new Error("TMDB_API_KEY environment variable is required");
	}
	return key;
}

export async function tmdbFetch<T>(
	path: string,
	params: Record<string, string> = {},
): Promise<T> {
	const url = new URL(`${TMDB_BASE}${path}`);
	url.searchParams.set("api_key", getApiKey());
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}

	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(
			`TMDB API error: ${response.status} ${response.statusText}`,
		);
	}

	return response.json() as Promise<T>;
}

export function posterUrl(path: string | null, size = "w342"): string | null {
	if (!path) return null;
	return `https://image.tmdb.org/t/p/${size}${path}`;
}
