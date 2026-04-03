import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { PixelLink } from "../components/ui/link";
import type { PixelTheme } from "../components/ui/pixel-theme-provider";
import { usePixelTheme } from "../components/ui/pixel-theme-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "../components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../components/ui/tooltip";

export const Route = createFileRoute("/ui-showcase")({
	component: UiShowcase,
});

const THEMES: PixelTheme[] = ["overworld", "dungeon", "town", "battle"];

function ThemeSwitcher() {
	const { theme, setTheme } = usePixelTheme();

	return (
		<div className="flex flex-wrap gap-2">
			{THEMES.map((t) => (
				<Button
					key={t}
					variant={theme === t ? "primary" : "default"}
					size="sm"
					onClick={() => setTheme(t)}
				>
					{t}
				</Button>
			))}
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="pixel-border bg-[var(--px-bg-panel)] m-[6px] p-6">
			<h2 className="font-pixel text-[14px] text-[var(--px-text-accent)] mb-6">
				{title}
			</h2>
			{children}
		</section>
	);
}

function ButtonShowcase() {
	return (
		<Section title="Buttons">
			<div className="flex flex-col gap-6">
				<div>
					<p className="font-pixel text-[8px] text-[var(--px-text-secondary)] mb-3 uppercase tracking-widest">
						Variants
					</p>
					<div className="flex flex-wrap gap-4 items-center">
						<Button variant="default">Default</Button>
						<Button variant="primary">Primary</Button>
						<Button variant="danger">Danger</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="primary" disabled>
							Disabled
						</Button>
					</div>
				</div>
				<div>
					<p className="font-pixel text-[8px] text-[var(--px-text-secondary)] mb-3 uppercase tracking-widest">
						Sizes
					</p>
					<div className="flex flex-wrap gap-4 items-center">
						<Button variant="primary" size="sm">
							Small
						</Button>
						<Button variant="primary" size="md">
							Medium
						</Button>
						<Button variant="primary" size="lg">
							Large
						</Button>
					</div>
				</div>
			</div>
		</Section>
	);
}

function BadgeShowcase() {
	return (
		<Section title="Badges">
			<div className="flex flex-wrap gap-4 items-center">
				<Badge>Default</Badge>
				<Badge variant="hp">HP 120</Badge>
				<Badge variant="mp">MP 45</Badge>
				<Badge variant="warning">Poison</Badge>
				<Badge variant="info">Lv 12</Badge>
			</div>
		</Section>
	);
}

function LinkShowcase() {
	return (
		<Section title="Links">
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap gap-6 items-center">
					<PixelLink to="/">Default Link</PixelLink>
					<PixelLink to="/" variant="nav">
						Nav Link
					</PixelLink>
					<PixelLink to="/" variant="button">
						Button Link
					</PixelLink>
				</div>
			</div>
		</Section>
	);
}

function TooltipShowcase() {
	return (
		<Section title="Tooltips">
			<div className="flex flex-wrap gap-4">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="default">Hover me</Button>
					</TooltipTrigger>
					<TooltipContent>A basic tooltip message</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="primary">Item Info</Button>
					</TooltipTrigger>
					<TooltipContent side="bottom">Potion: Restores 50 HP</TooltipContent>
				</Tooltip>
			</div>
		</Section>
	);
}

function PopoverShowcase() {
	return (
		<Section title="Popovers">
			<div className="flex flex-wrap gap-4">
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="default">Item Details</Button>
					</PopoverTrigger>
					<PopoverContent>
						<p className="text-[var(--px-text-accent)] text-[12px] mb-2">
							Excalibur
						</p>
						<p className="text-[var(--px-text-secondary)] mb-3">
							The legendary holy sword. Deals extra damage to undead enemies.
						</p>
						<div className="flex gap-3">
							<Badge variant="hp">ATK +48</Badge>
							<Badge variant="info">Holy</Badge>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</Section>
	);
}

function DropdownShowcase() {
	return (
		<Section title="Dropdown Menus">
			<div className="flex flex-wrap gap-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="primary">Actions</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>Battle</DropdownMenuLabel>
						<DropdownMenuItem>Attack</DropdownMenuItem>
						<DropdownMenuItem>Magic</DropdownMenuItem>
						<DropdownMenuItem>Defend</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuLabel>Other</DropdownMenuLabel>
						<DropdownMenuItem>Item</DropdownMenuItem>
						<DropdownMenuItem>Flee</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</Section>
	);
}

function DialogShowcase() {
	const [open, setOpen] = useState(false);

	return (
		<Section title="Dialogs">
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button variant="primary">Save Game</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Save Progress?</DialogTitle>
						<DialogDescription>
							Your adventure will be saved to Slot 1. Any existing data in this
							slot will be overwritten.
						</DialogDescription>
					</DialogHeader>
					<div className="pixel-border-sm bg-[var(--px-bg-inset)] p-3 my-2">
						<div className="flex justify-between items-center">
							<span className="font-pixel text-[9px] text-[var(--px-text-secondary)]">
								Slot 1
							</span>
							<div className="flex gap-2">
								<Badge variant="hp">Lv 24</Badge>
								<Badge variant="info">12:45</Badge>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="default" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button variant="primary" onClick={() => setOpen(false)}>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Section>
	);
}

function UiShowcase() {
	return (
		<div
			className="min-h-screen p-6"
			style={{ backgroundColor: "var(--px-bg-base)" }}
		>
			<div className="max-w-3xl mx-auto">
				<header className="mb-8">
					<h1 className="font-pixel text-[20px] text-[var(--px-text-primary)] mb-4">
						GBA RPG Components
					</h1>
					<p className="font-pixel text-[9px] text-[var(--px-text-secondary)] mb-6 leading-loose">
						Pixel art UI components inspired by Game Boy Advance-era RPGs
					</p>
					<ThemeSwitcher />
				</header>

				<div className="flex flex-col gap-8">
					<ButtonShowcase />
					<BadgeShowcase />
					<LinkShowcase />
					<TooltipShowcase />
					<PopoverShowcase />
					<DropdownShowcase />
					<DialogShowcase />
				</div>
			</div>
		</div>
	);
}
