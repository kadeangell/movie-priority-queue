import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ContentType } from "../../lib/content-type";
import { cacheGet, cacheSet } from "../lib/tmdb-cache";
import { tmdbFetch } from "../lib/tmdb-client";

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// ─── Raw TMDB types ───

interface TmdbSearchResult<T> {
	page: number;
	total_pages: number;
	total_results: number;
	results: T[];
}

interface TmdbMovie {
	id: number;
	title: string;
	overview: string;
	poster_path: string | null;
	release_date: string;
	vote_average: number;
	genre_ids: number[];
}

interface TmdbMovieDetails {
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

interface TmdbTvShow {
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	first_air_date: string;
	vote_average: number;
	genre_ids: number[];
}

interface TmdbTvShowDetails {
	id: number;
	name: string;
	overview: string;
	poster_path: string | null;
	backdrop_path: string | null;
	first_air_date: string;
	number_of_seasons: number | null;
	vote_average: number;
	genres: { id: number; name: string }[];
}

// ─── Normalized types (used by UI) ───

export interface MediaItem {
	id: number;
	title: string;
	overview: string;
	posterPath: string | null;
	releaseDate: string;
	voteAverage: number;
}

export interface MediaDetails {
	id: number;
	title: string;
	overview: string;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string;
	runtime: number | null;
	numberOfSeasons: number | null;
	voteAverage: number;
	genres: { id: number; name: string }[];
}

// ─── Normalizers ───

function normalizeMovie(m: TmdbMovie): MediaItem {
	return {
		id: m.id,
		title: m.title,
		overview: m.overview,
		posterPath: m.poster_path,
		releaseDate: m.release_date,
		voteAverage: m.vote_average,
	};
}

function normalizeTvShow(t: TmdbTvShow): MediaItem {
	return {
		id: t.id,
		title: t.name,
		overview: t.overview,
		posterPath: t.poster_path,
		releaseDate: t.first_air_date,
		voteAverage: t.vote_average,
	};
}

function normalizeMovieDetails(m: TmdbMovieDetails): MediaDetails {
	return {
		id: m.id,
		title: m.title,
		overview: m.overview,
		posterPath: m.poster_path,
		backdropPath: m.backdrop_path,
		releaseDate: m.release_date,
		runtime: m.runtime,
		numberOfSeasons: null,
		voteAverage: m.vote_average,
		genres: m.genres,
	};
}

function normalizeTvShowDetails(t: TmdbTvShowDetails): MediaDetails {
	return {
		id: t.id,
		title: t.name,
		overview: t.overview,
		posterPath: t.poster_path,
		backdropPath: t.backdrop_path,
		releaseDate: t.first_air_date,
		runtime: null,
		numberOfSeasons: t.number_of_seasons,
		voteAverage: t.vote_average,
		genres: t.genres,
	};
}

// ─── Server functions ───

export const searchMedia = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			query: z.string().min(1),
			contentType: z.enum(["movie", "tv"]),
			page: z.number().int().min(1).max(500).optional(),
		}),
	)
	.handler(async ({ data }) => {
		const page = data.page ?? 1;
		const cacheKey = `search:${data.contentType}:${data.query}:${page}`;

		const cached = cacheGet<{ items: MediaItem[]; totalPages: number }>(
			cacheKey,
		);
		if (cached) return cached;

		if (data.contentType === "movie") {
			const raw = await tmdbFetch<TmdbSearchResult<TmdbMovie>>(
				"/search/movie",
				{ query: data.query, page: String(page) },
			);
			const result = {
				items: raw.results.map(normalizeMovie),
				totalPages: raw.total_pages,
			};
			cacheSet(cacheKey, result, TEN_MINUTES);
			return result;
		}

		const raw = await tmdbFetch<TmdbSearchResult<TmdbTvShow>>("/search/tv", {
			query: data.query,
			page: String(page),
		});
		const result = {
			items: raw.results.map(normalizeTvShow),
			totalPages: raw.total_pages,
		};
		cacheSet(cacheKey, result, TEN_MINUTES);
		return result;
	});

export const getMediaDetails = createServerFn({ method: "GET" })
	.inputValidator(
		z.object({
			tmdbId: z.number().int(),
			contentType: z.enum(["movie", "tv"]),
		}),
	)
	.handler(async ({ data }) => {
		const cacheKey = `details:${data.contentType}:${data.tmdbId}`;

		const cached = cacheGet<MediaDetails>(cacheKey);
		if (cached) return cached;

		if (data.contentType === "movie") {
			const raw = await tmdbFetch<TmdbMovieDetails>(
				`/movie/${data.tmdbId}`,
			);
			const result = normalizeMovieDetails(raw);
			cacheSet(cacheKey, result, ONE_HOUR);
			return result;
		}

		const raw = await tmdbFetch<TmdbTvShowDetails>(`/tv/${data.tmdbId}`);
		const result = normalizeTvShowDetails(raw);
		cacheSet(cacheKey, result, ONE_HOUR);
		return result;
	});
