"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronsLeft, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 268 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col",
        "bg-[var(--sidebar-bg)] border-r border-[var(--border-subtle)]"
      )}
    >
      {/* ── Brand ── */}
      <div className="flex items-center h-[64px] px-4 border-b border-[var(--border-subtle)]">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-sm shrink-0 shadow-lg shadow-amber-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                  কালিকচ্ছ UDC
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                  ডিজিটাল সেন্টার
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_ITEMS.map((group) => (
          <div key={group.group}>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)] px-3 mb-2"
                >
                  {group.group}
                </motion.p>
              )}
            </AnimatePresence>
            {collapsed && <div className="h-px bg-[var(--border-subtle)] mx-2 mb-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-200 group",
                      collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5",
                      isActive
                        ? "bg-gradient-to-r from-[var(--brand-primary)] to-[#2563eb] text-white shadow-lg shadow-blue-900/20"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--brand-accent)] rounded-r-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] shrink-0 transition-transform duration-200",
                        isActive
                          ? "text-white"
                          : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] group-hover:scale-110"
                      )}
                    />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && (
                      <span
                        className={cn(
                          "ml-auto text-[10px]",
                          isActive ? "text-white/50" : "text-[var(--text-tertiary)]"
                        )}
                      >
                        {item.labelBn}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="border-t border-[var(--border-subtle)] p-3 space-y-2">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2.5 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-secondary)] transition-all duration-200 group"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronsLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </motion.div>
        </button>

        {/* User card */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all duration-200",
            collapsed ? "justify-center p-2" : "p-2.5 bg-gradient-to-r from-[var(--bg-muted)] to-transparent border border-[var(--border-subtle)]"
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 text-xs font-bold shrink-0 ring-2 ring-[var(--bg-surface)] shadow-lg shadow-amber-500/20">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] truncate">
                  {session?.user?.email || ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all duration-200"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
