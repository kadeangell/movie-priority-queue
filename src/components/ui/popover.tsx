import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverClose = PopoverPrimitive.Close;

function PopoverContent({
	className,
	align = "center",
	sideOffset = 10,
	...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				align={align}
				sideOffset={sideOffset}
				className={cn(
					"pixel-border font-pixel",
					"z-50 w-64 p-4 text-[10px] leading-relaxed",
					"bg-[var(--px-bg-panel)] text-[var(--px-text-primary)]",
					"animate-in fade-in-0 zoom-in-95",
					"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
					"data-[side=bottom]:slide-in-from-top-2",
					"data-[side=left]:slide-in-from-right-2",
					"data-[side=right]:slide-in-from-left-2",
					"data-[side=top]:slide-in-from-bottom-2",
					"m-[6px]",
					className,
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverClose, PopoverContent, PopoverTrigger };
