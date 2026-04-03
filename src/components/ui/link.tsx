import type { LinkProps as RouterLinkProps } from "@tanstack/react-router";
import { Link as RouterLink } from "@tanstack/react-router";
import { cn } from "./cn";

type LinkVariant = "default" | "nav" | "button";

interface PixelLinkProps extends RouterLinkProps {
	variant?: LinkVariant;
	className?: string;
	children: React.ReactNode;
}

const variantStyles: Record<LinkVariant, string> = {
	default: [
		"font-pixel text-[10px]",
		"text-[var(--px-text-accent)]",
		"underline decoration-dashed decoration-2 underline-offset-4",
		"hover:decoration-solid hover:text-[var(--px-accent)]",
		"transition-colors duration-150 ease-pixel-spring",
	].join(" "),
	nav: [
		"pixel-cursor relative font-pixel text-[10px]",
		"text-[var(--px-text-primary)]",
		"no-underline px-3 py-1.5",
		"hover:bg-[var(--px-btn-bg)] hover:text-[var(--px-btn-text)]",
		"transition-colors duration-150 ease-pixel-spring",
	].join(" "),
	button: [
		"pixel-border-sm pixel-press font-pixel text-[10px]",
		"inline-flex items-center justify-center",
		"bg-[var(--px-btn-bg)] text-[var(--px-btn-text)]",
		"px-4 py-2 no-underline",
		"hover:bg-[var(--px-btn-bg-hover)]",
		"active:bg-[var(--px-btn-bg-active)]",
		"transition-colors duration-150 ease-pixel-spring",
	].join(" "),
};

export function PixelLink({
	variant = "default",
	className,
	children,
	...props
}: PixelLinkProps) {
	return (
		<RouterLink className={cn(variantStyles[variant], className)} {...props}>
			{children}
		</RouterLink>
	);
}
