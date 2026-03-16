"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronsLeft, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const sidebarClass = collapsed ? "sidebar sidebar-collapsed" : "sidebar";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={sidebarClass}
    >
      {/* Brand */}
      <div className="sidebar-brand">
        <Link href="/" className="sidebar-brand-link">
          <div className="sidebar-logo">
            <Sparkles className="sidebar-logo-icon" />
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="sidebar-brand-text"
              >
                <p className="sidebar-brand-title">Kalikachha UDC</p>
                <p className="sidebar-brand-subtitle">Digital Center</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="sidebar-nav-group">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="sidebar-nav-label"
                >
                  {group.group}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="sidebar-nav-items">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                const itemClass = isActive 
                  ? "sidebar-nav-item sidebar-nav-item-active" 
                  : "sidebar-nav-item";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={itemClass}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="sidebar-nav-item-bg"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon className="sidebar-nav-icon" />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="sidebar-nav-text"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-collapse-btn"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronsLeft className="sidebar-collapse-icon" />
          </motion.div>
        </button>

        <div className={collapsed ? "sidebar-user sidebar-user-collapsed" : "sidebar-user"}>
          <div className="sidebar-user-avatar">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sidebar-user-info"
              >
                <p className="sidebar-user-name">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="sidebar-user-email">
                  {session?.user?.email || ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="sidebar-logout-btn"
              title="Logout"
            >
              <LogOut className="sidebar-logout-icon" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
