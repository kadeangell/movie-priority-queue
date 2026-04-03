import { useQuery } from "@tanstack/react-query";
import { tmdbQueries } from "../../hooks/queries/tmdb";
import { posterUrl } from "../../server/lib/tmdb-client";
import { Button } from "../ui/button";

interface WatchedEntry {
	id: string;
	tmdb_id: number;
	watched_at: string;
}

interface WatchedListProps {
	items: WatchedEntry[];
	onUnmarkWatched: (id: string) => void;
}

function WatchedItem({
	item,
	onUnmarkWatched,
	index = 0,
}: {
	item: WatchedEntry;
	onUnmarkWatched: (id: string) => void;
	index?: number;
}) {
	const { data: movie } = useQuery(tmdbQueries.details(item.tmdb_id));
	const poster = movie ? posterUrl(movie.poster_path, "w92") : null;

	return (
		<div
			className="flex items-center gap-3 p-2 opacity-70 hover:opacity-100 transition-opacity"
			style={{
				animation: `pixel-slide-up 200ms var(--ease-pixel-spring) ${index * 30}ms both`,
			}}
		>
			{poster ? (
				<img
					src={poster}
					alt={movie?.title ?? ""}
					className="w-6 h-9 object-cover flex-shrink-0"
					style={{ imageRendering: "auto" }}
				/>
			) : (
				<div className="w-6 h-9 bg-[var(--px-bg-inset)] flex-shrink-0" />
			)}
			<span className="font-pixel text-[9px] text-[var(--px-text-secondary)] flex-1 truncate">
				{movie?.title ?? "Loading..."}
			</span>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => onUnmarkWatched(item.id)}
			>
				↩
			</Button>
		</div>
	);
}

export function WatchedList({ items, onUnmarkWatched }: WatchedListProps) {
	if (items.length === 0) return null;

	return (
		<div>
			<h3 className="font-pixel text-[10px] text-[var(--px-text-secondary)] uppercase tracking-widest mb-2">
				Watched ({items.length})
			</h3>
			<div className="flex flex-col">
				{items.map((item, i) => (
					<WatchedItem
						key={item.id}
						item={item}
						onUnmarkWatched={onUnmarkWatched}
						index={i}
					/>
				))}
			</div>
		</div>
	);
}
