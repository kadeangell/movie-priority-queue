import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { tmdbQueries } from "../../hooks/queries/tmdb";
import { posterUrl } from "../../server/lib/tmdb-client";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface QueueItemProps {
	id: string;
	tmdbId: number;
	position: number;
	index: number;
	onMarkWatched: (id: string) => void;
	onRemove: (id: string) => void;
}

export function QueueItem({
	id,
	tmdbId,
	index,
	onMarkWatched,
	onRemove,
}: QueueItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		animation: transform
			? undefined
			: `pixel-slide-down 200ms var(--ease-pixel-spring) ${index * 30}ms both`,
	};

	const { data: movie } = useQuery(tmdbQueries.details(tmdbId));

	const poster = movie ? posterUrl(movie.poster_path, "w92") : null;
	const year = movie?.release_date?.split("-")[0] ?? "";

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex items-center gap-3 bg-[var(--px-bg-panel)] hover:bg-[var(--px-bg-panel-alt)] p-3 transition-colors duration-100"
		>
			{/* Drag handle */}
			<button
				type="button"
				className="font-pixel text-[10px] text-[var(--px-text-disabled)] cursor-grab active:cursor-grabbing px-1 touch-none"
				{...attributes}
				{...listeners}
			>
				⠿
			</button>

			{/* Position number */}
			<span className="font-pixel text-[10px] text-[var(--px-text-secondary)] w-6 text-right">
				{index + 1}
			</span>

			{/* Poster */}
			{poster ? (
				<img
					src={poster}
					alt={movie?.title ?? ""}
					className="w-8 h-12 object-cover flex-shrink-0"
					style={{ imageRendering: "auto" }}
				/>
			) : (
				<div className="w-8 h-12 bg-[var(--px-bg-inset)] flex-shrink-0" />
			)}

			{/* Title + meta */}
			<div className="flex-1 min-w-0">
				<p className="font-pixel text-[10px] text-[var(--px-text-primary)] truncate">
					{movie?.title ?? "Loading..."}
				</p>
				{year && (
					<span className="font-pixel text-[7px] text-[var(--px-text-disabled)]">
						{year}
					</span>
				)}
			</div>

			{/* Actions */}
			<div className="flex gap-1 flex-shrink-0">
				<Button variant="primary" size="sm" onClick={() => onMarkWatched(id)}>
					✓
				</Button>
				<Button variant="ghost" size="sm" onClick={() => onRemove(id)}>
					✕
				</Button>
			</div>
		</div>
	);
}
