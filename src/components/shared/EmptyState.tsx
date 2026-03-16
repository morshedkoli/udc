"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("flex flex-col items-center justify-center py-16 text-center", className)}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--bg-subtle)] mb-4">
        <Icon className="h-8 w-8 text-[var(--text-tertiary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-tertiary)] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
