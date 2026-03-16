"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <PageShell>
      <PageHeader title="Settings" subtitle="Application settings and configuration" />

      <div className="max-w-2xl space-y-6">
        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="settings-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="settings-icon">
              <Sun />
            </div>
            <div>
              <h2 className="text-base font-semibold text-primary">
                Theme
              </h2>
              <p className="text-xs text-tertiary">
                Change the application color theme
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
                  className={`theme-option ${isActive ? 'active' : ''}`}
                >
                  <Icon
                    className={`w-6 h-6 ${isActive ? 'text-brand-primary' : 'text-secondary'}`}
                  />
                  <span
                    className={`text-sm font-medium ${isActive ? 'text-brand-primary' : 'text-secondary'}`}
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
          className="settings-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="settings-icon success">
              <Info />
            </div>
            <div>
              <h2 className="text-base font-semibold text-primary">
                About
              </h2>
              <p className="text-xs text-tertiary">
                Application information
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-subtle">
              <span className="text-sm text-secondary">
                Application
              </span>
              <span className="text-sm font-medium text-primary">
                Kalikachha UDC Dashboard
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-subtle">
              <span className="text-sm text-secondary">
                Version
              </span>
              <span className="text-sm font-mono font-medium text-primary">
                4.0.0
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-subtle">
              <span className="text-sm text-secondary">
                Platform
              </span>
              <span className="text-sm font-medium text-primary">
                Next.js + Prisma + MongoDB
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-secondary">
                Developer
              </span>
              <span className="text-sm font-medium text-primary">
                UDC Service Team
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}
