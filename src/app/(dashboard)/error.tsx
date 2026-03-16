"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/20 mb-6">
        <AlertCircle className="h-8 w-8 text-rose-500" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-[var(--text-tertiary)] max-w-md mb-6">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try again
      </Button>
    </div>
  );
}
