import type { ContentType } from "../../lib/content-type";
import { MediaSearchDialog } from "./MediaSearchDialog";
import { QueueList } from "./QueueList";
import { WatchedList } from "./WatchedList";

interface QueueEntry {
	id: string;
	tmdb_id: number;
	position: number;
}

interface WatchedEntry {
	id: string;
	tmdb_id: number;
	watched_at: string;
}

interface QueueSectionProps {
	title: string;
	contentType: ContentType;
	queueItems: QueueEntry[];
	watchedItems: WatchedEntry[];
	addedTmdbIds: Set<number>;
	onAdd: (tmdbId: number) => Promise<void>;
	onReorder: (itemId: string, newPosition: number) => void;
	onMarkWatched: (itemId: string) => void;
	onRemove: (itemId: string) => void;
	onUnmarkWatched: (itemId: string) => void;
}

export function QueueSection({
	title,
	contentType,
	queueItems,
	watchedItems,
	addedTmdbIds,
	onAdd,
	onReorder,
	onMarkWatched,
	onRemove,
	onUnmarkWatched,
}: QueueSectionProps) {
	return (
		<>
			<section className="pixel-border bg-[var(--px-bg-panel)] p-5 m-[6px] mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="font-pixel text-[14px] text-[var(--px-text-accent)]">
						{title}
					</h2>
					<MediaSearchDialog
						contentType={contentType}
						onAdd={onAdd}
						addedTmdbIds={addedTmdbIds}
					/>
				</div>
				<QueueList
					items={queueItems}
					contentType={contentType}
					onReorder={onReorder}
					onMarkWatched={onMarkWatched}
					onRemove={onRemove}
				/>
			</section>

			{watchedItems.length > 0 && (
				<section className="pixel-border bg-[var(--px-bg-panel)] p-5 m-[6px] mb-6">
					<WatchedList
						items={watchedItems}
						contentType={contentType}
						onUnmarkWatched={onUnmarkWatched}
					/>
				</section>
			)}
		</>
	);
}
