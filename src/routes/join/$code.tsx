import { createFileRoute, redirect } from "@tanstack/react-router";
import { getMe } from "../../server/functions/auth";
import { joinGroup } from "../../server/functions/groups";

export const Route = createFileRoute("/join/$code")({
	beforeLoad: async ({ params }) => {
		const user = await getMe();
		if (!user) {
			// TODO: store invite code and redirect after login
			throw redirect({ to: "/login" });
		}

		// Auto-join the group
		const group = await joinGroup({
			data: { inviteCode: params.code.toUpperCase() },
		});

		throw redirect({
			to: "/groups/$groupId",
			params: { groupId: group.id },
		});
	},
	component: JoinRedirect,
});

function JoinRedirect() {
	return (
		<div
			className="min-h-screen flex items-center justify-center"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<p className="font-pixel text-[10px] text-[var(--px-text-disabled)]">
				Joining party...
			</p>
		</div>
	);
}
