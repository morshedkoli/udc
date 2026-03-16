"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export function ErrorAlert({ message, className }: ErrorAlertProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-400",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
