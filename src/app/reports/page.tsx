'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Service {
  id: number;
  serviceName: string;
  serviceDate: string;
  amountPaid: number;
  customerGender: string;
  notes?: string;
}

interface ReportData {
  date: string;
  services: number;
  revenue: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState<'last15days' | 'monthly' | 'custom'>('last15days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Generate report data grouped by date
  const generateReportData = (services: Service[]) => {
    const grouped: Record<string, { services: number; revenue: number }> = {};
    
    services.forEach(service => {
      if (!grouped[service.serviceDate]) {
        grouped[service.serviceDate] = { services: 0, revenue: 0 };
      }
      grouped[service.serviceDate].services += 1;
      grouped[service.serviceDate].revenue += service.amountPaid;
    });
    
    return Object.entries(grouped).map(([date, data]) => ({
      date,
      services: data.services,
      revenue: data.revenue
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Fetch report data
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setServices([]);
    setReportData([]);
    
    try {
      let url = '/api/data?type=';
      
      switch (reportType) {
        case 'last15days':
          url += 'last15days';
          break;
        case 'custom':
          if (!customStartDate || !customEndDate) {
            throw new Error('Please select both start and end dates for custom reports');
          }
          url += `range&startDate=${customStartDate}&endDate=${customEndDate}`;
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch report data');
      }
      
      setServices(data);
      setReportData(generateReportData(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  }, [reportType, customStartDate, customEndDate]);

  // Generate report on report type change or date changes
  useEffect(() => {
    if (reportType !== 'custom' || (customStartDate && customEndDate)) {
      fetchReportData();
    }
  }, [reportType, customStartDate, customEndDate, fetchReportData]);

  // Calculate totals
  const totalServices = services.length;
  const totalRevenue = services.reduce((sum, service) => sum + service.amountPaid, 0);

  // Handle export to PDF
  const handleExportPDF = async () => {
    let element: HTMLElement | null = null;
    try {
      const period = reportType === 'last15days' 
        ? 'Last 15 Days' 
        : `${customStartDate} to ${customEndDate}`;

      console.log('Starting PDF export...');

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportData,
          services,
          totalServices,
          totalRevenue,
          period,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      // Get HTML content
      const htmlContent = await response.text();
      console.log('HTML content received, length:', htmlContent.length);
      
      // Create a temporary container with proper styling
      element = document.createElement('div');
      element.innerHTML = htmlContent;
      element.style.display = 'block';
      element.style.position = 'fixed';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.width = '210mm'; // A4 width
      element.style.padding = '0';
      element.style.margin = '0';
      element.style.backgroundColor = 'white';
      document.body.appendChild(element);

      // Wait a bit for fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Importing html2canvas and jsPDF...');

      // Dynamically import html2canvas and jsPDF
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      console.log('Converting HTML to canvas...');

      // Convert HTML to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      console.log('Canvas created, size:', canvas.width, 'x', canvas.height);

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      console.log('Adding image to PDF, height:', imgHeight);

      // Add image to PDF, handling multiple pages if needed
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      console.log('Saving PDF...');

      // Save PDF
      pdf.save(`service-report-${new Date().toISOString().slice(0, 10)}.pdf`);

      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to export PDF: ${errorMessage}`);
    } finally {
      // Clean up
      if (element && element.parentNode) {
        document.body.removeChild(element);
      }
    }
  };

  // Handle export to CSV
  const handleExportCSV = () => {
    // Create CSV content
    let csvContent = 'কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার\n';
    csvContent += 'Service Report\n\n';
    
    // Add report period
    const period = reportType === 'last15days' 
      ? 'Last 15 Days' 
      : `${customStartDate} to ${customEndDate}`;
    csvContent += `Period: ${period}\n\n`;
    
    // Add summary section
    csvContent += 'Report Summary\n';
    csvContent += `Total Services: ${totalServices}\n`;
    csvContent += `Total Revenue: ${formatCurrency(totalRevenue)}\n\n`;
    
    // Add daily breakdown table header
    csvContent += 'Daily Breakdown\n';
    csvContent += 'Date,Services,Revenue\n';
    
    // Add daily breakdown data
    reportData.forEach(item => {
      csvContent += `${item.date},${item.services},${formatCurrency(item.revenue)}\n`;
    });
    
    // Add detailed services table header
    csvContent += '\nDetailed Services\n';
    csvContent += 'Date,Service,Gender,Amount\n';
    
    // Add detailed services data
    services.forEach(service => {
      csvContent += `${service.serviceDate},"${service.serviceName}",${service.customerGender},${formatCurrency(service.amountPaid)}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `service-report-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              ← ড্যাশবোর্ডে ফিরে যান
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার</h1>
              <p className="text-gray-600">বিস্তারিত রিপোর্ট তৈরি ও এক্সপোর্ট করুন</p>
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">রিপোর্টের ধরণ নির্বাচন করুন</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setReportType('last15days')}
                className={`py-3 px-4 rounded-lg border ${
                  reportType === 'last15days'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">গত ১৫ দিন</div>
                <div className="text-sm text-gray-500 mt-1">প্রতিদিনের বিবরণ</div>
              </button>
              
              <button
                onClick={() => setReportType('monthly')}
                disabled
                className="py-3 px-4 rounded-lg border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                <div className="font-medium">মাসিক রিপোর্ট</div>
                <div className="text-sm text-gray-400 mt-1">শীঘ্রই আসছে</div>
              </button>
              
              <button
                onClick={() => setReportType('custom')}
                className={`py-3 px-4 rounded-lg border ${
                  reportType === 'custom'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">ব্যক্তিগত তারিখ</div>
                <div className="text-sm text-gray-500 mt-1">নিজের তারিখ নির্ধারণ করুন</div>
              </button>
            </div>
            
            {/* Custom Date Range Inputs */}
            {reportType === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    শুরুর তারিখ
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    শেষ তারিখ
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            
            {/* Generate Report Button */}
            <div className="flex justify-center">
              <button
                onClick={fetchReportData}
                disabled={loading || (reportType === 'custom' && (!customStartDate || !customEndDate))}
                className={`py-2 px-6 rounded-md text-white font-medium ${
                  loading || (reportType === 'custom' && (!customStartDate || !customEndDate))
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'রিপোর্ট তৈরি হচ্ছে...' : 'রিপোর্ট তৈরি করুন'}
              </button>
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">রিপোর্ট তৈরি হচ্ছে...</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">ত্রুটি</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report Summary */}
          {!loading && services.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">রিপোর্ট সারসংক্ষেপ</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">মোট পরিষেবা:</span>
                      <span className="font-medium">{totalServices}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">মোট আয়:</span>
                      <span className="font-medium text-green-600">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">রিপোর্টের সময়কাল:</span>
                      <span className="font-medium">
                        {reportType === 'last15days' 
                          ? 'গত ১৫ দিন' 
                          : `${customStartDate} থেকে ${customEndDate}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">রপ্তানির বিকল্প</h3>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="mr-2 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 7.5h2.5v1.58l-.79.79c-.45.45-.45 1.17 0 1.62.45.45 1.17.45 1.62 0l1.5-1.5V14h-5V7.5zm8.5-5H14V0h-4v2.5H7.5C5.02 2.5 3 4.52 3 7v10c0 2.48 2.02 4.5 4.5 4.5h9c2.48 0 4.5-2.02 4.5-4.5V7c0-2.48-2.02-4.5-4.5-4.5z"/>
                      </svg>
                      PDF আকারে ডাউনলোড করুন
                    </button>
                    
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="mr-2 h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      CSV আকারে ডাউনলোড করুন
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    {reportType === 'last15days' 
                      ? 'প্রতিদিনের বিবরণ (গত ১৫ দিন)' 
                      : 'প্রতিদিনের বিবরণ (ব্যক্তিগত সীমা)'}
                  </h2>
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
                          রাজস্ব
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.length > 0 ? (
                        reportData.map((data, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {data.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {data.services}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(data.revenue)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                            নির্বাচিত সময়সীমার জন্য তথ্য নেই
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {reportData.length > 0 && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            মোট তথ্য
                          </th>
                          <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {totalServices}
                          </td>
                          <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {formatCurrency(totalRevenue)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Detailed Services Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">বিস্তারিত পরিষেবা</h2>
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
                      {services.map((service) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Empty state */}
          {!loading && services.length === 0 && !error && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">রিপোর্টের তথ্য নেই</h3>
              <p className="mt-1 text-gray-500">
                একটি রিপোর্ট টাইপ নির্বাচন করে রিপোর্ট তৈরি করুন ও তথ্য দেখুন।
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}