import { cn } from "@/lib/utils";

function bounded(value: number, maximum: number) {
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), maximum) : 0;
}

export function Progress({ value, max = 14, label, className }: { value: number; max?: number; label: string; className?: string }) {
  const maximum = Number.isFinite(max) && max > 0 ? max : 14;
  return <progress aria-label={label} value={bounded(value, maximum)} max={maximum} className={cn("deadline-progress block h-1 w-full overflow-hidden rounded-pill", className)} />;
}

export function LimitSegments({ value, label = "Itens com você", className }: { value: number; label?: string; className?: string }) {
  const current = Math.floor(bounded(value, 3));
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={3} aria-valuenow={current} aria-valuetext={`${current} de 3 itens`} className={cn("flex gap-[5px]", className)}>
      {[1, 2, 3].map((segment) => <span key={segment} aria-hidden="true" className={cn("h-[5px] flex-1 rounded-pill transition-colors duration-[240ms]", segment <= current ? "bg-accent-500" : "bg-border-frame")} />)}
    </div>
  );
}
