import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createGroup } from "../../server/functions/groups";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

export function CreateGroupDialog() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const queryClient = useQueryClient();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			await createGroup({ data: { name } });
			await queryClient.invalidateQueries({ queryKey: ["groups"] });
			setName("");
			setOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create group");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="primary" size="md">
					Create Group
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>New Party</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-2 my-4">
						<label
							htmlFor="group-name"
							className="font-pixel text-[10px] text-[var(--px-text-secondary)] uppercase tracking-widest"
						>
							Party Name
						</label>
						<input
							id="group-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Movie Night Crew"
							maxLength={100}
							required
							className="pixel-border-sm font-pixel text-[12px] bg-[var(--px-bg-inset)] text-[var(--px-text-primary)] px-4 py-3 outline-none placeholder:text-[var(--px-text-disabled)]"
						/>
					</div>

					{error && (
						<p className="font-pixel text-[9px] text-[var(--px-status-hp)] mb-3">
							{error}
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="default"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="primary"
							disabled={loading || !name.trim()}
						>
							{loading ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
