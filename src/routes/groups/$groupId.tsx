import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { InviteCodeDisplay } from "../../components/groups/InviteCodeDisplay";
import { QueueSection } from "../../components/queue/QueueSection";
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
	const { data: movieData, isLoading: movieLoading } = useQuery(
		queueQueries.items(groupId, "movie"),
	);
	const { data: tvData, isLoading: tvLoading } = useQuery(
		queueQueries.items(groupId, "tv"),
	);
	const actions = useGroupActions(groupId);

	const movieAddedIds = useMemo(() => {
		const ids = new Set<number>();
		for (const item of movieData?.queue ?? []) ids.add(Number(item.tmdb_id));
		for (const item of movieData?.watched ?? []) ids.add(Number(item.tmdb_id));
		return ids;
	}, [movieData]);

	const tvAddedIds = useMemo(() => {
		const ids = new Set<number>();
		for (const item of tvData?.queue ?? []) ids.add(Number(item.tmdb_id));
		for (const item of tvData?.watched ?? []) ids.add(Number(item.tmdb_id));
		return ids;
	}, [tvData]);

	if (groupLoading || movieLoading || tvLoading) {
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

	const movieQueue = (movieData?.queue ?? []) as Array<{
		id: string;
		tmdb_id: number;
		position: number;
	}>;
	const movieWatched = (movieData?.watched ?? []) as Array<{
		id: string;
		tmdb_id: number;
		watched_at: string;
	}>;
	const tvQueue = (tvData?.queue ?? []) as Array<{
		id: string;
		tmdb_id: number;
		position: number;
	}>;
	const tvWatched = (tvData?.watched ?? []) as Array<{
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

				<QueueSection
					title="Movies"
					contentType="movie"
					queueItems={movieQueue}
					watchedItems={movieWatched}
					addedTmdbIds={movieAddedIds}
					onAdd={(tmdbId) => actions.addItem(tmdbId, "movie")}
					onReorder={(id, pos) => actions.reorderItem(id, pos, "movie")}
					onMarkWatched={(id) => actions.markWatched(id, "movie")}
					onRemove={(id) => actions.removeItem(id, "movie")}
					onUnmarkWatched={(id) => actions.unmarkWatched(id, "movie")}
				/>

				<QueueSection
					title="TV Shows"
					contentType="tv"
					queueItems={tvQueue}
					watchedItems={tvWatched}
					addedTmdbIds={tvAddedIds}
					onAdd={(tmdbId) => actions.addItem(tmdbId, "tv")}
					onReorder={(id, pos) => actions.reorderItem(id, pos, "tv")}
					onMarkWatched={(id) => actions.markWatched(id, "tv")}
					onRemove={(id) => actions.removeItem(id, "tv")}
					onUnmarkWatched={(id) => actions.unmarkWatched(id, "tv")}
				/>
			</div>
		</div>
	);
}
