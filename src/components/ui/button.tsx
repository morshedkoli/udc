import * as React from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  default:
    "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
  secondary:
    "bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-default)]",
  accent:
    "bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800",
  outline:
    "border border-[var(--border-subtle)] bg-transparent hover:bg-[var(--bg-muted)] hover:border-[var(--border-default)] text-[var(--text-primary)]",
  ghost:
    "hover:bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800",
  link: "text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400",
} as const;

const sizeStyles = {
  default: "h-10 px-5 py-2",
  sm: "h-8 rounded-md px-3.5 text-xs",
  lg: "h-12 rounded-lg px-8 text-base",
  icon: "h-10 w-10",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

function buttonVariants(opts?: { variant?: keyof typeof variantStyles; size?: keyof typeof sizeStyles }) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variantStyles[opts?.variant ?? "default"],
    sizeStyles[opts?.size ?? "default"]
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
