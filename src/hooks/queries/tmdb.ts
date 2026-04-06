import { queryOptions } from "@tanstack/react-query";
import type { ContentType } from "../../lib/content-type";
import { getMediaDetails, searchMedia } from "../../server/functions/tmdb";

export const tmdbQueries = {
	search: (query: string, contentType: ContentType, page = 1) =>
		queryOptions({
			queryKey: ["tmdb", "search", contentType, query, page],
			queryFn: () => searchMedia({ data: { query, contentType, page } }),
			enabled: query.length > 0,
			staleTime: 10 * 60 * 1000,
		}),
	details: (tmdbId: number, contentType: ContentType) =>
		queryOptions({
			queryKey: ["tmdb", "details", contentType, tmdbId],
			queryFn: () => getMediaDetails({ data: { tmdbId, contentType } }),
			staleTime: 60 * 60 * 1000,
		}),
};
