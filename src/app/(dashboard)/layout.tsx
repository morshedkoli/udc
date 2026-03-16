"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/features/CommandPalette";
import { QuickAddModal } from "@/components/features/QuickAddModal";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const onSearchOpen = useCallback(() => setSearchOpen(true), []);
  const onQuickAddOpen = useCallback(() => setQuickAddOpen(true), []);

  useKeyboardShortcuts({ onSearchOpen, onQuickAddOpen });

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={collapsed ? "main-content sidebar-collapsed" : "main-content"}>
        <MobileNav />
        <Topbar onSearchOpen={onSearchOpen} />
        <main className="page-area">
          {children}
        </main>
      </div>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
