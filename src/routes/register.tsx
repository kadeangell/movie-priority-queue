import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "../components/auth/RegisterForm";
import { PixelLink } from "../components/ui/link";

export const Route = createFileRoute("/register")({
	component: RegisterPage,
});

function RegisterPage() {
	return (
		<div
			className="min-h-screen flex items-center justify-center p-6"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<div className="w-full max-w-sm">
				<div className="pixel-border bg-[var(--px-bg-panel)] p-8 m-[6px]">
					<h1 className="font-pixel text-[16px] text-[var(--px-text-accent)] mb-2 text-center">
						New Game
					</h1>
					<p className="font-pixel text-[9px] text-[var(--px-text-secondary)] mb-8 text-center leading-loose">
						Create your adventurer profile
					</p>
					<RegisterForm />
				</div>
				<p className="font-pixel text-[9px] text-[var(--px-text-secondary)] text-center mt-6">
					Already have an account? <PixelLink to="/login">Log in</PixelLink>
				</p>
			</div>
		</div>
	);
}
