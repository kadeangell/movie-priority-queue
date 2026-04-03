import { cn } from "./cn";

type BadgeVariant = "default" | "hp" | "mp" | "warning" | "info";

interface BadgeProps {
	variant?: BadgeVariant;
	className?: string;
	children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
	default: "bg-[var(--px-accent)] text-[var(--px-bg-panel)]",
	hp: "bg-[var(--px-status-hp)] text-white",
	mp: "bg-[var(--px-status-mp)] text-white",
	warning: "bg-[var(--px-status-warning)] text-[var(--px-bg-panel)]",
	info: "bg-[var(--px-status-info)] text-[var(--px-bg-panel)]",
};

export function Badge({
	variant = "default",
	className,
	children,
}: BadgeProps) {
	return (
		<span
			className={cn(
				"pixel-border-sm font-pixel",
				"inline-flex items-center px-2.5 py-1",
				"text-[8px] uppercase tracking-wider leading-none",
				variantStyles[variant],
				className,
			)}
		>
			{children}
		</span>
	);
}
