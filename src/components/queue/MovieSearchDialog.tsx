import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { tmdbQueries } from "../../hooks/queries/tmdb";
import type { TmdbMovie } from "../../server/functions/tmdb";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { MovieSearchResult } from "./MovieSearchResult";

interface MovieSearchDialogProps {
	onAddMovie: (tmdbId: number) => Promise<void>;
	addedTmdbIds: Set<number>;
}

export function MovieSearchDialog({
	onAddMovie,
	addedTmdbIds,
}: MovieSearchDialogProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [addingId, setAddingId] = useState<number | null>(null);

	// Simple debounce via timeout
	const [debounceTimer, setDebounceTimer] = useState<ReturnType<
		typeof setTimeout
	> | null>(null);

	function handleQueryChange(value: string) {
		setQuery(value);
		if (debounceTimer) clearTimeout(debounceTimer);
		const timer = setTimeout(() => setDebouncedQuery(value), 300);
		setDebounceTimer(timer);
	}

	const { data: searchResults, isLoading } = useQuery(
		tmdbQueries.search(debouncedQuery),
	);

	async function handleAdd(tmdbId: number) {
		setAddingId(tmdbId);
		try {
			await onAddMovie(tmdbId);
		} finally {
			setAddingId(null);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="primary">Add Movie</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Search Movies</DialogTitle>
				</DialogHeader>

				<input
					type="text"
					value={query}
					onChange={(e) => handleQueryChange(e.target.value)}
					placeholder="Search for a movie..."
					className="pixel-border-sm font-pixel text-[11px] bg-[var(--px-bg-inset)] text-[var(--px-text-primary)] px-4 py-3 outline-none placeholder:text-[var(--px-text-disabled)] mb-3"
					autoFocus
				/>

				<div className="overflow-y-auto flex-1 -mx-2">
					{isLoading && debouncedQuery && (
						<p className="font-pixel text-[9px] text-[var(--px-text-disabled)] text-center py-4">
							Searching...
						</p>
					)}

					{searchResults?.results.map((movie: TmdbMovie) => (
						<MovieSearchResult
							key={movie.id}
							movie={movie}
							onAdd={handleAdd}
							isAdded={addedTmdbIds.has(movie.id)}
							isAdding={addingId === movie.id}
						/>
					))}

					{searchResults && searchResults.results.length === 0 && (
						<p className="font-pixel text-[9px] text-[var(--px-text-secondary)] text-center py-4">
							No movies found
						</p>
					)}

					{!debouncedQuery && (
						<p className="font-pixel text-[9px] text-[var(--px-text-disabled)] text-center py-4">
							Type to search TMDB
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
