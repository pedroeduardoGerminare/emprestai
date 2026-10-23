import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-control border text-[13px] disabled:pointer-events-none disabled:opacity-45 transition-[background-color,border-color,color] duration-[140ms] active:translate-y-px motion-reduce:transform-none motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary: "border-accent-500 bg-transparent font-semibold text-accent-300 hover:bg-accent-500/12 hover:text-accent-100",
        confirm: "border-accent-500 bg-accent-500/12 font-semibold text-accent-200 hover:bg-accent-500/20",
        secondary: "border-border-strong bg-transparent text-neutral-400 hover:border-text-ghost hover:text-text",
        row: "border-border-strong bg-transparent font-semibold text-accent-200 hover:border-accent-500 hover:bg-accent-500/10",
        overdue: "border-accent-500 bg-accent-500/14 font-semibold text-accent-200 hover:bg-accent-500/24",
      },
      size: {
        default: "h-[38px] px-4",
        form: "h-11 px-5",
        list: "h-9 px-4",
        header: "h-[34px] px-[14px]",
        table: "h-[30px] rounded-compact px-3",
      },
    },
    defaultVariants: { variant: "secondary", size: "default" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, type = "button", ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component type={asChild ? undefined : type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
