import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "../components/auth/LoginForm";
import { PixelLink } from "../components/ui/link";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	return (
		<div
			className="min-h-screen flex items-center justify-center p-6"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<div className="w-full max-w-sm">
				<div className="pixel-border bg-[var(--px-bg-panel)] p-8 m-[6px]">
					<h1 className="font-pixel text-[16px] text-[var(--px-text-accent)] mb-2 text-center">
						Continue
					</h1>
					<p className="font-pixel text-[9px] text-[var(--px-text-secondary)] mb-8 text-center leading-loose">
						Load your saved adventure
					</p>
					<LoginForm />
				</div>
				<p className="font-pixel text-[9px] text-[var(--px-text-secondary)] text-center mt-6">
					New adventurer? <PixelLink to="/register">Create account</PixelLink>
				</p>
			</div>
		</div>
	);
}
