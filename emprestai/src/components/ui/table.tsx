import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-card border border-border-soft">
      <table className={cn("w-full caption-bottom border-collapse text-left text-[13px]", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-sunken text-[11px] tracking-[.08em] text-text-faint uppercase", className)} {...props} />;
}

export function TableBody(props: ComponentProps<"tbody">) { return <tbody {...props} />; }

export function TableRow({ className, overdue = false, ...props }: ComponentProps<"tr"> & { overdue?: boolean }) {
  return <tr className={cn("border-t border-border-row", overdue && "bg-overdue-bg", className)} {...props} />;
}

export function TableHead({ className, scope = "col", ...props }: ComponentProps<"th">) {
  return <th scope={scope} className={cn("px-[18px] py-3 font-normal", className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-[18px] py-[13px]", className)} {...props} />;
}

export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return <caption className={cn("p-3 text-xs text-text-muted", className)} {...props} />;
}
