import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm transition-all duration-200",
        "placeholder:text-[var(--text-tertiary)]",
        "focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
