'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Service {
  id: number;
  serviceName: string;
  serviceDate: string;
  amountPaid: number;
  customerGender: string;
  notes?: string;
}

interface Stats {
  totalServices: number;
  totalRevenue: number;
  genderBreakdown: {
    male: number;
    female: number;
    other: number;
    preferNotToSay: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: string;
}

function StatCard({ title, value, icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <p className="amount-text" style={{ fontSize: '1.75rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>
            {value}
          </p>
          {trend && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', marginTop: '0.375rem', fontWeight: 500 }}>
              {trend}
            </p>
          )}
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [todayServices, setTodayServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalServices: 0,
    totalRevenue: 0,
    genderBreakdown: { male: 0, female: 0, other: 0, preferNotToSay: 0 },
  });
  const [todayStats, setTodayStats] = useState({ count: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  const getToday = () => new Date().toISOString().split('T')[0];

  const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch recent services
      const recentRes = await fetch('/api/data?type=recent');
      const recentData = await recentRes.json();

      // Filter today's entries
      const today = getToday();
      const todayEntries = (recentData as Service[]).filter(
        (s: Service) => s.serviceDate === today
      );
      setTodayServices(todayEntries);
      setTodayStats({
        count: todayEntries.length,
        revenue: todayEntries.reduce((sum: number, s: Service) => sum + s.amountPaid, 0),
      });

      // Fetch monthly stats
      const { startDate, endDate } = getCurrentMonthRange();
      const statsRes = await fetch(`/api/data?type=stats&startDate=${startDate}&endDate=${endDate}`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatAmount = (amount: number) => {
    return '৳' + amount.toLocaleString('en-US');
  };

  const todayFormatted = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const quickActions = [
    {
      href: '/entry',
      label: 'নতুন সেবা যোগ করুন',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
      color: 'var(--brand-primary)',
    },
    {
      href: '/reports',
      label: 'রিপোর্ট দেখুন',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      color: 'var(--color-info)',
    },
    {
      href: '/manage-services',
      label: 'সেবা পরিচালনা',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      color: 'var(--color-warning)',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
                ড্যাশবোর্ড
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                {todayFormatted}
              </p>
            </div>
            <Link href="/entry" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              নতুন এন্ট্রি
            </Link>
          </div>
        </div>

        <div className="page-content">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                <StatCard
                  title="আজকের সেবা"
                  value={todayStats.count}
                  icon={
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  }
                  iconBg="var(--brand-primary-subtle)"
                  iconColor="var(--brand-primary)"
                />
                <StatCard
                  title="আজকের আয়"
                  value={formatAmount(todayStats.revenue)}
                  icon={
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  }
                  iconBg="var(--color-success-light)"
                  iconColor="var(--color-success)"
                />
                <StatCard
                  title="এই মাসের সেবা"
                  value={stats.totalServices}
                  icon={
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  }
                  iconBg="var(--color-info-light)"
                  iconColor="var(--color-info)"
                />
                <StatCard
                  title="এই মাসের আয়"
                  value={formatAmount(stats.totalRevenue)}
                  icon={
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  }
                  iconBg="rgba(139, 92, 246, 0.1)"
                  iconColor="#8b5cf6"
                />
              </div>

              {/* Main Content Grid */}
              <div className="responsive-grid-2">
                {/* Today's Entries */}
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--brand-primary-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--brand-primary)',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h2 style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: '2px' }}>আজকের এন্ট্রি</h2>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                          সর্বশেষ সেবা তালিকা
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-primary">{todayStats.count} টি</span>
                  </div>

                  <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    {todayServices.length > 0 ? (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>সেবার নাম</th>
                            <th style={{ textAlign: 'right' }}>পরিমাণ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {todayServices.map((s) => (
                            <tr key={s.id}>
                              <td style={{ fontWeight: 500 }}>{s.serviceName}</td>
                              <td style={{ textAlign: 'right' }}>
                                <span className="amount-text" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                                  {formatAmount(s.amountPaid)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--bg-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                          }}
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p style={{ color: 'var(--text-tertiary)', fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                          আজ কোনো এন্ট্রি নেই
                        </p>
                        <Link href="/entry" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                          এন্ট্রি শুরু করুন
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Quick Actions */}
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      দ্রুত কার্যক্রম
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {quickActions.map((action) => (
                        <Link
                          key={action.href}
                          href={action.href}
                          className="btn btn-secondary"
                          style={{
                            textDecoration: 'none',
                            justifyContent: 'flex-start',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          <span style={{ color: action.color }}>{action.icon}</span>
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, var(--brand-primary-subtle) 0%, var(--bg-surface) 100%)' }}>
                    <h3 style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: '0.75rem' }}>
                      মাসিক সারাংশ
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>মোট সেবা</span>
                        <span className="amount-text" style={{ fontWeight: 600 }}>{stats.totalServices} টি</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>মোট আয়</span>
                        <span className="amount-text" style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                          {formatAmount(stats.totalRevenue)}
                        </span>
                      </div>
                      <div className="divider" style={{ margin: '0.5rem 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>গড় প্রতি সেবা</span>
                        <span className="amount-text" style={{ fontWeight: 600 }}>
                          {stats.totalServices > 0 ? formatAmount(Math.round(stats.totalRevenue / stats.totalServices)) : '৳0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
