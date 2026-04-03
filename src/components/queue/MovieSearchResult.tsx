import type { TmdbMovie } from "../../server/functions/tmdb";
import { posterUrl } from "../../server/lib/tmdb-client";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface MovieSearchResultProps {
	movie: TmdbMovie;
	onAdd: (tmdbId: number) => void;
	isAdded: boolean;
	isAdding: boolean;
	index?: number;
}

export function MovieSearchResult({
	movie,
	onAdd,
	isAdded,
	isAdding,
	index = 0,
}: MovieSearchResultProps) {
	const poster = posterUrl(movie.poster_path, "w154");
	const year = movie.release_date?.split("-")[0] ?? "Unknown";

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
					alt={movie.title}
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
					{movie.title}
				</p>
				<div className="flex gap-2 mt-1">
					<Badge variant="info">{year}</Badge>
					{movie.vote_average > 0 && (
						<Badge variant="warning">{movie.vote_average.toFixed(1)}</Badge>
					)}
				</div>
			</div>
			<Button
				variant={isAdded ? "default" : "primary"}
				size="sm"
				disabled={isAdded || isAdding}
				onClick={() => onAdd(movie.id)}
			>
				{isAdded ? "Added" : isAdding ? "..." : "Add"}
			</Button>
		</div>
	);
}
