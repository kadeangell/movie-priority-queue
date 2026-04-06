import type { DragEndEvent } from "@dnd-kit/core";
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ContentType } from "../../lib/content-type";
import { QueueItem } from "./QueueItem";

interface QueueEntry {
	id: string;
	tmdb_id: number;
	position: number;
}

interface QueueListProps {
	items: QueueEntry[];
	contentType: ContentType;
	onReorder: (itemId: string, newPosition: number) => void;
	onMarkWatched: (itemId: string) => void;
	onRemove: (itemId: string) => void;
}

export function QueueList({
	items,
	contentType,
	onReorder,
	onMarkWatched,
	onRemove,
}: QueueListProps) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeIndex = items.findIndex((i) => i.id === active.id);
		const overIndex = items.findIndex((i) => i.id === over.id);

		if (activeIndex === -1 || overIndex === -1) return;

		// Calculate new position
		let newPosition: number;
		if (overIndex === 0) {
			// Dropped at the top
			newPosition = Math.floor(items[0].position / 2);
		} else if (overIndex === items.length - 1) {
			// Dropped at the bottom
			newPosition = items[items.length - 1].position + 1000;
		} else if (activeIndex < overIndex) {
			// Moved down: place between over and over+1
			newPosition = Math.floor(
				(items[overIndex].position + items[overIndex + 1].position) / 2,
			);
		} else {
			// Moved up: place between over-1 and over
			newPosition = Math.floor(
				(items[overIndex - 1].position + items[overIndex].position) / 2,
			);
		}

		onReorder(String(active.id), newPosition);
	}

	if (items.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="font-pixel text-[10px] text-[var(--px-text-secondary)]">
					Queue is empty
				</p>
				<p className="font-pixel text-[8px] text-[var(--px-text-disabled)] mt-1">
					Add {contentType === "movie" ? "movies" : "TV shows"} to get started
				</p>
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={items.map((i) => i.id)}
				strategy={verticalListSortingStrategy}
			>
				<div className="flex flex-col gap-1">
					{items.map((item, index) => (
						<QueueItem
							key={item.id}
							id={item.id}
							tmdbId={item.tmdb_id}
							contentType={contentType}
							position={item.position}
							index={index}
							onMarkWatched={onMarkWatched}
							onRemove={onRemove}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
}
