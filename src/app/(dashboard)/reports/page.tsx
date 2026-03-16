"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  Download,
  FileText,
  ClipboardList,
  Wallet,
  CalendarDays,
  Loader2,
  BarChart3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { fetcher } from "@/lib/fetcher";
import type { ReportsData } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TabType = "daily" | "weekly" | "biweekly" | "monthly" | "yearly" | "custom";

const TABS: { key: TabType; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "15 Days" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
  { key: "custom", label: "Custom" },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("daily");
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const queryParams = new URLSearchParams({ period: activeTab });
  if (activeTab === "custom") {
    queryParams.set("startDate", customStart);
    queryParams.set("endDate", customEnd);
  }

  const { data, isLoading, error } = useSWR<ReportsData>(
    `/api/reports?${queryParams.toString()}`,
    fetcher
  );

  const assignments = data?.assignments || [];
  const totalRevenue = data?.totalRevenue || 0;
  const chartData = data?.chartData || [];
  const topServices = data?.topServices || [];
  const pendingPayments = data?.pendingPayments || 0;

  function exportCSV() {
    if (assignments.length === 0) return;

    const headers = ["Date", "Customer", "Service", "Price", "Status"];
    const rows = assignments.map((a) => [
      new Date(a.assignedDate).toLocaleDateString("en-CA"),
      a.customer.name,
      a.service.name,
      a.customPrice.toString(),
      a.status,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    if (assignments.length === 0) return;

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("UDC Service Report", 14, 20);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-CA")}`, 14, 28);
      doc.text(`Period: ${TABS.find((t) => t.key === activeTab)?.label || activeTab}`, 14, 34);
      doc.text(`Total Assignments: ${assignments.length}`, 14, 40);
      doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, 46);
      doc.text(`Pending Payments: ${formatCurrency(pendingPayments)}`, 14, 52);

      // Main assignments table
      const tableData = assignments.map((a) => [
        new Date(a.assignedDate).toLocaleDateString("en-CA"),
        a.customer.name,
        a.service.name,
        a.customPrice.toString(),
        a.status,
      ]);

      autoTable(doc, {
        startY: 60,
        head: [["Date", "Customer", "Service", "Price", "Status"]],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Top services table
      if (topServices.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalY = (doc as any).lastAutoTable?.finalY || 180;
        doc.setFontSize(12);
        doc.text("Top Services", 14, finalY + 12);

        autoTable(doc, {
          startY: finalY + 18,
          head: [["Service", "Assignments", "Revenue"]],
          body: topServices.map((s) => [s.name, s.count.toString(), s.revenue.toString()]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [124, 58, 237] },
        });
      }

      doc.save(`report-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch {
      // PDF generation failed
    }
  }

  return (
    <PageShell>
      <PageHeader title="Reports" subtitle="Detailed service assignment and revenue reports">
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={assignments.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={exportPDF}
            disabled={assignments.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </PageHeader>

      {/* Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === tab.key
                  ? "bg-surface text-primary shadow-sm"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="form-input"
            />
            <span className="text-sm text-tertiary">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
            />
          </div>
        )}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">Failed to load report data</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Total Assignments
                </span>
              </div>
              <p className="amount-text text-xl text-[var(--text-primary)]">
                {assignments.length}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="stat-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Total Revenue
                </span>
              </div>
              <p className="amount-text text-xl text-[var(--text-primary)]">
                {formatCurrency(totalRevenue)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="stat-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Pending Payments
                </span>
              </div>
              <p className="amount-text text-xl text-[var(--text-primary)]">
                {formatCurrency(pendingPayments)}
              </p>
            </motion.div>
          </div>

          {/* Top Services */}
          {topServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[var(--text-secondary)]" />
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Top Services
                </h2>
              </div>
              <div className="space-y-3">
                {topServices.slice(0, 5).map((svc, i) => (
                  <div key={svc.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--text-tertiary)] w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {svc.name}
                        </span>
                        <span className="text-sm font-semibold text-[var(--text-primary)] ml-2">
                          {formatCurrency(svc.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                            style={{
                              width: `${Math.min(100, (svc.revenue / (topServices[0]?.revenue || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                          {svc.count} {svc.count === 1 ? "assignment" : "assignments"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Revenue Chart */}
          {chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[var(--text-secondary)]" />
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Revenue Chart
                </h2>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      formatter={(value) => [formatCurrency(Number(value) || 0), "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Data Table */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            {assignments.length === 0 ? (
              <div className="text-center py-16">
                <CalendarDays className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  No assignments found for this period
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Try selecting a different date range
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-muted)]">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment, i) => (
                      <motion.tr
                        key={assignment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                      >
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          {formatDate(assignment.assignedDate)}
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                          <span className="font-medium text-[var(--text-primary)]">
                            {assignment.customer.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-primary)]">
                          {assignment.service.name}
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-right">
                          <span className="amount-text text-[var(--text-primary)]">
                            {formatCurrency(assignment.customPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-t border-subtle">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            assignment.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : assignment.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
