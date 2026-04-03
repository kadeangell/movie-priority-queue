import { Link } from "@tanstack/react-router";
import { Badge } from "../ui/badge";

interface GroupCardProps {
	id: string;
	name: string;
	memberCount: number;
	inviteCode: string;
	index?: number;
}

export function GroupCard({
	id,
	name,
	memberCount,
	inviteCode,
	index = 0,
}: GroupCardProps) {
	return (
		<Link
			to="/groups/$groupId"
			params={{ groupId: id }}
			className="pixel-border bg-[var(--px-bg-panel)] p-5 m-[6px] block no-underline hover:bg-[var(--px-bg-panel-alt)] transition-colors duration-150"
			style={{
				animation: `pixel-slide-up 250ms var(--ease-pixel-spring) ${index * 60}ms both`,
			}}
		>
			<div className="flex items-center justify-between gap-3">
				<h3 className="font-pixel text-[12px] text-[var(--px-text-primary)]">
					{name}
				</h3>
				<Badge variant="info">{memberCount} members</Badge>
			</div>
			<p className="font-pixel text-[8px] text-[var(--px-text-disabled)] mt-2 uppercase tracking-widest">
				Code: {inviteCode}
			</p>
		</Link>
	);
}
