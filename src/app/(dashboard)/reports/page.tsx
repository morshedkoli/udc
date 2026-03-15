"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, formatBanglaDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { fetcher } from "@/lib/fetcher";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


type TabType = "daily" | "weekly" | "monthly" | "custom";

interface Assignment {
  id: string;
  customPrice: number;
  assignedDate: string;
  status: string;
  notes: string;
  customer: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
  };
  payments: {
    id: string;
    amount: number;
    paymentDate: string;
    method: string;
  }[];
}

function getDateRange(tab: TabType, customStart: string, customEnd: string) {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  switch (tab) {
    case "daily":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "weekly":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      break;
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "custom":
      start = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
      end = customEnd ? new Date(customEnd + "T23:59:59") : end;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  return { start, end };
}

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

  const { data: assignments, isLoading } = useSWR<Assignment[]>(
    "/api/assignments",
    fetcher
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: "daily", label: "দৈনিক" },
    { key: "weekly", label: "সাপ্তাহিক" },
    { key: "monthly", label: "মাসিক" },
    { key: "custom", label: "কাস্টম" },
  ];

  // Filter assignments by date range
  const { filteredAssignments, totalRevenue, chartData } = useMemo(() => {
    if (!assignments) return { filteredAssignments: [], totalRevenue: 0, chartData: [] };

    const { start, end } = getDateRange(activeTab, customStart, customEnd);

    const filtered = assignments.filter((a) => {
      const date = new Date(a.assignedDate);
      return date >= start && date <= end;
    });

    // Calculate total revenue from payments within filtered assignments
    let revenue = 0;
    filtered.forEach((a) => {
      if (a.payments) {
        a.payments.forEach((p) => {
          revenue += p.amount;
        });
      }
    });

    // Group revenue by day for chart
    const revenueByDay: Record<string, number> = {};
    filtered.forEach((a) => {
      if (a.payments) {
        a.payments.forEach((p) => {
          const day = new Date(p.paymentDate).toISOString().split("T")[0];
          revenueByDay[day] = (revenueByDay[day] || 0) + p.amount;
        });
      }
    });

    const chart = Object.entries(revenueByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
        revenue: amount,
      }));

    return { filteredAssignments: filtered, totalRevenue: revenue, chartData: chart };
  }, [assignments, activeTab, customStart, customEnd]);

  function exportCSV() {
    if (filteredAssignments.length === 0) return;

    const headers = ["তারিখ", "গ্রাহক", "সেবা", "মূল্য", "স্ট্যাটাস"];
    const rows = filteredAssignments.map((a) => [
      new Date(a.assignedDate).toLocaleDateString("en-CA"),
      a.customer.name,
      a.service.name,
      a.customPrice.toString(),
      a.status,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join(
        "\n"
      );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `report-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    if (filteredAssignments.length === 0) return;

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("UDC Service Report", 14, 20);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-CA")}`, 14, 28);
      doc.text(`Period: ${activeTab}`, 14, 34);
      doc.text(`Total Assignments: ${filteredAssignments.length}`, 14, 40);
      doc.text(`Total Revenue: ${totalRevenue}`, 14, 46);

      const tableData = filteredAssignments.map((a) => [
        new Date(a.assignedDate).toLocaleDateString("en-CA"),
        a.customer.name,
        a.service.name,
        a.customPrice.toString(),
        a.status,
      ]);

      autoTable(doc, {
        startY: 54,
        head: [["Date", "Customer", "Service", "Price", "Status"]],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [99, 102, 241] },
      });

      doc.save(`report-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch {
      // PDF generation failed silently
    }
  }

  return (
    <PageShell>
      <PageHeader title="রিপোর্ট" subtitle="সেবা বরাদ্দ ও আয়ের বিস্তারিত রিপোর্ট">
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={filteredAssignments.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={exportPDF}
            disabled={filteredAssignments.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] rounded-lg transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </PageHeader>

      {/* Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex gap-1 bg-[var(--bg-muted)] rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                activeTab === tab.key
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {activeTab === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
            />
            <span className="text-sm text-[var(--text-tertiary)]">থেকে</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] text-[var(--text-primary)]"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  মোট বরাদ্দ
                </span>
              </div>
              <p className="amount-text text-xl text-[var(--text-primary)]">
                {filteredAssignments.length}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="stat-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  মোট আয়
                </span>
              </div>
              <p className="amount-text text-xl text-[var(--text-primary)]">
                {formatCurrency(totalRevenue)}
              </p>
            </motion.div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[var(--text-secondary)]" />
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  দৈনিক আয়ের চার্ট
                </h2>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-subtle)"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="var(--text-tertiary)"
                      fontSize={12}
                    />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      formatter={(value) => [
                        formatCurrency(Number(value) || 0),
                        "আয়",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Data Table */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-16">
                <CalendarDays className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  এই সময়কালে কোনো বরাদ্দ পাওয়া যায়নি
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  অন্য তারিখ বা সময়কাল নির্বাচন করুন
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-muted)]">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        তারিখ
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        গ্রাহক
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        সেবা
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        মূল্য
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment, i) => (
                      <motion.tr
                        key={assignment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-[var(--bg-surface-hover)] transition-colors"
                      >
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          {formatBanglaDate(assignment.assignedDate)}
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                          <span className="font-medium text-[var(--text-primary)]">
                            {assignment.customer.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)] text-[var(--text-primary)]">
                          {assignment.service.name}
                        </td>
                        <td className="px-4 py-3 border-t border-[var(--border-subtle)]">
                          <span className="amount-text text-[var(--text-primary)]">
                            {formatCurrency(assignment.customPrice)}
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
