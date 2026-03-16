import * as React from "react";

import { cn } from "@/lib/utils";

const variantStyles = {
  default:
    "border-transparent bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500",
  secondary:
    "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
  destructive:
    "border-transparent bg-red-500 text-white shadow-sm hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500",
  outline:
    "border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300",
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
