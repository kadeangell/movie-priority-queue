import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogClose = DialogPrimitive.Close;

function DialogContent({
	className,
	children,
	...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay
				className={cn(
					"pixel-scanlines",
					"fixed inset-0 z-50",
					"flex items-center justify-center",
					"bg-black/60",
					"data-[state=open]:animate-[pixel-overlay-in_200ms_ease-out]",
					"data-[state=closed]:animate-[pixel-overlay-out_150ms_ease-in_forwards]",
				)}
			>
				<DialogPrimitive.Content
					className={cn(
						"pixel-border font-pixel relative",
						"w-full max-w-lg p-6 m-4",
						"bg-[var(--px-bg-panel)] text-[var(--px-text-primary)]",
						"data-[state=open]:animate-[pixel-dialog-in_350ms_var(--ease-pixel-spring)]",
						"data-[state=closed]:animate-[pixel-dialog-out_150ms_ease-in_forwards]",
						className,
					)}
					{...props}
				>
					{children}
					<DialogPrimitive.Close
						className={cn(
							"pixel-press absolute right-3 top-3",
							"font-pixel text-[10px] cursor-pointer",
							"text-[var(--px-text-secondary)] hover:text-[var(--px-text-accent)]",
							"transition-colors duration-150 ease-pixel-spring",
						)}
					>
						✕
					</DialogPrimitive.Close>
				</DialogPrimitive.Content>
			</DialogPrimitive.Overlay>
		</DialogPrimitive.Portal>
	);
}

function DialogHeader({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn("flex flex-col gap-2 pb-4", className)} {...props} />
	);
}

function DialogTitle({
	className,
	...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			className={cn(
				"font-pixel text-[14px] leading-relaxed",
				"text-[var(--px-text-accent)]",
				className,
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			className={cn(
				"font-pixel text-[9px] leading-loose",
				"text-[var(--px-text-secondary)]",
				className,
			)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn("flex justify-end gap-3 pt-4", className)} {...props} />
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
};
