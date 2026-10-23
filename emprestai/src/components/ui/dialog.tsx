"use client";

import type { ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-40 bg-[rgba(4,6,14,.68)]" />
      <DialogPrimitive.Content {...props} className={cn(
        "dialog-content fixed top-1/2 left-1/2 z-50 flex w-[432px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-screen bg-surface p-6 shadow-lg",
        className,
      )}>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-[19px] font-semibold text-text", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-[13.5px] leading-normal text-text-muted", className)} {...props} />;
}

export function DialogConsequence({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-icon border border-border-soft bg-sunken px-[14px] py-3 text-[12.5px] text-neutral-400", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex justify-end gap-[10px]", className)} {...props} />;
}
