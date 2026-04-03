import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/groups/")({
	component: GroupsPage,
});

function GroupsPage() {
	return (
		<div
			className="min-h-screen p-6"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<div className="max-w-2xl mx-auto">
				<h1 className="font-pixel text-[16px] text-[var(--px-text-primary)] mb-6">
					My Groups
				</h1>
				<p className="font-pixel text-[10px] text-[var(--px-text-secondary)]">
					Coming soon...
				</p>
			</div>
		</div>
	);
}
