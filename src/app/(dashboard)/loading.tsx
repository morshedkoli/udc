export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-[var(--bg-muted)] rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-[var(--bg-muted)] rounded-lg animate-pulse mt-2" />
        </div>
        <div className="h-9 w-32 bg-[var(--bg-muted)] rounded-lg animate-pulse" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-muted)] animate-pulse" />
              <div className="h-3 w-24 bg-[var(--bg-muted)] rounded animate-pulse" />
            </div>
            <div className="h-7 w-20 bg-[var(--bg-muted)] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
        <div className="h-5 w-36 bg-[var(--bg-muted)] rounded animate-pulse mb-4" />
        <div className="h-64 bg-[var(--bg-muted)] rounded-lg animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="px-4 py-3 bg-[var(--bg-muted)]">
          <div className="h-4 w-full bg-[var(--bg-surface)] rounded animate-pulse" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-t border-[var(--border-subtle)]">
            <div className="h-4 w-full bg-[var(--bg-muted)] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
