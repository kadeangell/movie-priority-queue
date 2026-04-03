import { startAuthentication } from "@simplewebauthn/browser";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	getAuthenticationOptions,
	verifyAuthentication,
} from "../../server/functions/auth";
import { Button } from "../ui/button";

export function LoginForm() {
	const [username, setUsername] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			// Get authentication options from server
			const options = await getAuthenticationOptions({
				data: { username },
			});

			// Start WebAuthn authentication in browser
			const credential = await startAuthentication({ optionsJSON: options });

			// Verify with server
			await verifyAuthentication({
				data: { username, credential },
			});

			// Refresh auth state and redirect
			await queryClient.invalidateQueries({ queryKey: ["auth"] });
			navigate({ to: "/groups" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<label
					htmlFor="username"
					className="font-pixel text-[10px] text-[var(--px-text-secondary)] uppercase tracking-widest"
				>
					Username
				</label>
				<input
					id="username"
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="hero_name"
					maxLength={32}
					required
					className="pixel-border-sm font-pixel text-[12px] bg-[var(--px-bg-inset)] text-[var(--px-text-primary)] px-4 py-3 outline-none placeholder:text-[var(--px-text-disabled)]"
				/>
			</div>

			{error && (
				<p className="font-pixel text-[9px] text-[var(--px-status-hp)] leading-relaxed">
					{error}
				</p>
			)}

			<Button
				type="submit"
				variant="primary"
				size="lg"
				disabled={loading || !username.trim()}
			>
				{loading ? "Verifying..." : "Login with Passkey"}
			</Button>

			<p className="font-pixel text-[8px] text-[var(--px-text-secondary)] leading-loose text-center">
				Your browser will prompt for your passkey.
			</p>
		</form>
	);
}
