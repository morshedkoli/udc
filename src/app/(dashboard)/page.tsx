"use client";

import { motion } from "framer-motion";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  Wallet,
  Receipt,
  Briefcase,
  PlusCircle,
  ArrowRight,
  User,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { fetcher } from "@/lib/fetcher";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { QuickSaleForm } from "@/components/features/QuickSaleForm";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      delay: i * 0.08, 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1] as const,
      opacity: { duration: 0.4 },
    },
  }),
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 20) return "Good evening";
  return "Good night";
}

function SkeletonCard() {
  return (
    <div className="dashboard-card stat-card skeleton">
      <div className="skeleton-label" />
      <div className="skeleton-value" />
      <div className="skeleton-change" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="dashboard-card skeleton-chart">
      <div className="skeleton-chart-title" />
      <div className="skeleton-chart-content" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, error, isLoading } = useSWR<DashboardData>(
    "/api/dashboard",
    fetcher,
    { refreshInterval: 30000 }
  );

  const stats = [
    {
      label: "Today's Revenue",
      value: data?.todayRevenue ?? 0,
      icon: TrendingUp,
      color: "#10b981",
      format: "currency",
    },
    {
      label: "Total Revenue",
      value: data?.totalRevenue ?? 0,
      icon: Wallet,
      color: "#3b82f6",
      format: "currency",
    },
    {
      label: "Total Sales",
      value: data?.totalSales ?? 0,
      icon: Receipt,
      color: "#8b5cf6",
      format: "number",
    },
    {
      label: "Active Services",
      value: data?.totalServices ?? 0,
      icon: Briefcase,
      color: "#6366f1",
      format: "number",
    },
  ];

  const quickActions = [
    {
      href: "/sales",
      label: "New Sale",
      desc: "Record a service sale",
      color: "#6366f1",
    },
    {
      href: "/services",
      label: "New Service",
      desc: "Add a new service",
      color: "#8b5cf6",
    },
  ];

  return (
    <PageShell>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="dashboard-greeting"
      >
        <div className="dashboard-greeting-decor" />
        <div className="dashboard-greeting-content">
          <h1 className="dashboard-greeting-title">
            {getGreeting()}, {session?.user?.name || "Admin"}
          </h1>
          <span className="dashboard-greeting-badge">Premium</span>
        </div>
        <p className="dashboard-greeting-subtitle">
          Here's what's happening with your business today
        </p>
      </motion.div>

      {/* Stat Cards + Quick Sale Form */}
      <div className="dashboard-top-section">
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', flex: '1' }}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="dashboard-card stat-card"
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="stat-card-header">
                      <span className="stat-card-label">{stat.label}</span>
                      <div
                        className="stat-card-icon"
                        style={{ background: `${stat.color}1A`, color: stat.color }}
                      >
                        <Icon style={{ color: stat.color }} />
                      </div>
                    </div>
                    <div className="stat-card-value">
                      <div className="amount-text stat-card-amount">
                        {stat.format === "currency" ? (
                          <>
                            <span className="stat-card-amount-currency">৳</span>
                            <AnimatedNumber value={stat.value} />
                          </>
                        ) : (
                          <AnimatedNumber value={stat.value} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {/* Quick Sale Form - Always visible */}
        <QuickSaleForm />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="error-alert"
        >
          <TrendingUp />
          <span className="error-alert-text">Failed to load dashboard data</span>
        </motion.div>
      )}

      {/* Chart + Quick Actions */}
      <div className="chart-section">
        {/* Revenue Chart */}
        <div className="chart-section-main">
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="dashboard-card chart-card"
            >
              <div className="chart-card-decor" />
              <div className="chart-card-header">
                <div>
                  <h2 className="chart-card-title">Monthly Revenue</h2>
                  <p className="chart-card-subtitle">Last 6 months</p>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyRevenue || []}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "14px",
                        fontSize: "13px",
                        boxShadow: "var(--shadow-lg)",
                        backdropFilter: "blur(8px)",
                      }}
                      formatter={(value) => [formatCurrency(Number(value) || 0), "Revenue"]}
                      labelStyle={{ color: "var(--text-secondary)", fontWeight: 500 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      dot={false}
                      activeDot={{ r: 7, fill: "#6366f1", stroke: "#fff", strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="chart-section-side">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="dashboard-card quick-actions-card"
          >
            <div className="quick-actions-decor" />
            <div className="quick-actions-header">
              <h2 className="quick-actions-title">Quick Actions</h2>
              <p className="quick-actions-subtitle">Get started quickly</p>
            </div>
            <div className="quick-actions-list">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="quick-action-item"
                >
                  <div
                    className="quick-action-icon"
                    style={{ background: `linear-gradient(145deg, ${action.color}, #7c3aed)` }}
                  >
                    <PlusCircle />
                  </div>
                  <div className="quick-action-content">
                    <p className="quick-action-label">{action.label}</p>
                    <p className="quick-action-desc">{action.desc}</p>
                  </div>
                  <ArrowRight className="quick-action-arrow" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Sales */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="dashboard-card activity-card"
      >
        <div className="activity-decor" />
        <div className="activity-header">
          <div>
            <h2 className="activity-title">Recent Sales</h2>
            <p className="activity-subtitle">Latest service sales</p>
          </div>
          <Link href="/sales" className="activity-link">
            View all
            <ArrowRight />
          </Link>
        </div>
        {isLoading ? (
          <div className="activity-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-activity">
                <div className="skeleton-activity-icon" />
                <div className="skeleton-activity-content">
                  <div className="skeleton-activity-text" />
                  <div className="skeleton-activity-time" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.recentSales && data.recentSales.length > 0 ? (
          <div className="activity-list">
            {data.recentSales.map((sale) => (
              <div key={sale.id} className="activity-item">
                <div className="activity-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                  <User style={{ color: '#6366f1' }} />
                </div>
                <div className="activity-details" style={{ flex: 1 }}>
                  <div className="flex items-center justify-between">
                    <p className="activity-text">{sale.customerName}</p>
                    <span className="amount-text" style={{ fontWeight: 600 }}>
                      {formatCurrency(sale.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="activity-time">{sale.service?.name}</p>
                    <p className="activity-time">{formatDate(sale.saleDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Receipt />
            </div>
            <p className="empty-state-title">No recent sales</p>
            <p className="empty-state-description">
              New sales will appear here
            </p>
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}
