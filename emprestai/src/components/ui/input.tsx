import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const fieldClass = "w-full rounded-control border border-border-strong bg-sunken text-sm text-text placeholder:text-text-faint disabled:opacity-45 aria-invalid:border-overdue-border";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return <input type={type} className={cn(fieldClass, "h-[42px] px-3", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldClass, "h-[88px] resize-none px-3 py-[10px]", className)} {...props} />;
}
