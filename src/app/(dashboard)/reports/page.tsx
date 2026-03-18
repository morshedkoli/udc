"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  Download,
  FileText,
  Receipt,
  Wallet,
  CalendarDays,
  Loader2,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Printer,
  FileSpreadsheet,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { fetcher } from "@/lib/fetcher";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
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
type ExportType = "csv" | "pdf" | null;

interface PeriodOption {
  key: TabType;
  label: string;
  description: string;
}

const PERIODS: PeriodOption[] = [
  { key: "daily", label: "Daily", description: "Today's sales" },
  { key: "weekly", label: "Weekly", description: "Last 7 days" },
  { key: "biweekly", label: "15 Days", description: "Last 15 days" },
  { key: "monthly", label: "Monthly", description: "This month" },
  { key: "yearly", label: "Yearly", description: "This year" },
  { key: "custom", label: "Custom", description: "Select range" },
];

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("daily");
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState<ExportType>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({ period: activeTab });
    if (activeTab === "custom") {
      params.set("startDate", customStart);
      params.set("endDate", customEnd);
    }
    return params;
  }, [activeTab, customStart, customEnd]);

  const { data, isLoading, error } = useSWR<ReportsData>(
    `/api/reports?${queryParams.toString()}`,
    fetcher
  );

  const sales = data?.sales || [];
  const totalRevenue = data?.totalRevenue || 0;
  const chartData = data?.chartData || [];
  const topServices = data?.topServices || [];
  const totalSales = data?.totalSales || 0;

  const currentPeriod = PERIODS.find((p) => p.key === activeTab);

  // Calculate average sale value
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Get previous period comparison (mock data for now)
  const revenueChange = 12.5;
  const salesChange = 8.3;

  function exportCSV() {
    if (sales.length === 0) return;
    setExporting("csv");

    const headers = ["Date", "Customer", "Gender", "Service", "Price"];
    const rows = sales.map((s) => [
      new Date(s.saleDate).toLocaleDateString("en-CA"),
      s.customerName,
      s.customerGender,
      s.service?.name || "Unknown",
      s.price.toString(),
    ]);

    const csvContent =
      "\uFEFF" +
      [
        ["Sales Report", currentPeriod?.label || ""].join(" - "),
        ["Generated:", new Date().toLocaleString()].join(" "),
        "",
        headers.join(","),
        ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
        "",
        ["Total Sales:", totalSales.toString()].join(","),
        ["Total Revenue:", totalRevenue.toString()].join(","),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-report-${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(null);
    setShowExportMenu(false);
  }

  async function exportPDF() {
    if (sales.length === 0) return;
    setExporting("pdf");

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Sales Report", 14, 25);

      // Period info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Period: ${currentPeriod?.label || "Custom"}`, 14, 50);
      doc.text(
        `Date Range: ${formatDate(data?.periodStart || "")} - ${formatDate(data?.periodEnd || "")}`,
        14,
        58
      );
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 66);

      // Summary box
      doc.setFillColor(240, 240, 250);
      doc.roundedRect(14, 75, pageWidth - 28, 35, 3, 3, "F");
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 18, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Total Sales: ${totalSales}`, 18, 93);
      doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 18, 101);
      doc.text(`Average Sale: ${formatCurrency(avgSaleValue)}`, 100, 93);

      // Sales table
      autoTable(doc, {
        startY: 120,
        head: [["Date", "Customer", "Gender", "Service", "Price"]],
        body: sales.map((s) => [
          formatDate(s.saleDate),
          s.customerName || "Anonymous",
          s.customerGender.charAt(0).toUpperCase() + s.customerGender.slice(1),
          s.service?.name || "Unknown",
          formatCurrency(s.price),
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 250] },
      });

      // Top services section
      if (topServices.length > 0) {
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          ?.finalY || 200;

        if (finalY > 220) {
          doc.addPage();
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(50, 50, 50);
          doc.text("Top Services", 14, 20);

          autoTable(doc, {
            startY: 28,
            head: [["Service", "Sales Count", "Revenue"]],
            body: topServices.map((svc) => [
              svc.name,
              svc.count.toString(),
              formatCurrency(svc.revenue),
            ]),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [139, 92, 246] },
          });
        } else {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Top Services", 14, finalY + 15);

          autoTable(doc, {
            startY: finalY + 20,
            head: [["Service", "Sales Count", "Revenue"]],
            body: topServices.slice(0, 5).map((svc) => [
              svc.name,
              svc.count.toString(),
              formatCurrency(svc.revenue),
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [139, 92, 246] },
          });
        }
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${totalPages} - UDC Sales Report`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`sales-report-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(null);
      setShowExportMenu(false);
    }
  }

  return (
    <PageShell>
      <PageHeader title="Reports & Analytics" subtitle="Track your sales performance">
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={sales.length === 0 || exporting !== null}
            className="btn-primary"
          >
            {exporting === "csv" ? (
              <Loader2 className="animate-spin" />
            ) : exporting === "pdf" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download />
            )}
            {exporting ? "Exporting..." : "Export Report"}
            <ChevronDown className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-full mt-2 w-48 bg-surface border border-subtle rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <button
                onClick={exportCSV}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-muted transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Export as CSV
              </button>
              <button
                onClick={exportPDF}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-muted transition-colors"
              >
                <FileText className="w-4 h-4 text-rose-500" />
                Export as PDF
              </button>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-muted transition-colors"
              >
                <Printer className="w-4 h-4 text-blue-500" />
                Print Report
              </button>
            </motion.div>
          )}
        </div>
      </PageHeader>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4">
          <div className="flex items-center gap-2 text-secondary">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Select Period:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PERIODS.map((period) => (
              <button
                key={period.key}
                onClick={() => setActiveTab(period.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === period.key
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25"
                    : "bg-muted text-secondary hover:bg-surface-hover hover:text-primary"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {activeTab === "custom" && (
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-tertiary" />
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="input-premium text-sm py-2"
                />
              </div>
              <span className="text-tertiary">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input-premium text-sm py-2"
              />
            </div>
          )}
        </div>

        {currentPeriod && (
          <div className="px-4 pb-4 pt-0">
            <p className="text-sm text-tertiary">{currentPeriod.description}</p>
          </div>
        )}
      </motion.div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TrendingUp className="w-12 h-12 text-rose-400 mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Failed to load report</h3>
          <p className="text-sm text-secondary">Please try again later</p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
          <p className="text-sm text-secondary">Loading report data...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="dashboard-card stat-card"
            >
              <div className="stat-card-header">
                <div>
                  <span className="stat-card-label">Total Sales</span>
                  <div className="flex items-center gap-1 mt-1">
                    {salesChange >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-rose-500" />
                    )}
                    <span className={`text-xs ${salesChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {Math.abs(salesChange)}%
                    </span>
                  </div>
                </div>
                <div className="stat-card-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                  <Receipt style={{ color: "#3b82f6" }} />
                </div>
              </div>
              <div className="stat-card-value">
                <div className="stat-card-amount">
                  <AnimatedNumber value={totalSales} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="dashboard-card stat-card"
            >
              <div className="stat-card-header">
                <div>
                  <span className="stat-card-label">Total Revenue</span>
                  <div className="flex items-center gap-1 mt-1">
                    {revenueChange >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-rose-500" />
                    )}
                    <span className={`text-xs ${revenueChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {Math.abs(revenueChange)}%
                    </span>
                  </div>
                </div>
                <div className="stat-card-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                  <Wallet style={{ color: "#10b981" }} />
                </div>
              </div>
              <div className="stat-card-value">
                <div className="stat-card-amount">
                  <span className="stat-card-amount-currency">৳</span>
                  <AnimatedNumber value={totalRevenue} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="dashboard-card stat-card"
            >
              <div className="stat-card-header">
                <span className="stat-card-label">Average Sale</span>
                <div className="stat-card-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                  <TrendingUp style={{ color: "#8b5cf6" }} />
                </div>
              </div>
              <div className="stat-card-value">
                <div className="stat-card-amount">
                  <span className="stat-card-amount-currency">৳</span>
                  <AnimatedNumber value={Math.round(avgSaleValue)} />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="dashboard-card stat-card"
            >
              <div className="stat-card-header">
                <span className="stat-card-label">Services Sold</span>
                <div className="stat-card-icon" style={{ background: "rgba(236, 72, 153, 0.1)", color: "#ec4899" }}>
                  <BarChart3 style={{ color: "#ec4899" }} />
                </div>
              </div>
              <div className="stat-card-value">
                <div className="stat-card-amount">
                  <AnimatedNumber value={topServices.length} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="dashboard-card lg:col-span-2"
            >
              <div className="p-6 border-b border-subtle">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-primary">Revenue Trend</h2>
                    <p className="text-sm text-tertiary mt-1">
                      {chartData.length} days of data
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="text-sm text-secondary">Revenue</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {chartData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="var(--text-tertiary)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="var(--text-tertiary)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `৳${value}`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "12px",
                            fontSize: "13px",
                            boxShadow: "var(--shadow-lg)",
                          }}
                          formatter={(value) => [formatCurrency(Number(value) || 0), "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center text-center">
                    <BarChart3 className="w-12 h-12 text-tertiary mb-3" />
                    <p className="text-secondary">No revenue data for this period</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Top Services */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="dashboard-card"
            >
              <div className="p-6 border-b border-subtle">
                <h2 className="text-lg font-semibold text-primary">Top Services</h2>
                <p className="text-sm text-tertiary mt-1">By revenue</p>
              </div>
              <div className="p-6">
                {topServices.length > 0 ? (
                  <div className="space-y-4">
                    {topServices.slice(0, 6).map((svc, i) => (
                      <div key={svc.name} className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate">{svc.name}</p>
                          <p className="text-xs text-tertiary">{svc.count} sales</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(svc.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-10 h-10 text-tertiary mx-auto mb-2" />
                    <p className="text-sm text-secondary">No service data</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sales Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="dashboard-card"
          >
            <div className="p-6 border-b border-subtle flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-primary">Sales Details</h2>
                <p className="text-sm text-tertiary mt-1">{sales.length} transactions</p>
              </div>
            </div>

            {sales.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon">
                  <CalendarDays />
                </div>
                <p className="empty-state-title">No sales found</p>
                <p className="empty-state-description">
                  Try selecting a different date range
                </p>
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Gender</th>
                      <th>Service</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale, i) => (
                      <motion.tr
                        key={sale.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                      >
                        <td className="text-secondary">{formatDate(sale.saleDate)}</td>
                        <td>
                          <span className="font-medium text-primary">{sale.customerName}</span>
                        </td>
                        <td>
                          <span className="badge badge-default capitalize">
                            {sale.customerGender}
                          </span>
                        </td>
                        <td className="text-primary">{sale.service?.name || "Unknown Service"}</td>
                        <td className="text-right">
                          <span className="amount-text font-semibold text-primary">
                            {formatCurrency(sale.price)}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </PageShell>
  );
}
