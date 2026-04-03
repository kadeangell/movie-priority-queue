import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { PixelLink } from "../components/ui/link";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
	const { user, isLoading, isAuthenticated } = useAuth();

	return (
		<div
			className="min-h-screen flex items-center justify-center p-6"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<div className="text-center max-w-lg">
				<div className="pixel-border bg-[var(--px-bg-panel)] p-10 m-[6px]">
					<h1 className="font-pixel text-[20px] text-[var(--px-text-accent)] mb-4 leading-relaxed">
						Movie Queue
					</h1>
					<p className="font-pixel text-[9px] text-[var(--px-text-secondary)] mb-8 leading-loose">
						A collaborative movie watchlist for your party. Add films, vote on
						what to watch next, mark them done.
					</p>

					{isLoading ? (
						<p className="font-pixel text-[10px] text-[var(--px-text-disabled)]">
							Loading...
						</p>
					) : isAuthenticated ? (
						<div className="flex flex-col gap-3 items-center">
							<p className="font-pixel text-[10px] text-[var(--px-text-primary)] mb-2">
								Welcome back, {user?.username}
							</p>
							<PixelLink to="/groups" variant="button">
								My Groups
							</PixelLink>
						</div>
					) : (
						<div className="flex flex-col gap-3 items-center">
							<PixelLink to="/register" variant="button">
								New Game
							</PixelLink>
							<PixelLink to="/login">Continue Save</PixelLink>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
