"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  gradient?: string;
  className?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  gradient = "from-indigo-500 to-violet-500",
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn("stat-card group", className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-[var(--text-tertiary)]">{label}</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.value >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white",
            gradient
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
