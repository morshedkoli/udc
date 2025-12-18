'use client';

import { useState, useEffect, useCallback } from 'react';
import ServiceForm from '@/components/ServiceForm';
import ProtectedRoute from '@/components/ProtectedRoute';

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

export default function Dashboard() {
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalServices: 0,
    totalRevenue: 0,
    genderBreakdown: {
      male: 0,
      female: 0,
      other: 0,
      preferNotToSay: 0
    }
  });
  const [loading, setLoading] = useState(true);

  // Calculate date range for current month
  const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch recent services
      const recentRes = await fetch('/api/data?type=recent');
      const recentData = await recentRes.json();
      setRecentServices(recentData);

      // Fetch stats for current month
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

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate gender percentages
  const calculateGenderPercentages = () => {
    const total = stats.genderBreakdown.male + stats.genderBreakdown.female +
      stats.genderBreakdown.other + stats.genderBreakdown.preferNotToSay;

    if (total === 0) return { male: 0, female: 0, other: 0, preferNotToSay: 0 };

    return {
      male: Math.round((stats.genderBreakdown.male / total) * 100),
      female: Math.round((stats.genderBreakdown.female / total) * 100),
      other: Math.round((stats.genderBreakdown.other / total) * 100),
      preferNotToSay: Math.round((stats.genderBreakdown.preferNotToSay / total) * 100)
    };
  };

  const genderPercentages = calculateGenderPercentages();

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              আপনার পরিষেবা, পেমেন্ট এবং গ্রাহক তথ্য ট্র্যাক করুন আধুনিক ও সহজ ইন্টারফেসে
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column: Form */}
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                <ServiceForm onServiceLogged={fetchDashboardData} />
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="xl:col-span-2 space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 hover-lift border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">মোট পরিষেবা</h3>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-slate-900">{stats.totalServices}</p>
                    <p className="text-xs text-slate-400 font-medium">এই মাসে</p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 hover-lift border-l-4 border-emerald-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">মোট আয়</h3>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-xs text-slate-400 font-medium">এই মাসে</p>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 hover-lift border-l-4 border-violet-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">গ্রাহক লিঙ্গসমূহ</h3>
                    <div className="p-2 bg-violet-50 rounded-lg">
                      <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">পুরুষ</span>
                      <span className="text-xs font-bold text-slate-700">{genderPercentages.male}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${genderPercentages.male}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">মহিলা</span>
                      <span className="text-xs font-bold text-slate-700">{genderPercentages.female}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${genderPercentages.female}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50">
                  <h2 className="text-lg font-bold text-slate-800">সর্বশেষ কার্যক্রম</h2>
                  <a href="/reports" className="text-sm font-semibold text-blue-600 hover:text-blue-700">সকল রিপোর্ট →</a>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-medium">তথ্য লোড হচ্ছে...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">তারিখ</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">পরিষেবা</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">লিঙ্গ</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">পরিমাণ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {recentServices.length > 0 ? (
                          recentServices.map((service) => (
                            <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {service.serviceDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-slate-900">{service.serviceName}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${service.customerGender === 'Male' ? 'bg-blue-50 text-blue-700' :
                                  service.customerGender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                  {service.customerGender === 'Male' ? 'পুরুষ' : service.customerGender === 'Female' ? 'মহিলা' : 'অন্যান্য'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="text-sm font-bold text-slate-900">{formatCurrency(service.amountPaid)}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-12 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <div className="p-3 bg-slate-50 rounded-full mb-3">
                                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                  </svg>
                                </div>
                                <p className="text-slate-400 font-medium">এখনো কোনও পরিষেবা লগ করা হয়নি</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
