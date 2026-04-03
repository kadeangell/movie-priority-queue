import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CreateGroupDialog } from "../../components/groups/CreateGroupDialog";
import { GroupCard } from "../../components/groups/GroupCard";
import { JoinGroupForm } from "../../components/groups/JoinGroupForm";
import { Button } from "../../components/ui/button";
import { PixelLink } from "../../components/ui/link";
import { groupQueries } from "../../hooks/queries/groups";
import { useAuth } from "../../hooks/useAuth";
import { getMe, logout } from "../../server/functions/auth";

export const Route = createFileRoute("/groups/")({
	beforeLoad: async () => {
		const user = await getMe();
		if (!user) {
			throw redirect({ to: "/login" });
		}
	},
	component: GroupsPage,
});

function GroupsPage() {
	const { user } = useAuth();
	const { data: groups, isLoading } = useQuery(groupQueries.all());
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	async function handleLogout() {
		await logout();
		await queryClient.invalidateQueries({ queryKey: ["auth"] });
		navigate({ to: "/" });
	}

	return (
		<div
			className="min-h-screen p-6"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<div className="max-w-2xl mx-auto">
				<header className="flex items-center justify-between mb-8">
					<div>
						<h1 className="font-pixel text-[16px] text-[var(--px-text-primary)] mb-1">
							My Parties
						</h1>
						{user && (
							<p className="font-pixel text-[8px] text-[var(--px-text-secondary)]">
								Logged in as {user.username}
							</p>
						)}
					</div>
					<div className="flex gap-2">
						<CreateGroupDialog />
						<Button variant="ghost" size="sm" onClick={handleLogout}>
							Logout
						</Button>
					</div>
				</header>

				{/* Join group section */}
				<section className="pixel-border bg-[var(--px-bg-panel)] p-5 m-[6px] mb-6">
					<h2 className="font-pixel text-[11px] text-[var(--px-text-accent)] mb-3">
						Join a Party
					</h2>
					<JoinGroupForm />
				</section>

				{/* Groups list */}
				{isLoading ? (
					<p className="font-pixel text-[10px] text-[var(--px-text-disabled)] text-center">
						Loading...
					</p>
				) : groups && groups.length > 0 ? (
					<div className="flex flex-col gap-4">
						{groups.map(
							(g: {
								id: string;
								name: string;
								invite_code: string;
								member_count: string;
							}) => (
								<GroupCard
									key={g.id}
									id={g.id}
									name={g.name}
									inviteCode={g.invite_code}
									memberCount={Number(g.member_count)}
								/>
							),
						)}
					</div>
				) : (
					<div className="pixel-border bg-[var(--px-bg-panel)] p-8 m-[6px] text-center">
						<p className="font-pixel text-[10px] text-[var(--px-text-secondary)] mb-2">
							No parties yet
						</p>
						<p className="font-pixel text-[8px] text-[var(--px-text-disabled)]">
							Create a party or join one with an invite code
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
