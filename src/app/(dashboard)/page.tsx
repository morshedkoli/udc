"use client";

import { useState, useEffect } from "react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const duration = 1000;
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
  }, [value]);

  return <span>{display.toLocaleString("en-US")}</span>;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "সুপ্রভাত";
  if (h < 17) return "শুভ অপরাহ্ন";
  return "শুভ সন্ধ্যা";
}

function SkeletonCard() {
  return (
    <div className="dashboard-card animate-pulse p-5">
      <div className="h-3 w-24 bg-[var(--bg-muted)] rounded mb-4" />
      <div className="h-8 w-32 bg-[var(--bg-muted)] rounded mb-2" />
      <div className="h-2.5 w-20 bg-[var(--bg-muted)] rounded" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="dashboard-card animate-pulse p-6">
      <div className="h-4 w-48 bg-[var(--bg-muted)] rounded mb-6" />
      <div className="h-72 bg-[var(--bg-muted)] rounded-xl" />
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
      label: "আজকের আয়",
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
      label: "মোট আয়",
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
      label: "মোট গ্রাহক",
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
      label: "সেবা সংখ্যা",
      value: data?.totalServices ?? 0,
      icon: Briefcase,
      gradient: "from-amber-500 to-orange-500",
      lightBg: "bg-amber-50 dark:bg-amber-500/10",
      color: "text-amber-600 dark:text-amber-400",
      format: "number",
      change: -2.4,
      positive: false,
    },
    {
      label: "বকেয়া",
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
      label: "নতুন বরাদ্দ",
      desc: "সেবা বরাদ্দ করুন",
      icon: PlusCircle,
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      href: "/customers?new=true",
      label: "নতুন গ্রাহক",
      desc: "গ্রাহক যোগ করুন",
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      href: "/services?new=true",
      label: "নতুন সেবা",
      desc: "সেবা তৈরি করুন",
      icon: Briefcase,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <PageShell>
      {/* ── Greeting header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {getGreeting()}, {session?.user?.name || "Admin"}
          </h1>
          <span className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-full">
            Premium
          </span>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          আপনার ড্যাশবোর্ডের সার্বিক পরিস্থিতি এক নজরে
        </p>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="dashboard-card group p-5"
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className={`w-10 h-10 rounded-xl ${stat.lightBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      <Icon className={`w-[19px] h-[19px] ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="amount-text text-[1.65rem] leading-none text-[var(--text-primary)] mb-1">
                      {stat.format === "currency" ? (
                        <>
                          <span className="text-lg opacity-50">৳</span>
                          <AnimatedNumber value={stat.value} />
                        </>
                      ) : (
                        <AnimatedNumber value={stat.value} />
                      )}
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stat.positive ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
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
          className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl mb-6"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">ডাটা লোড করতে সমস্যা হয়েছে</span>
          </div>
        </motion.div>
      )}

      {/* ── Chart + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="dashboard-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    মাসিক আয়
                  </h2>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">গত ৬ মাসের তথ্য</p>
                </div>
                <span className="px-3 py-1.5 text-[11px] font-semibold bg-gradient-to-r from-amber-400/20 to-amber-500/20 text-amber-600 rounded-full border border-amber-400/20">
                  +৮.২% এই মাসে
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.monthlyRevenue || []}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#6366f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "14px",
                        fontSize: "13px",
                        boxShadow: "var(--shadow-lg)",
                      }}
                      formatter={(value) => [formatCurrency(Number(value) || 0), "আয়"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      dot={false}
                      activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="dashboard-card p-6"
        >
          <div className="mb-5">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              দ্রুত কার্যক্রম
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">সবচেয়ে বেশি ব্যবহৃত</p>
          </div>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3.5 p-4 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-all duration-200 group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shrink-0 shadow-lg transition-transform duration-200 group-hover:scale-110 group-hover:shadow-xl`}>
                    <Icon className="w-[19px] h-[19px] text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-[var(--text-tertiary)]">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="dashboard-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              সাম্প্রতিক কার্যকলাপ
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">সর্বশেষ কার্যক্রমসমূহ</p>
          </div>
          <Link
            href="/activity"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            সব দেখুন
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--bg-muted)] rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 w-56 bg-[var(--bg-muted)] rounded mb-2" />
                  <div className="h-3 w-28 bg-[var(--bg-muted)] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="space-y-1">
            {data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-[var(--bg-muted)] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/10">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)] leading-snug">
                    {activity.details}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock className="w-6 h-6 text-[var(--text-tertiary)]" />
            </div>
            <p className="empty-state-title">কোনো কার্যকলাপ নেই</p>
            <p className="empty-state-description">
              নতুন কার্যকলাপ এখানে দেখা যাবে
            </p>
          </div>
        )}
      </motion.div>
    </PageShell>
  );
}
