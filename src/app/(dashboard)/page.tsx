"use client";

import { motion } from "framer-motion";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  Wallet,
  Users,
  Briefcase,
  AlertCircle,
  PlusCircle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
import { fetcher } from "@/lib/fetcher";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
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
      gradient: "from-emerald-500 to-teal-500",
      lightBg: "bg-emerald-50 dark:bg-emerald-500/10",
      color: "text-emerald-600 dark:text-emerald-400",
      format: "currency",
      change: 12.5,
      positive: true,
    },
    {
      label: "Total Revenue",
      value: data?.totalRevenue ?? 0,
      icon: Wallet,
      gradient: "from-blue-600 to-indigo-600",
      lightBg: "bg-blue-50 dark:bg-blue-500/10",
      color: "text-blue-600 dark:text-blue-400",
      format: "currency",
      change: 8.2,
      positive: true,
    },
    {
      label: "Total Customers",
      value: data?.totalCustomers ?? 0,
      icon: Users,
      gradient: "from-violet-500 to-purple-500",
      lightBg: "bg-violet-50 dark:bg-violet-500/10",
      color: "text-violet-600 dark:text-violet-400",
      format: "number",
      change: 3.1,
      positive: true,
    },
    {
      label: "Total Services",
      value: data?.totalServices ?? 0,
      icon: Briefcase,
      gradient: "from-indigo-500 to-violet-500",
      lightBg: "bg-indigo-50 dark:bg-indigo-500/10",
      color: "text-indigo-600 dark:text-indigo-400",
      format: "number",
      change: -2.4,
      positive: false,
    },
    {
      label: "Pending Amount",
      value: data?.pendingAmount ?? 0,
      icon: AlertCircle,
      gradient: "from-rose-500 to-pink-500",
      lightBg: "bg-rose-50 dark:bg-rose-500/10",
      color: "text-rose-600 dark:text-rose-400",
      format: "currency",
      change: -5.8,
      positive: false,
    },
  ];

  const quickActions = [
    {
      href: "/assignments/new",
      label: "Record Service",
      desc: "Log a service provided",
      icon: PlusCircle,
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      href: "/services?new=true",
      label: "New Service",
      desc: "Create a service",
      icon: Briefcase,
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const getGradientClass = (gradient: string) => {
    const gradientMap: Record<string, string> = {
      "from-emerald-500 to-teal-500": "linear-gradient(145deg, #10b981, #14b8a6)",
      "from-blue-600 to-indigo-600": "linear-gradient(145deg, #2563eb, #6366f1)",
      "from-violet-500 to-purple-500": "linear-gradient(145deg, #8b5cf6, #a855f7)",
      "from-indigo-500 to-violet-500": "linear-gradient(145deg, #6366f1, #8b5cf6)",
      "from-rose-500 to-pink-500": "linear-gradient(145deg, #f43f5e, #ec4899)",
    };
    return gradientMap[gradient] || gradientMap["from-indigo-500 to-violet-500"];
  };

  const getLightBgClass = (lightBg: string) => {
    const bgMap: Record<string, string> = {
      "bg-emerald-50 dark:bg-emerald-500/10": "background: rgba(16, 185, 129, 0.1);",
      "bg-blue-50 dark:bg-blue-500/10": "background: rgba(59, 130, 246, 0.1);",
      "bg-violet-50 dark:bg-violet-500/10": "background: rgba(139, 92, 246, 0.1);",
      "bg-indigo-50 dark:bg-indigo-500/10": "background: rgba(99, 102, 241, 0.1);",
      "bg-rose-50 dark:bg-rose-500/10": "background: rgba(244, 63, 94, 0.1);",
    };
    return bgMap[lightBg] || "";
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      "text-emerald-600 dark:text-emerald-400": "#10b981",
      "text-blue-600 dark:text-blue-400": "#3b82f6",
      "text-violet-600 dark:text-violet-400": "#8b5cf6",
      "text-indigo-600 dark:text-indigo-400": "#6366f1",
      "text-rose-600 dark:text-rose-400": "#f43f5e",
    };
    return colorMap[color] || "#6366f1";
  };

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
          <span className="dashboard-greeting-badge">
            Premium
          </span>
        </div>
        <p className="dashboard-greeting-subtitle">
          Here's what's happening with your business today
        </p>
      </motion.div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
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
                  <div 
                    className="stat-card-glow"
                    style={{ background: getGradientClass(stat.gradient) }}
                  />
                  
                  <div className="stat-card-header">
                    <span className="stat-card-label">
                      {stat.label}
                    </span>
                    <div 
                      className="stat-card-icon"
                      style={{ 
                        background: getLightBgClass(stat.lightBg),
                        color: getColorClass(stat.color)
                      }}
                    >
                      <Icon style={{ color: getColorClass(stat.color) }} />
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
                    <div 
                      className={`stat-card-change ${stat.positive ? 'stat-card-change-positive' : 'stat-card-change-negative'}`}
                    >
                      {stat.positive ? (
                        <ArrowUpRight />
                      ) : (
                        <ArrowDownRight />
                      )}
                      {Math.abs(stat.change)}%
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="error-alert"
        >
          <AlertCircle />
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
                  <h2 className="chart-card-title">
                    Monthly Revenue
                  </h2>
                  <p className="chart-card-subtitle">Last 6 months</p>
                </div>
                <span className="chart-card-badge">
                  +8.2% this month
                </span>
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
                      activeDot={{ r: 7, fill: "#6366f1", stroke: "#fff", strokeWidth: 3, filter: "drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))" }}
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
              <h2 className="quick-actions-title">
                Quick Actions
              </h2>
              <p className="quick-actions-subtitle">Get started quickly</p>
            </div>
            <div className="quick-actions-list">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="quick-action-item"
                  >
                    <div 
                      className="quick-action-icon"
                      style={{ background: getGradientClass(action.gradient) }}
                    >
                      <Icon />
                    </div>
                    <div className="quick-action-content">
                      <p className="quick-action-label">
                        {action.label}
                      </p>
                      <p className="quick-action-desc">{action.desc}</p>
                    </div>
                    <ArrowRight className="quick-action-arrow" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="dashboard-card activity-card"
      >
        <div className="activity-decor" />
        
        <div className="activity-header">
          <div>
            <h2 className="activity-title">
              Recent Activity
            </h2>
            <p className="activity-subtitle">Latest updates</p>
          </div>
          <Link
            href="/activity"
            className="activity-link"
          >
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
        ) : data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="activity-list">
            {data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="activity-item"
              >
                <div className="activity-icon">
                  <Clock />
                </div>
                <div className="activity-details">
                  <p className="activity-text">
                    {activity.details}
                  </p>
                  <p className="activity-time">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock />
            </div>
            <p className="empty-state-title">No recent activity</p>
            <p className="empty-state-description">
              New activities will appear here
            </p>
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}
