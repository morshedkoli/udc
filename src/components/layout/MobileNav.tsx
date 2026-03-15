"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, LogOut, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* ── Sticky top bar ── */}
      <div className="lg:hidden sticky top-0 z-50 h-14 px-4 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-1 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-900 font-bold text-xs shadow-lg shadow-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)]">কালিকচ্ছ UDC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 opacity-0" />
            )}
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 text-[10px] font-bold shadow-lg shadow-amber-500/20">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
        </div>
      </div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 w-[300px] z-50 bg-[var(--bg-surface)] flex flex-col lg:hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between h-[64px] px-5 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-900 font-bold text-sm shadow-lg shadow-amber-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">কালিকচ্ছ UDC</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">ডিজিটাল সেন্টার</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto py-4 px-3">
                {NAV_ITEMS.map((group, gi) => (
                  <div key={group.group} className={cn(gi > 0 && "mt-5")}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-tertiary)] px-3 mb-2">
                      {group.group}
                    </p>
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
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-200",
                              isActive
                                ? "bg-gradient-to-r from-[var(--brand-primary)] to-[#2563eb] text-white shadow-lg shadow-blue-900/20"
                                : "text-[var(--text-secondary)] active:bg-[var(--bg-muted)]"
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-[18px] h-[18px] shrink-0",
                                isActive ? "text-white" : "text-[var(--text-tertiary)]"
                              )}
                            />
                            <span className="flex-1">{item.label}</span>
                            <span
                              className={cn(
                                "text-[10px]",
                                isActive ? "text-white/50" : "text-[var(--text-tertiary)]"
                              )}
                            >
                              {item.labelBn}
                            </span>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/50" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* User */}
              <div className="border-t border-[var(--border-subtle)] p-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[var(--bg-muted)] to-transparent border border-[var(--border-subtle)]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 text-sm font-bold shadow-lg shadow-amber-500/20 ring-2 ring-[var(--bg-surface)]">
                    {session?.user?.name?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {session?.user?.name || "Admin"}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                      {session?.user?.email || ""}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
