"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          onChange={(e) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
          }}
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded border border-[var(--border-default)] transition-all duration-200",
            "peer-checked:bg-[var(--brand-primary)] peer-checked:border-[var(--brand-primary)]",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--brand-primary)]/20",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            "flex items-center justify-center",
            className
          )}
        >
          <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
