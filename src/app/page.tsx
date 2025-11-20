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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার</h1>
            <p className="text-gray-600">আপনার পরিষেবা, পেমেন্ট এবং গ্রাহক তথ্য ট্র্যাক করুন</p>
          </div>

          {/* Service Form */}
          <ServiceForm onServiceLogged={fetchDashboardData} />

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">ড্যাশবোর্ডের তথ্য লোড হচ্ছে...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">মোট পরিষেবা</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalServices}</p>
                  <p className="text-sm text-gray-500 mt-1">এই মাসে</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">মোট আয়</h3>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">গ্রাহক গোষ্ঠী</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">পুরুষ</span>
                    <span className="font-medium">{genderPercentages.male}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">মহিলা</span>
                    <span className="font-medium">{genderPercentages.female}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">অন্যান্য/না জানাল</span>
                    <span className="font-medium">
                      {genderPercentages.other + genderPercentages.preferNotToSay}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">সর্বশেষ কার্যক্রম</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          তারিখ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          পরিষেবা
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          লিঙ্গ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          পরিমাণ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentServices.length > 0 ? (
                        recentServices.map((service) => (
                          <tr key={service.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {service.serviceDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {service.serviceName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {service.customerGender}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(service.amountPaid)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            এখনো কোনও পরিষেবা লগ করা হয়নি
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Navigation to Reports */}
              <div className="mt-8 text-center">
                <a 
                  href="/reports" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  বিস্তারিত রিপোর্ট দেখুন
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
