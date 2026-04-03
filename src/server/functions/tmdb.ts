import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cacheGet, cacheSet } from "../lib/tmdb-cache";
import { tmdbFetch } from "../lib/tmdb-client";

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

interface TmdbSearchResult {
	page: number;
	total_pages: number;
	total_results: number;
	results: TmdbMovie[];
}

export interface TmdbMovie {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	release_date: string;
	vote_average: number;
	genre_ids: number[];
}

export interface TmdbMovieDetails {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	release_date: string;
	runtime: number | null;
	vote_average: number;
	genres: { id: number; name: string }[];
}

export const searchMovies = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			query: z.string().min(1),
			page: z.number().int().min(1).max(500).optional(),
		}),
	)
	.handler(async ({ data }) => {
		const page = data.page ?? 1;
		const cacheKey = `search:${data.query}:${page}`;

		const cached = cacheGet<TmdbSearchResult>(cacheKey);
		if (cached) return cached;

		const result = await tmdbFetch<TmdbSearchResult>("/search/movie", {
			query: data.query,
			page: String(page),
		});

		cacheSet(cacheKey, result, TEN_MINUTES);
		return result;
	});

export const getMovieDetails = createServerFn({ method: "GET" })
	.inputValidator(z.object({ tmdbId: z.number().int() }))
	.handler(async ({ data }) => {
		const cacheKey = `movie:${data.tmdbId}`;

		const cached = cacheGet<TmdbMovieDetails>(cacheKey);
		if (cached) return cached;

		const result = await tmdbFetch<TmdbMovieDetails>(`/movie/${data.tmdbId}`);

		cacheSet(cacheKey, result, ONE_HOUR);
		return result;
	});
