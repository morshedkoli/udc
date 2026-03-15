"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
  TrendingUp,
  Wallet,
  Users,
  Briefcase,
  AlertCircle,
  ArrowUpRight,
  PlusCircle,
  Clock,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface DashboardData {
  todayRevenue: number;
  totalRevenue: number;
  totalCustomers: number;
  totalServices: number;
  pendingAmount: number;
  monthlyRevenue: { month: string; revenue: number }[];
  recentActivity: {
    id: string;
    action: string;
    details: string;
    entityType: string;
    createdAt: string;
  }[];
}

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" as const },
  }),
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useState(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;
    const duration = 800;
    const stepTime = 16;
    const steps = Math.ceil(duration / stepTime);
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  });

  return <span>{display.toLocaleString("en-US")}</span>;
}

function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="h-4 w-24 bg-[var(--bg-muted)] rounded mb-3" />
      <div className="h-8 w-32 bg-[var(--bg-muted)] rounded mb-2" />
      <div className="h-3 w-20 bg-[var(--bg-muted)] rounded" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 animate-pulse">
      <div className="h-5 w-40 bg-[var(--bg-muted)] rounded mb-4" />
      <div className="h-64 bg-[var(--bg-muted)] rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<DashboardData>(
    "/api/dashboard",
    fetcher,
    { refreshInterval: 30000 }
  );

  const stats = [
    {
      label: "আজকের আয়",
      value: data?.todayRevenue ?? 0,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      format: "currency",
    },
    {
      label: "মোট আয়",
      value: data?.totalRevenue ?? 0,
      icon: Wallet,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      format: "currency",
    },
    {
      label: "মোট গ্রাহক",
      value: data?.totalCustomers ?? 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      format: "number",
    },
    {
      label: "সেবা সংখ্যা",
      value: data?.totalServices ?? 0,
      icon: Briefcase,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      format: "number",
    },
    {
      label: "বকেয়া",
      value: data?.pendingAmount ?? 0,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      format: "currency",
    },
  ];

  const quickActions = [
    {
      href: "/assignments/new",
      label: "নতুন বরাদ্দ",
      icon: PlusCircle,
      color: "text-indigo-500",
    },
    {
      href: "/customers?new=true",
      label: "নতুন গ্রাহক",
      icon: Users,
      color: "text-emerald-500",
    },
    {
      href: "/services?new=true",
      label: "নতুন সেবা",
      icon: Briefcase,
      color: "text-amber-500",
    },
  ];

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          ড্যাশবোর্ড
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          সার্বিক পরিস্থিতি এক নজরে
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="stat-card"
                  custom={i}
                  variants={statCardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="amount-text text-2xl text-[var(--text-primary)]">
                    {stat.format === "currency" ? (
                      <>
                        <span className="text-lg">৳</span>
                        <AnimatedNumber value={stat.value} />
                      </>
                    ) : (
                      <AnimatedNumber value={stat.value} />
                    )}
                  </div>
                </motion.div>
              );
            })}
      </div>

      {error && (
        <div className="bg-[var(--color-error-light)] border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>ডাটা লোড করতে সমস্যা হয়েছে</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6"
            >
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
                মাসিক আয় (গত ৬ মাস)
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyRevenue || []}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border-subtle)"
                    />
                    <XAxis
                      dataKey="month"
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
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6"
        >
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            দ্রুত কার্যক্রম
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-all group"
                >
                  <Icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {action.label}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-tertiary)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            সাম্প্রতিক কার্যকলাপ
          </h2>
          <Link
            href="/activity"
            className="text-xs font-medium text-[var(--brand-primary)] hover:underline"
          >
            সব দেখুন
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--bg-muted)] rounded-full" />
                <div className="flex-1">
                  <div className="h-3.5 w-48 bg-[var(--bg-muted)] rounded mb-1" />
                  <div className="h-3 w-24 bg-[var(--bg-muted)] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--brand-primary-subtle)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] truncate">
                    {activity.details}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">
              কোনো কার্যকলাপ নেই
            </p>
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}
