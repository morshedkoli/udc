'use client';

import { useState, useEffect } from 'react';

export default function ServiceForm({ onServiceLogged }: { onServiceLogged: () => void }) {
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceDate: new Date().toISOString().split('T')[0], // Automatically set to today's date
    amountPaid: '',
    customerGender: 'Male',
    notes: ''
  });
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  // Fetch service options from API
  useEffect(() => {
    const fetchServiceOptions = async () => {
      try {
        const response = await fetch('/api/data?type=service-options');
        const options = await response.json();
        setServiceOptions(options);
      } catch (error) {
        console.error('Error fetching service options:', error);
        // Fallback to default options if API fails
        setServiceOptions([
          'ফটোকপি',
          'জন্ম নিবন্ধন আবেদন',
          'ভূমি কর',
          'চাকরির আবেদন',
          'আইডি কার্ড আবেদন'
        ]);
      }
    };

    fetchServiceOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Service logged successfully!' });
        // Reset form but keep today's date
        setFormData({
          serviceName: '',
          serviceDate: new Date().toISOString().split('T')[0], // Reset to today's date
          amountPaid: '',
          customerGender: 'Male',
          notes: ''
        });
        // Notify parent component
        onServiceLogged();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to log service' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
      console.error('Error logging service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">নতুন পরিষেবা</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label htmlFor="serviceName" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
              পরিষেবার নাম *
            </label>

            <select
              id="serviceName"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium"
            >
              <option value="">নির্বাচন করুন</option>

              {serviceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amountPaid" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
                পরিমাণ *
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold">$</span>
                </div>
                <input
                  type="number"
                  id="amountPaid"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-bold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="customerGender" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
                লিঙ্গ *
              </label>

              <select
                id="customerGender"
                name="customerGender"
                value={formData.customerGender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium"
              >
                <option value="Male">পুরুষ</option>
                <option value="Female">মহিলা</option>
                <option value="Other">অন্যান্য</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
              মন্তব্য (ঐচ্ছিক)
            </label>

            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
              placeholder="অতিরিক্ত বিবরণ লিখুন..."
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] ${loading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'vibrant-gradient hover:shadow-blue-200/50 hover:-translate-y-1'
            }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>প্রক্রিয়াধীন...</span>
            </div>
          ) : 'লগ করুন'}
        </button>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
            <div className={`p-1 rounded-full ${message.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            </div>
            <span className="font-semibold text-sm">{message.text}</span>
          </div>
        )}
      </form>
    </div>
  );
}
