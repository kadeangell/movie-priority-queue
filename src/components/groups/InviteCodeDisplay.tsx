import { useState } from "react";
import { Button } from "../ui/button";

interface InviteCodeDisplayProps {
	code: string;
}

export function InviteCodeDisplay({ code }: InviteCodeDisplayProps) {
	const [copied, setCopied] = useState(false);

	async function copyLink() {
		const url = `${window.location.origin}/join/${code}`;
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="flex items-center gap-3">
			<span className="pixel-border-sm bg-[var(--px-bg-inset)] px-4 py-2 font-pixel text-[14px] text-[var(--px-text-accent)] tracking-[0.3em]">
				{code}
			</span>
			<Button variant="default" size="sm" onClick={copyLink}>
				{copied ? "Copied!" : "Copy Link"}
			</Button>
		</div>
	);
}
