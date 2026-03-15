"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content${collapsed ? " sidebar-collapsed" : ""}`}>
        <MobileNav />
        <Topbar />
        <main className="page-area">
          {children}
        </main>
      </div>
    </div>
  );
}
