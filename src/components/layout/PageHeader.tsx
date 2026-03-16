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
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="page-header"
    >
      <div className="page-header-decor" />
      <div className="page-header-content">
        <h1 className="page-header-title">
          {title}
        </h1>
        {subtitle && (
          <p className="page-header-subtitle">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="page-header-actions">
          {children}
        </div>
      )}
    </motion.div>
  );
}
