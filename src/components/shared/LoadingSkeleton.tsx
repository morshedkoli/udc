import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function SkeletonCard({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("stat-card animate-pulse", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-24 rounded-lg bg-[var(--bg-subtle)]" />
          <div className="h-7 w-32 rounded-lg bg-[var(--bg-subtle)]" />
          <div className="h-3 w-20 rounded-lg bg-[var(--bg-subtle)]" />
        </div>
        <div className="h-11 w-11 rounded-xl bg-[var(--bg-subtle)]" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("dashboard-card animate-pulse", className)}>
      <div className="h-5 w-40 rounded-lg bg-[var(--bg-subtle)] mb-6" />
      <div className="h-64 rounded-xl bg-[var(--bg-subtle)]" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, className }: LoadingSkeletonProps & { rows?: number }) {
  return (
    <div className={cn("dashboard-card animate-pulse space-y-4", className)}>
      <div className="h-5 w-32 rounded-lg bg-[var(--bg-subtle)]" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 flex-1 rounded-lg bg-[var(--bg-subtle)]" />
            <div className="h-4 w-24 rounded-lg bg-[var(--bg-subtle)]" />
            <div className="h-4 w-20 rounded-lg bg-[var(--bg-subtle)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-[var(--bg-subtle)] animate-pulse" />
          <div className="h-4 w-32 rounded-lg bg-[var(--bg-subtle)] animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-[var(--bg-subtle)] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable />
    </div>
  );
}
