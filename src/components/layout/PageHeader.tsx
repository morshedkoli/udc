"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7"
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {children}
        </div>
      )}
    </motion.div>
  );
}
