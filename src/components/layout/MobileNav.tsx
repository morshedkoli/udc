"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, LogOut, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_ITEMS } from "@/lib/constants";

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
      {/* Sticky top bar */}
      <div className="mobile-nav-bar">
        <div className="mobile-nav-left">
          <button
            onClick={() => setOpen(true)}
            className="mobile-nav-menu-btn"
          >
            <Menu className="mobile-nav-menu-icon" />
          </button>
          <div className="mobile-nav-logo">
            <Sparkles className="mobile-nav-logo-icon" />
          </div>
          <span className="mobile-nav-brand">Kalikachha UDC</span>
        </div>
        <div className="mobile-nav-right">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mobile-nav-theme-btn"
          >
            {mounted ? (
              theme === "dark" ? <Sun className="mobile-nav-theme-icon" /> : <Moon className="mobile-nav-theme-icon" />
            ) : (
              <Sun className="mobile-nav-theme-icon" style={{ opacity: 0 }} />
            )}
          </button>
          <div className="mobile-nav-user-avatar">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="mobile-nav-overlay"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="mobile-nav-drawer"
            >
              {/* Header */}
              <div className="mobile-nav-drawer-header">
                <div className="mobile-nav-drawer-brand">
                  <div className="mobile-nav-drawer-logo">
                    <Sparkles className="mobile-nav-drawer-logo-icon" />
                  </div>
                  <div>
                    <p className="mobile-nav-drawer-title">Kalikachha UDC</p>
                    <p className="mobile-nav-drawer-subtitle">Digital Center</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="mobile-nav-drawer-close"
                >
                  <X className="mobile-nav-drawer-close-icon" />
                </button>
              </div>

              {/* Nav */}
              <nav className="mobile-nav-drawer-nav">
                {NAV_ITEMS.map((group, gi) => (
                  <div key={group.group} className={gi > 0 ? "mobile-nav-drawer-group" : ""}>
                    <p className="mobile-nav-drawer-group-label">
                      {group.group}
                    </p>
                    <div className="mobile-nav-drawer-items">
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
                            className={isActive ? "mobile-nav-drawer-item-active" : "mobile-nav-drawer-item"}
                          >
                            <Icon className={isActive ? "mobile-nav-drawer-item-icon-active" : "mobile-nav-drawer-item-icon"} />
                            <span className="mobile-nav-drawer-item-text">{item.label}</span>
                            {isActive && <ChevronRight className="mobile-nav-drawer-item-arrow" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* User */}
              <div className="mobile-nav-drawer-footer">
                <div className="mobile-nav-drawer-user">
                  <div className="mobile-nav-drawer-user-avatar">
                    {session?.user?.name?.charAt(0) || "A"}
                  </div>
                  <div className="mobile-nav-drawer-user-info">
                    <p className="mobile-nav-drawer-user-name">
                      {session?.user?.name || "Admin"}
                    </p>
                    <p className="mobile-nav-drawer-user-email">
                      {session?.user?.email || ""}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="mobile-nav-drawer-logout"
                  >
                    <LogOut className="mobile-nav-drawer-logout-icon" />
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
