import { createFileRoute } from "@tanstack/react-router";
import { PixelLink } from "../components/ui/link";
import {
	type PixelTheme,
	usePixelTheme,
} from "../components/ui/pixel-theme-provider";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

const THEMES: { id: PixelTheme; name: string; description: string }[] = [
	{
		id: "overworld",
		name: "Overworld",
		description: "Bright fields and sunny skies",
	},
	{
		id: "dungeon",
		name: "Dungeon",
		description: "Dark caverns and crystal glow",
	},
	{
		id: "town",
		name: "Town",
		description: "Warm shops and cozy inns",
	},
	{
		id: "battle",
		name: "Battle",
		description: "High contrast combat UI",
	},
];

function SettingsPage() {
	const { theme, setTheme } = usePixelTheme();

	return (
		<div
			className="min-h-screen p-6"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<div className="max-w-lg mx-auto">
				<header className="mb-6">
					<PixelLink to="/groups" variant="nav">
						← Back
					</PixelLink>
					<h1 className="font-pixel text-[16px] text-[var(--px-text-primary)] mt-3">
						Settings
					</h1>
				</header>

				<section className="pixel-border bg-[var(--px-bg-panel)] p-5 m-[6px]">
					<h2 className="font-pixel text-[11px] text-[var(--px-text-accent)] mb-4 uppercase tracking-widest">
						Theme
					</h2>
					<div className="flex flex-col gap-2">
						{THEMES.map((t, i) => (
							<button
								key={t.id}
								type="button"
								onClick={() => setTheme(t.id)}
								className="pixel-cursor relative text-left px-4 py-3 cursor-pointer transition-colors duration-150 ease-pixel-spring"
								style={{
									backgroundColor:
										theme === t.id
											? "var(--px-btn-bg)"
											: "var(--px-bg-panel-alt)",
									animation: `pixel-slide-up 200ms var(--ease-pixel-spring) ${i * 50}ms both`,
								}}
							>
								<span
									className="font-pixel text-[10px] block"
									style={{
										color:
											theme === t.id
												? "var(--px-btn-text)"
												: "var(--px-text-primary)",
									}}
								>
									{t.name}
								</span>
								<span
									className="font-pixel text-[7px] block mt-1"
									style={{
										color:
											theme === t.id
												? "var(--px-btn-text)"
												: "var(--px-text-disabled)",
									}}
								>
									{t.description}
								</span>
							</button>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
