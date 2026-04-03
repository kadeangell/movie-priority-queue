import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

function DropdownMenuContent({
	className,
	sideOffset = 10,
	...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				sideOffset={sideOffset}
				className={cn(
					"pixel-border font-pixel",
					"z-50 min-w-[10rem] p-1 text-[10px]",
					"bg-[var(--px-bg-panel)] text-[var(--px-text-primary)]",
					"animate-in fade-in-0 zoom-in-95",
					"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
					"m-[6px]",
					className,
				)}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	);
}

function DropdownMenuItem({
	className,
	...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>) {
	return (
		<DropdownMenuPrimitive.Item
			className={cn(
				"pixel-cursor relative",
				"flex cursor-pointer select-none items-center",
				"px-3 py-2 text-[10px] leading-none outline-none",
				"text-[var(--px-text-primary)]",
				"data-[highlighted]:bg-[var(--px-btn-bg)] data-[highlighted]:text-[var(--px-btn-text)]",
				"data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
				"transition-colors duration-150 ease-pixel-spring",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuSeparator({
	className,
	...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
	return (
		<DropdownMenuPrimitive.Separator
			className={cn(
				"mx-1 my-1 h-px",
				"bg-[var(--px-border-mid)]",
				"border-none",
				"[background-image:repeating-linear-gradient(90deg,var(--px-border-mid)_0,var(--px-border-mid)_4px,transparent_4px,transparent_8px)]",
				"bg-transparent",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuLabel({
	className,
	...props
}: ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>) {
	return (
		<DropdownMenuPrimitive.Label
			className={cn(
				"px-3 py-2 text-[8px] uppercase tracking-widest",
				"text-[var(--px-text-secondary)]",
				className,
			)}
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
};
