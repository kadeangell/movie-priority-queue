import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { InviteCodeDisplay } from "../../components/groups/InviteCodeDisplay";
import { MovieSearchDialog } from "../../components/queue/MovieSearchDialog";
import { QueueList } from "../../components/queue/QueueList";
import { WatchedList } from "../../components/queue/WatchedList";
import { Badge } from "../../components/ui/badge";
import { PixelLink } from "../../components/ui/link";
import { groupQueries } from "../../hooks/queries/groups";
import { queueQueries } from "../../hooks/queries/queue";
import { useGroupActions } from "../../hooks/useGroupActions";
import { getMe } from "../../server/functions/auth";

export const Route = createFileRoute("/groups/$groupId")({
	beforeLoad: async () => {
		const user = await getMe();
		if (!user) {
			throw redirect({ to: "/login" });
		}
	},
	component: GroupDetailPage,
});

function GroupDetailPage() {
	const { groupId } = Route.useParams();
	const { data: group, isLoading: groupLoading } = useQuery(
		groupQueries.detail(groupId),
	);
	const { data: queueData, isLoading: queueLoading } = useQuery(
		queueQueries.items(groupId),
	);
	const actions = useGroupActions(groupId);

	const addedTmdbIds = useMemo(() => {
		const ids = new Set<number>();
		if (queueData?.queue) {
			for (const item of queueData.queue) {
				ids.add(Number(item.tmdb_id));
			}
		}
		if (queueData?.watched) {
			for (const item of queueData.watched) {
				ids.add(Number(item.tmdb_id));
			}
		}
		return ids;
	}, [queueData]);

	if (groupLoading || queueLoading) {
		return (
			<div
				className="min-h-screen flex items-center justify-center"
				style={{ backgroundColor: "var(--px-bg-base)" }}
			>
				<p className="font-pixel text-[10px] text-[var(--px-text-disabled)]">
					Loading...
				</p>
			</div>
		);
	}

	if (!group) {
		return (
			<div
				className="min-h-screen flex items-center justify-center"
				style={{ backgroundColor: "var(--px-bg-base)" }}
			>
				<p className="font-pixel text-[10px] text-[var(--px-status-hp)]">
					Group not found
				</p>
			</div>
		);
	}

	const queueItems = (queueData?.queue ?? []) as Array<{
		id: string;
		tmdb_id: number;
		position: number;
	}>;
	const watchedItems = (queueData?.watched ?? []) as Array<{
		id: string;
		tmdb_id: number;
		watched_at: string;
	}>;

	return (
		<div
			className="min-h-screen p-6"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<div className="max-w-3xl mx-auto">
				{/* Header */}
				<header className="mb-6">
					<div className="flex items-center gap-3 mb-3">
						<PixelLink to="/groups" variant="nav">
							← Back
						</PixelLink>
					</div>
					<h1 className="font-pixel text-[18px] text-[var(--px-text-primary)] mb-3">
						{group.name}
					</h1>
					<div className="flex flex-wrap items-center gap-4 mb-3">
						<InviteCodeDisplay code={group.invite_code} />
					</div>
					<div className="flex flex-wrap gap-2">
						{group.members.map((m: { id: string; username: string }) => (
							<Badge key={m.id} variant="info">
								{m.username}
							</Badge>
						))}
					</div>
				</header>

				{/* Queue */}
				<section className="pixel-border bg-[var(--px-bg-panel)] p-5 m-[6px] mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-pixel text-[14px] text-[var(--px-text-accent)]">
							Queue
						</h2>
						<MovieSearchDialog
							onAddMovie={actions.addMovie}
							addedTmdbIds={addedTmdbIds}
						/>
					</div>
					<QueueList
						items={queueItems}
						onReorder={actions.reorderMovie}
						onMarkWatched={actions.markWatched}
						onRemove={actions.removeMovie}
					/>
				</section>

				{/* Watched */}
				{watchedItems.length > 0 && (
					<section className="pixel-border bg-[var(--px-bg-panel)] p-5 m-[6px]">
						<WatchedList
							items={watchedItems}
							onUnmarkWatched={actions.unmarkWatched}
						/>
					</section>
				)}
			</div>
		</div>
	);
}
