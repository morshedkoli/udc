'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Service {
  id: number;
  serviceName: string;
  serviceDate: string;
  amountPaid: number;
  customerGender: string;
  notes?: string;
}

interface DailyGroup {
  date: string;
  services: number;
  revenue: number;
}

type ReportTab = 'daily' | 'weekly' | 'monthly' | 'custom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function StatCard({ title, value, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <p className="amount-text" style={{ fontSize: '1.5rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>
            {value}
          </p>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
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

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('daily');
  const [services, setServices] = useState<Service[]>([]);
  const [dailyGroups, setDailyGroups] = useState<DailyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Custom date range
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const formatAmount = (amount: number) => '৳' + amount.toLocaleString('en-US');

  const getBanglaDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const groupByDate = (data: Service[]): DailyGroup[] => {
    const grouped: Record<string, { services: number; revenue: number }> = {};
    data.forEach((s) => {
      if (!grouped[s.serviceDate]) grouped[s.serviceDate] = { services: 0, revenue: 0 };
      grouped[s.serviceDate].services++;
      grouped[s.serviceDate].revenue += s.amountPaid;
    });
    return Object.entries(grouped)
      .map(([date, d]) => ({ date, ...d }))
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const getDateRange = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    switch (tab) {
      case 'daily': {
        return { startDate: today, endDate: today };
      }
      case 'weekly': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 6);
        return { startDate: weekAgo.toISOString().split('T')[0], endDate: today };
      }
      case 'monthly': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { startDate: monthStart.toISOString().split('T')[0], endDate: today };
      }
      case 'custom': {
        return { startDate: customStart, endDate: customEnd };
      }
    }
  }, [tab, customStart, customEnd]);

  const fetchReport = useCallback(async () => {
    const range = getDateRange();
    if (!range.startDate || !range.endDate) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/data?type=range&startDate=${range.startDate}&endDate=${range.endDate}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'রিপোর্ট লোড করতে ব্যর্থ');
      }

      setServices(data);
      setDailyGroups(groupByDate(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'একটি সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    if (tab !== 'custom' || (customStart && customEnd)) {
      fetchReport();
    }
  }, [tab, customStart, customEnd, fetchReport]);

  const totalServices = services.length;
  const totalRevenue = services.reduce((sum, s) => sum + s.amountPaid, 0);

  // ── PDF Export ──
  const handleExportPDF = async () => {
    let container: HTMLDivElement | null = null;
    try {
      setPdfLoading(true);
      setError(null);

      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.backgroundColor = 'white';
      container.style.fontFamily = "'Noto Sans Bengali', sans-serif";
      document.body.appendChild(container);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = 210;
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;

      const range = getDateRange();
      const periodBn =
        tab === 'daily'
          ? `আজকের রিপোর্ট (${getBanglaDate(range.startDate)})`
          : tab === 'weekly'
            ? `সাপ্তাহিক রিপোর্ট (${getBanglaDate(range.startDate)} — ${getBanglaDate(range.endDate)})`
            : tab === 'monthly'
              ? `মাসিক রিপোর্ট (${getBanglaDate(range.startDate)} — ${getBanglaDate(range.endDate)})`
              : `কাস্টম রিপোর্ট (${getBanglaDate(range.startDate)} — ${getBanglaDate(range.endDate)})`;

      const renderChunk = async (html: string, addPage = false) => {
        if (!container) return;
        if (addPage) pdf.addPage();

        container.innerHTML = `<div style="padding: 20px; color: #1e293b;">${html}</div>`;
        await new Promise((r) => setTimeout(r, 500));

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, imgHeight);
      };

      // Header + Summary
      await renderChunk(`
        <div style="text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="font-size: 26px; margin: 0 0 5px 0; color: #171717;">কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার</h1>
          <h2 style="font-size: 16px; color: #10b981; margin: 0 0 8px 0;">সেবা রিপোর্ট</h2>
          <p style="font-size: 13px; color: #525252; margin: 0;">${periodBn}</p>
          <p style="font-size: 11px; color: #a3a3a3; margin: 5px 0 0 0;">তৈরির তারিখ: ${getBanglaDate(new Date().toISOString().split('T')[0])}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="font-size: 12px; color: #525252; margin: 0 0 4px 0;">মোট সেবা</p>
            <p style="font-size: 28px; font-weight: 800; margin: 0; color: #171717;">${totalServices}</p>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; text-align: center;">
            <p style="font-size: 12px; color: #525252; margin: 0 0 4px 0;">মোট আয়</p>
            <p style="font-size: 28px; font-weight: 800; margin: 0; color: #10b981;">৳${totalRevenue.toLocaleString('en-US')}</p>
          </div>
        </div>
      `);

      // Service-wise breakdown with gender stats
      const serviceStats: Record<string, { male: number; female: number; other: number; revenue: number }> = {};
      services.forEach((s) => {
        if (!serviceStats[s.serviceName]) {
          serviceStats[s.serviceName] = { male: 0, female: 0, other: 0, revenue: 0 };
        }
        if (s.customerGender === 'Male') serviceStats[s.serviceName].male++;
        else if (s.customerGender === 'Female') serviceStats[s.serviceName].female++;
        else serviceStats[s.serviceName].other++;
        serviceStats[s.serviceName].revenue += s.amountPaid;
      });

      const serviceEntries = Object.entries(serviceStats).sort((a, b) => b[1].revenue - a[1].revenue);

      if (serviceEntries.length > 0) {
        const serviceRows = serviceEntries
          .map(
            ([name, stats], idx) => {
              const total = stats.male + stats.female + stats.other;
              return `
          <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f9fafb'};">
            <td style="border: 1px solid #e5e5e5; padding: 8px; font-size: 12px;">${name}</td>
            <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-size: 12px; color: #3b82f6;">${stats.male}</td>
            <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-size: 12px; color: #ec4899;">${stats.female}</td>
            <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-size: 12px; color: #8b5cf6;">${stats.other}</td>
            <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-weight: 700; font-size: 12px;">${total}</td>
            <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: right; font-weight: 700; font-size: 12px;">৳${stats.revenue.toLocaleString('en-US')}</td>
          </tr>`;
            }
          )
          .join('');

        const totalMale = serviceEntries.reduce((sum, [, stats]) => sum + stats.male, 0);
        const totalFemale = serviceEntries.reduce((sum, [, stats]) => sum + stats.female, 0);
        const totalOther = serviceEntries.reduce((sum, [, stats]) => sum + stats.other, 0);

        await renderChunk(
          `
          <h3 style="font-size: 16px; border-bottom: 2px solid #10b981; padding-bottom: 6px; margin: 0 0 12px 0;">
            সেবা অনুযায়ী বিবরণ
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #10b981; color: white;">
                <th style="border: 1px solid #059669; padding: 8px; text-align: left; font-size: 12px;">সেবার নাম</th>
                <th style="border: 1px solid #059669; padding: 8px; text-align: center; font-size: 12px;">পুরুষ</th>
                <th style="border: 1px solid #059669; padding: 8px; text-align: center; font-size: 12px;">মহিলা</th>
                <th style="border: 1px solid #059669; padding: 8px; text-align: center; font-size: 12px;">অন্যান্য</th>
                <th style="border: 1px solid #059669; padding: 8px; text-align: center; font-size: 12px;">মোট</th>
                <th style="border: 1px solid #059669; padding: 8px; text-align: right; font-size: 12px;">আয়</th>
              </tr>
            </thead>
            <tbody>${serviceRows}</tbody>
            <tfoot>
              <tr style="background: #f5f5f5; font-weight: 700;">
                <td style="border: 1px solid #e5e5e5; padding: 8px; font-size: 12px;">সর্বমোট</td>
                <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-size: 12px; color: #3b82f6;">${totalMale}</td>
                <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-size: 12px; color: #ec4899;">${totalFemale}</td>
                <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-size: 12px; color: #8b5cf6;">${totalOther}</td>
                <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-size: 12px;">${totalServices}</td>
                <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: right; font-size: 12px;">৳${totalRevenue.toLocaleString('en-US')}</td>
              </tr>
            </tfoot>
          </table>`,
          true
        );
      }

      // Daily breakdown (chunked)
      const rowsPerChunk = 25;
      for (let i = 0; i < dailyGroups.length; i += rowsPerChunk) {
        const chunk = dailyGroups.slice(i, i + rowsPerChunk);
        const rows = chunk
          .map(
            (g, idx) => `
          <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f9fafb'};">
            <td style="border: 1px solid #e5e5e5; padding: 8px; font-size: 12px;">${getBanglaDate(g.date)}</td>
            <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-size: 12px;">${g.services}</td>
            <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: right; font-weight: 700; font-size: 12px;">৳${g.revenue.toLocaleString('en-US')}</td>
          </tr>`
          )
          .join('');

        await renderChunk(
          `
          <h3 style="font-size: 16px; border-bottom: 2px solid #10b981; padding-bottom: 6px; margin: 0 0 12px 0;">
            ${i === 0 ? 'দৈনিক বিবরণ' : 'দৈনিক বিবরণ (চলমান)'}
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #10b981; color: white;">
                <th style="border: 1px solid #059669; padding: 8px; text-align: left; font-size: 12px;">তারিখ</th>
                <th style="border: 1px solid #059669; padding: 8px; text-align: center; font-size: 12px;">সেবা সংখ্যা</th>
                <th style="border: 1px solid #059669; padding: 8px; text-align: right; font-size: 12px;">আয়</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            ${i + rowsPerChunk >= dailyGroups.length ? `
              <tfoot>
                <tr style="background: #f5f5f5; font-weight: 700;">
                  <td style="border: 1px solid #e5e5e5; padding: 8px; font-size: 12px;">মোট</td>
                  <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: center; font-size: 12px;">${totalServices}</td>
                  <td style="border: 1px solid #e5e5e5; padding: 8px; text-align: right; font-size: 12px;">৳${totalRevenue.toLocaleString('en-US')}</td>
                </tr>
              </tfoot>
            ` : ''}
          </table>`,
          true
        );
      }

      // Detailed table (chunked)
      const detailPerChunk = 30;
      for (let i = 0; i < services.length; i += detailPerChunk) {
        const chunk = services.slice(i, i + detailPerChunk);
        const rows = chunk
          .map(
            (s, idx) => `
          <tr style="background: ${idx % 2 === 0 ? '#fff' : '#f9fafb'};">
            <td style="border: 1px solid #e5e5e5; padding: 6px; font-size: 11px;">${getBanglaDate(s.serviceDate)}</td>
            <td style="border: 1px solid #e5e5e5; padding: 6px; font-size: 11px;">${s.serviceName}</td>
            <td style="border: 1px solid #e5e5e5; padding: 6px; text-align: center; font-size: 11px;">${s.customerGender === 'Male' ? 'পুরুষ' : s.customerGender === 'Female' ? 'মহিলা' : 'অন্যান্য'}</td>
            <td style="border: 1px solid #e5e5e5; padding: 6px; text-align: right; font-weight: 700; font-size: 11px;">৳${s.amountPaid.toLocaleString('en-US')}</td>
          </tr>`
          )
          .join('');

        await renderChunk(
          `
          <h3 style="font-size: 16px; border-bottom: 2px solid #10b981; padding-bottom: 6px; margin: 0 0 12px 0;">
            ${i === 0 ? 'বিস্তারিত সেবা তালিকা' : 'বিস্তারিত সেবা তালিকা (চলমান)'}
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #10b981; color: white;">
                <th style="border: 1px solid #059669; padding: 6px; text-align: left; font-size: 11px;">তারিখ</th>
                <th style="border: 1px solid #059669; padding: 6px; text-align: left; font-size: 11px;">সেবার নাম</th>
                <th style="border: 1px solid #059669; padding: 6px; text-align: center; font-size: 11px;">লিঙ্গ</th>
                <th style="border: 1px solid #059669; padding: 6px; text-align: right; font-size: 11px;">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>`,
          true
        );
      }

      const tabName = tab === 'daily' ? 'Daily' : tab === 'weekly' ? 'Weekly' : tab === 'monthly' ? 'Monthly' : 'Custom';
      pdf.save(`Kalikachh_UDC_${tabName}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      setError('PDF তৈরি করতে ব্যর্থ হয়েছে');
    } finally {
      setPdfLoading(false);
      if (container?.parentNode) document.body.removeChild(container);
    }
  };

  const tabLabels: { key: ReportTab; label: string }[] = [
    { key: 'daily', label: 'দৈনিক' },
    { key: 'weekly', label: 'সাপ্তাহিক' },
    { key: 'monthly', label: 'মাসিক' },
    { key: 'custom', label: 'কাস্টম' },
  ];

  return (
    <ProtectedRoute>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
                রিপোর্ট
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                দৈনিক, সাপ্তাহিক ও মাসিক রিপোর্ট দেখুন এবং PDF ডাউনলোড করুন
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleExportPDF}
              disabled={pdfLoading || services.length === 0}
            >
              {pdfLoading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} />
                  PDF তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  PDF ডাউনলোড
                </>
              )}
            </button>
          </div>
        </div>

        <div className="page-content">
          {/* Tabs */}
          <div className="tab-group" style={{ marginBottom: '1.5rem' }}>
            {tabLabels.map((t) => (
              <button
                key={t.key}
                className={`tab-item ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Custom date inputs */}
          {tab === 'custom' && (
            <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label className="input-label">শুরুর তারিখ</label>
                  <input
                    type="date"
                    className="input"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    style={{ width: 'auto' }}
                  />
                </div>
                <div>
                  <label className="input-label">শেষ তারিখ</label>
                  <input
                    type="date"
                    className="input"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    style={{ width: 'auto' }}
                  />
                </div>
                <button className="btn btn-primary" onClick={fetchReport} disabled={!customStart || !customEnd}>
                  রিপোর্ট দেখুন
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="toast toast-error" style={{ marginBottom: '1rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          )}

          {/* Report Content */}
          {!loading && services.length > 0 && (
            <>
              {/* Summary Cards */}
              <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                <StatCard
                  title="মোট সেবা"
                  value={totalServices}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  }
                  iconBg="var(--brand-primary-subtle)"
                  iconColor="var(--brand-primary)"
                />
                <StatCard
                  title="মোট আয়"
                  value={formatAmount(totalRevenue)}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  }
                  iconBg="var(--color-success-light)"
                  iconColor="var(--color-success)"
                />
                <StatCard
                  title="দিনের সংখ্যা"
                  value={dailyGroups.length}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  title="দৈনিক গড়"
                  value={formatAmount(dailyGroups.length > 0 ? Math.round(totalRevenue / dailyGroups.length) : 0)}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  }
                  iconBg="rgba(139, 92, 246, 0.1)"
                  iconColor="#8b5cf6"
                />
              </div>

              {/* Daily Breakdown Table */}
              {dailyGroups.length > 0 && (
                <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--color-info-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-info)',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <h2 style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>দৈনিক বিবরণ</h2>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                          প্রতিদিনের সেবা ও আয়ের বিবরণ
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>তারিখ</th>
                          <th style={{ textAlign: 'center' }}>সেবা সংখ্যা</th>
                          <th style={{ textAlign: 'right' }}>আয়</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyGroups.map((g) => (
                          <tr key={g.date}>
                            <td>{getBanglaDate(g.date)}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="badge badge-primary">{g.services} টি</span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span className="amount-text" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                                {formatAmount(g.revenue)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td style={{ fontWeight: 700 }}>মোট</td>
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>{totalServices} টি</td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="amount-text" style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                              {formatAmount(totalRevenue)}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Detailed Services Table */}
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
                      <h2 style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>বিস্তারিত সেবা তালিকা</h2>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        সকল সেবার বিস্তারিত তথ্য
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-primary">{services.length} টি</span>
                </div>
                <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>তারিখ</th>
                        <th>সেবার নাম</th>
                        <th>লিঙ্গ</th>
                        <th style={{ textAlign: 'right' }}>পরিমাণ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s, idx) => (
                        <tr key={s.id}>
                          <td style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>{idx + 1}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{getBanglaDate(s.serviceDate)}</td>
                          <td style={{ fontWeight: 500 }}>{s.serviceName}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background:
                                  s.customerGender === 'Male'
                                    ? 'rgba(59, 130, 246, 0.1)'
                                    : s.customerGender === 'Female'
                                      ? 'rgba(236, 72, 153, 0.1)'
                                      : 'rgba(139, 92, 246, 0.1)',
                                color:
                                  s.customerGender === 'Male'
                                    ? '#3b82f6'
                                    : s.customerGender === 'Female'
                                      ? '#ec4899'
                                      : '#8b5cf6',
                              }}
                            >
                              {s.customerGender === 'Male' ? 'পুরুষ' : s.customerGender === 'Female' ? 'মহিলা' : 'অন্যান্য'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span className="amount-text" style={{ fontWeight: 600 }}>
                              {formatAmount(s.amountPaid)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && services.length === 0 && !error && (
            <div className="card" style={{ padding: '4rem 2rem' }}>
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h3 className="empty-state-title">রিপোর্টের তথ্য নেই</h3>
                <p className="empty-state-description">উপরে একটি সময়সীমা নির্বাচন করুন</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
