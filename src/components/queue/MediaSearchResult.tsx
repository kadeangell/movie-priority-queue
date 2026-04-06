import type { MediaItem } from "../../server/functions/tmdb";
import { posterUrl } from "../../server/lib/tmdb-client";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface MediaSearchResultProps {
	item: MediaItem;
	onAdd: (tmdbId: number) => void;
	isAdded: boolean;
	isAdding: boolean;
	index?: number;
}

export function MediaSearchResult({
	item,
	onAdd,
	isAdded,
	isAdding,
	index = 0,
}: MediaSearchResultProps) {
	const poster = posterUrl(item.posterPath, "w154");
	const year = item.releaseDate?.split("-")[0] ?? "Unknown";

	return (
		<div
			className="flex gap-3 p-3 hover:bg-[var(--px-bg-panel-alt)] transition-colors duration-100"
			style={{
				animation: `pixel-slide-up 250ms var(--ease-pixel-spring) ${index * 40}ms both`,
			}}
		>
			{poster ? (
				<img
					src={poster}
					alt={item.title}
					className="w-12 h-18 object-cover flex-shrink-0"
					style={{ imageRendering: "auto" }}
				/>
			) : (
				<div className="w-12 h-18 bg-[var(--px-bg-inset)] flex-shrink-0 flex items-center justify-center">
					<span className="font-pixel text-[6px] text-[var(--px-text-disabled)]">
						No img
					</span>
				</div>
			)}
			<div className="flex-1 min-w-0">
				<p className="font-pixel text-[10px] text-[var(--px-text-primary)] truncate">
					{item.title}
				</p>
				<div className="flex gap-2 mt-1">
					<Badge variant="info">{year}</Badge>
					{item.voteAverage > 0 && (
						<Badge variant="warning">{item.voteAverage.toFixed(1)}</Badge>
					)}
				</div>
			</div>
			<Button
				variant={isAdded ? "default" : "primary"}
				size="sm"
				disabled={isAdded || isAdding}
				onClick={() => onAdd(item.id)}
			>
				{isAdded ? "Added" : isAdding ? "..." : "Add"}
			</Button>
		</div>
	);
}
