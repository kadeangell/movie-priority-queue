import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type ButtonVariant = "default" | "primary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
	default: [
		"pixel-border-sm pixel-cursor relative",
		"bg-[var(--px-bg-panel)] text-[var(--px-text-primary)]",
		"hover:bg-[var(--px-bg-panel-alt)]",
		"active:bg-[var(--px-bg-inset)]",
	].join(" "),
	primary: [
		"pixel-border-sm pixel-cursor relative",
		"bg-[var(--px-btn-bg)] text-[var(--px-btn-text)]",
		"hover:bg-[var(--px-btn-bg-hover)]",
		"active:bg-[var(--px-btn-bg-active)]",
	].join(" "),
	danger: [
		"pixel-border-sm pixel-cursor relative",
		"bg-[var(--px-status-hp)] text-white",
		"hover:brightness-110",
		"active:brightness-90",
	].join(" "),
	ghost: [
		"pixel-cursor relative",
		"bg-transparent text-[var(--px-text-primary)]",
		"hover:bg-[var(--px-bg-panel)] hover:text-[var(--px-text-accent)]",
	].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-[8px]",
	md: "px-4 py-2 text-[10px]",
	lg: "px-6 py-3 text-[12px]",
};

export function Button({
	variant = "default",
	size = "md",
	asChild = false,
	className,
	disabled,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			className={cn(
				"font-pixel pixel-press inline-flex items-center justify-center",
				"transition-colors duration-150 ease-pixel-spring cursor-pointer",
				"focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--px-accent)]",
				variantStyles[variant],
				sizeStyles[size],
				disabled &&
					"opacity-50 cursor-not-allowed pointer-events-none text-[var(--px-text-disabled)]",
				className,
			)}
			disabled={disabled}
			{...props}
		/>
	);
}
