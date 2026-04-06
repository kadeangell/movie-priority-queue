import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { tmdbQueries } from "../../hooks/queries/tmdb";
import type { ContentType } from "../../lib/content-type";
import type { MediaItem } from "../../server/functions/tmdb";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { MediaSearchResult } from "./MediaSearchResult";

interface MediaSearchDialogProps {
	contentType: ContentType;
	onAdd: (tmdbId: number) => Promise<void>;
	addedTmdbIds: Set<number>;
}

export function MediaSearchDialog({
	contentType,
	onAdd,
	addedTmdbIds,
}: MediaSearchDialogProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [addingId, setAddingId] = useState<number | null>(null);

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
		tmdbQueries.search(debouncedQuery, contentType),
	);

	async function handleAdd(tmdbId: number) {
		setAddingId(tmdbId);
		try {
			await onAdd(tmdbId);
		} finally {
			setAddingId(null);
		}
	}

	const label = contentType === "movie" ? "Movie" : "TV Show";

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="primary">Add {label}</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Search {label}s</DialogTitle>
				</DialogHeader>

				<input
					type="text"
					value={query}
					onChange={(e) => handleQueryChange(e.target.value)}
					placeholder={`Search for a ${label.toLowerCase()}...`}
					className="pixel-border-sm font-pixel text-[11px] bg-[var(--px-bg-inset)] text-[var(--px-text-primary)] px-4 py-3 outline-none placeholder:text-[var(--px-text-disabled)] mb-3"
					autoFocus
				/>

				<div className="overflow-y-auto flex-1 -mx-2">
					{isLoading && debouncedQuery && (
						<p className="font-pixel text-[9px] text-[var(--px-text-disabled)] text-center py-4">
							Searching...
						</p>
					)}

					{searchResults?.items.map((item: MediaItem, i: number) => (
						<MediaSearchResult
							key={item.id}
							item={item}
							onAdd={handleAdd}
							isAdded={addedTmdbIds.has(item.id)}
							isAdding={addingId === item.id}
							index={i}
						/>
					))}

					{searchResults && searchResults.items.length === 0 && (
						<p className="font-pixel text-[9px] text-[var(--px-text-secondary)] text-center py-4">
							No {label.toLowerCase()}s found
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
