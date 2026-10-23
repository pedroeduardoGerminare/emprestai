"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; disabled?: boolean };
type Props = { label: string; value: string; options: readonly Option[]; onValueChange: (value: string) => void; name?: string; disabled?: boolean; className?: string };

export function SegmentedControl({ label, value, options, onValueChange, name, disabled = false, className }: Props) {
  const id = useId();
  return (
    <fieldset disabled={disabled} className={cn("flex w-fit overflow-hidden rounded-control border border-border-strong disabled:opacity-45", className)}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label key={option.value} className="relative flex border-l border-border-strong first-of-type:border-l-0">
          <input className="peer sr-only" type="radio" name={name ?? id} value={option.value} checked={value === option.value} disabled={option.disabled} onChange={() => onValueChange(option.value)} />
          <span className="px-[18px] py-[9px] text-[13px] text-neutral-400 peer-checked:bg-accent-800 peer-checked:font-semibold peer-checked:text-accent-200 peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-accent-500 peer-disabled:opacity-45">{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
