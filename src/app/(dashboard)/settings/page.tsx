"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

const THEME_OPTIONS = [
  { value: "light", label: "লাইট", icon: Sun },
  { value: "dark", label: "ডার্ক", icon: Moon },
  { value: "system", label: "সিস্টেম", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <PageShell>
      <PageHeader title="সেটিংস" subtitle="অ্যাপ্লিকেশন সেটিংস ও কনফিগারেশন" />

      <div className="max-w-2xl space-y-6">
        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Sun className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                থিম
              </h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                অ্যাপ্লিকেশনের রঙের থিম পরিবর্তন করুন
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    isActive
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary-light)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-muted)] hover:border-[var(--border-default)]"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      isActive
                        ? "text-[var(--brand-primary)]"
                        : "text-[var(--text-secondary)]"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive
                        ? "text-[var(--brand-primary)]"
                        : "text-[var(--text-secondary)]"
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                সম্পর্কে
              </h2>
              <p className="text-xs text-[var(--text-tertiary)]">
                অ্যাপ্লিকেশনের তথ্য
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-secondary)]">
                অ্যাপ্লিকেশন
              </span>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                কালিকচ্ছ UDC Dashboard
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-secondary)]">
                সংস্করণ
              </span>
              <span className="text-sm font-mono font-medium text-[var(--text-primary)]">
                4.0.0
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
              <span className="text-sm text-[var(--text-secondary)]">
                প্ল্যাটফর্ম
              </span>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Next.js + Prisma + MongoDB
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[var(--text-secondary)]">
                ডেভেলপার
              </span>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                UDC Service Team
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
