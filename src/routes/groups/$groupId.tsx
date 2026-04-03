import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { InviteCodeDisplay } from "../../components/groups/InviteCodeDisplay";
import { Badge } from "../../components/ui/badge";
import { groupQueries } from "../../hooks/queries/groups";

export const Route = createFileRoute("/groups/$groupId")({
	component: GroupDetailPage,
});

function GroupDetailPage() {
	const { groupId } = Route.useParams();
	const { data: group, isLoading } = useQuery(groupQueries.detail(groupId));

	if (isLoading) {
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

	return (
		<div
			className="min-h-screen p-6"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<div className="max-w-3xl mx-auto">
				<header className="mb-8">
					<h1 className="font-pixel text-[18px] text-[var(--px-text-primary)] mb-3">
						{group.name}
					</h1>
					<div className="flex flex-wrap items-center gap-4 mb-4">
						<InviteCodeDisplay code={group.invite_code} />
					</div>
					<div className="flex flex-wrap gap-2">
						{group.members.map(
							(m: { id: string; username: string; joined_at: string }) => (
								<Badge key={m.id} variant="info">
									{m.username}
								</Badge>
							),
						)}
					</div>
				</header>

				<section className="pixel-border bg-[var(--px-bg-panel)] p-6 m-[6px]">
					<h2 className="font-pixel text-[14px] text-[var(--px-text-accent)] mb-4">
						Queue
					</h2>
					<p className="font-pixel text-[9px] text-[var(--px-text-secondary)]">
						Movie queue coming in Phase 4...
					</p>
				</section>
			</div>
		</div>
	);
}
