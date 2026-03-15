import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/25 hover:-translate-y-0.5",
        secondary:
          "bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-default)]",
        accent:
          "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5",
        outline:
          "border border-[var(--border-subtle)] bg-transparent shadow-sm hover:bg-[var(--bg-muted)] hover:border-[var(--border-default)] text-[var(--text-primary)]",
        ghost:
          "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
        destructive:
          "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-900/20 hover:shadow-xl hover:shadow-rose-900/25 hover:-translate-y-0.5",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
