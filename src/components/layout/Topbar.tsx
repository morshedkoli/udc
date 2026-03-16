"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon, Search } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { NotificationPanel } from "@/components/features/NotificationPanel";

function getPageTitle(pathname: string) {
  for (const group of NAV_ITEMS) {
    for (const item of group.items) {
      if (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) {
        return item.label;
      }
    }
  }
  return "Dashboard";
}

export function Topbar({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">
          {pageTitle}
        </h2>
        <div className="topbar-indicator" />
      </div>

      <div className="topbar-right">
        <button
          onClick={onSearchOpen}
          className="topbar-search"
        >
          <Search className="topbar-search-icon" />
          <span className="topbar-search-text">Search</span>
          <kbd className="topbar-search-kbd">
            Ctrl K
          </kbd>
        </button>

        <NotificationPanel />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="topbar-theme-btn"
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="topbar-theme-icon" />
            ) : (
              <Moon className="topbar-theme-icon" />
            )
          ) : (
            <Sun className="topbar-theme-icon" style={{ opacity: 0 }} />
          )}
        </button>

        <div className="topbar-divider" />

        <div className="topbar-user">
          <div className="topbar-user-avatar">
            {session?.user?.name?.charAt(0) || "A"}
          </div>
          <span className="topbar-user-name">
            {session?.user?.name || "Admin"}
          </span>
        </div>
      </div>
    </div>
  );
}
