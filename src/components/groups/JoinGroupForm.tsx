import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { joinGroup } from "../../server/functions/groups";
import { Button } from "../ui/button";

interface JoinGroupFormProps {
	initialCode?: string;
}

export function JoinGroupForm({ initialCode = "" }: JoinGroupFormProps) {
	const [code, setCode] = useState(initialCode);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const group = await joinGroup({
				data: { inviteCode: code.toUpperCase() },
			});
			await queryClient.invalidateQueries({ queryKey: ["groups"] });
			navigate({ to: "/groups/$groupId", params: { groupId: group.id } });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to join group");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<input
				type="text"
				value={code}
				onChange={(e) => setCode(e.target.value.toUpperCase())}
				placeholder="INVITE CODE"
				maxLength={6}
				required
				className="pixel-border-sm font-pixel text-[14px] text-center bg-[var(--px-bg-inset)] text-[var(--px-text-primary)] px-4 py-3 outline-none tracking-[0.3em] uppercase placeholder:text-[var(--px-text-disabled)] placeholder:tracking-widest placeholder:text-[10px]"
			/>
			{error && (
				<p className="font-pixel text-[9px] text-[var(--px-status-hp)]">
					{error}
				</p>
			)}
			<Button
				type="submit"
				variant="primary"
				disabled={loading || code.length < 6}
			>
				{loading ? "Joining..." : "Join Party"}
			</Button>
		</form>
	);
}
