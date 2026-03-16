"use client";

import { cn } from "@/lib/utils";
import { ASSIGNMENT_STATUSES } from "@/lib/constants";
import type { AssignmentStatus } from "@/types";

interface StatusBadgeProps {
  status: AssignmentStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = ASSIGNMENT_STATUSES.find((s) => s.value === status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config?.color || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        className
      )}
    >
      {config?.label || status}
    </span>
  );
}
