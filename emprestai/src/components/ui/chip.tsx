import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Chip({ active = false, className, ...props }: Omit<ComponentProps<"button">, "aria-pressed" | "type"> & { active?: boolean }) {
  return (
    <button {...props} type="button" aria-pressed={active} className={cn(
      "rounded-pill border px-3 py-[6px] text-xs transition-colors duration-[120ms] disabled:opacity-45",
      active ? "border-accent-700 bg-accent-800 text-accent-200" : "border-border-frame bg-transparent text-neutral-400 hover:text-text",
      className,
    )} />
  );
}
