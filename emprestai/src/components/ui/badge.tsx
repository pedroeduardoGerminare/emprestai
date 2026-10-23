import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex w-fit items-center rounded-pill border px-[9px] py-[3px] text-[11px] font-semibold", {
  variants: {
    variant: {
      available: "border-available-border bg-available-bg text-available",
      borrowed: "border-borrowed-border bg-borrowed-bg text-borrowed",
      maintenance: "border-maintenance-border bg-maintenance-bg text-maintenance",
      overdue: "border-overdue-border bg-overdue-bg text-overdue",
    },
  },
  defaultVariants: { variant: "borrowed" },
});

export function Badge({ className, variant, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
