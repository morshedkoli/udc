"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface UseKeyboardShortcutsOptions {
  onSearchOpen: () => void;
  onQuickAddOpen: () => void;
}

export function useKeyboardShortcuts({ onSearchOpen, onQuickAddOpen }: UseKeyboardShortcutsOptions) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Ctrl/Cmd + K — Open search (works even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onSearchOpen();
        return;
      }

      // Skip remaining shortcuts if focus is in an input
      if (isInput) return;

      // Ctrl/Cmd + N — Quick add modal
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        onQuickAddOpen();
        return;
      }

      // Alt + number — Navigation
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const routes: Record<string, string> = {
          "1": "/",
          "2": "/customers",
          "3": "/services",
          "4": "/assignments",
          "5": "/payments",
          "6": "/reports",
          "7": "/activity",
        };

        if (routes[e.key]) {
          e.preventDefault();
          router.push(routes[e.key]);
          return;
        }

        // Alt + D — Toggle dark mode
        if (e.key === "d") {
          e.preventDefault();
          setTheme(theme === "dark" ? "light" : "dark");
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, theme, setTheme, onSearchOpen, onQuickAddOpen]);
}
