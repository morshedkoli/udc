"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon, Search, Bell, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

function getPageTitle(pathname: string) {
  for (const group of NAV_ITEMS) {
    for (const item of group.items) {
      if (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) {
        return { title: item.label, titleBn: item.labelBn };
      }
    }
  }
  return { title: "Dashboard", titleBn: "ড্যাশবোর্ড" };
}

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();
  const page = getPageTitle(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="hidden lg:flex sticky top-0 z-30 h-[64px] items-center justify-between px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-xl">
      {/* Left — page context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-4 h-4 text-slate-900" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
              {page.title}
            </h2>
            <p className="text-[11px] text-[var(--text-tertiary)] leading-tight">
              {page.titleBn}
            </p>
          </div>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="p-2.5 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)] transition-all duration-200">
          <Search className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)] transition-all duration-200 relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2.5 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)] transition-all duration-200"
          title={theme === "dark" ? "লাইট মোড" : "ডার্ক মোড"}
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )
          ) : (
            <Sun className="w-[18px] h-[18px] opacity-0" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-[var(--border-subtle)] mx-1" />

        {/* User pill */}
        <div className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--bg-muted)] to-transparent border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all duration-200 cursor-default">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 text-xs font-bold shadow-lg shadow-amber-500/20">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {session?.user?.name || "Admin"}
          </span>
        </div>
      </div>
    </div>
  );
}
