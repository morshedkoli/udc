"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Search } from "lucide-react";

interface TopbarProps {
  onSearchClick?: () => void;
}

export function Topbar({ onSearchClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="hidden lg:flex sticky top-0 z-30 h-14 items-center justify-between px-6 border-b border-[var(--border-subtle)] glass-strong">
      {/* Search trigger */}
      <button
        onClick={onSearchClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-default)] transition-all text-sm w-64"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">অনুসন্ধান করুন...</span>
        <kbd className="ml-auto text-[10px] bg-[var(--bg-muted)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] font-mono">
          Ctrl+K
        </kbd>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
