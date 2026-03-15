"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Sticky top bar - mobile only */}
      <div className="lg:hidden sticky top-0 z-50 h-14 px-4 flex items-center justify-between border-b border-[var(--border-subtle)] glass-strong">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
            ক
          </div>
          <span className="text-sm font-semibold">কালিকচ্ছ UDC</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    ক
                  </div>
                  <h1 className="text-sm font-semibold">কালিকচ্ছ UDC</h1>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-muted)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto py-3 px-2.5">
                {NAV_ITEMS.map((group) => (
                  <div key={group.group} className="mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] px-2.5 mb-1.5">
                      {group.group}
                    </p>
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5",
                            isActive
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                          )}
                        >
                          <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-indigo-500" : "text-[var(--text-tertiary)]")} />
                          <span>{item.label}</span>
                          <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">{item.labelBn}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* User / Logout */}
              <div className="border-t border-[var(--border-subtle)] p-3">
                <div className="flex items-center gap-2.5 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                    {session?.user?.name?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{session?.user?.name || "Admin"}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate">{session?.user?.email || ""}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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
