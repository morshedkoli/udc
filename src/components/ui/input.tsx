import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-sm transition-all duration-200",
          "placeholder:text-[var(--text-tertiary)]",
          "focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-[var(--border-default)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-primary)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
