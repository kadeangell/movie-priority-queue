import { queryOptions } from "@tanstack/react-query";
import { getMovieDetails, searchMovies } from "../../server/functions/tmdb";

export const tmdbQueries = {
	search: (query: string, page = 1) =>
		queryOptions({
			queryKey: ["tmdb", "search", query, page],
			queryFn: () => searchMovies({ data: { query, page } }),
			enabled: query.length > 0,
			staleTime: 10 * 60 * 1000,
		}),
	details: (tmdbId: number) =>
		queryOptions({
			queryKey: ["tmdb", "movie", tmdbId],
			queryFn: () => getMovieDetails({ data: { tmdbId } }),
			staleTime: 60 * 60 * 1000,
		}),
};
