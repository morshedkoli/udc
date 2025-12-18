'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ManageServices() {
    const [serviceOptions, setServiceOptions] = useState<string[]>([]);
    const [newServiceName, setNewServiceName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

    const fetchServiceOptions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/service-options');
            const data = await res.json();
            if (Array.isArray(data)) {
                setServiceOptions(data);
            }
        } catch (error) {
            console.error('Error fetching service options:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServiceOptions();
    }, [fetchServiceOptions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newServiceName.trim()) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/service-options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newServiceName.trim() }),
            });

            const result = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'পরিষেবা সফলভাবে যুক্ত হয়েছে!' });
                setNewServiceName('');
                fetchServiceOptions();
            } else {
                setMessage({ type: 'error', text: result.error || 'ব্যর্থ হয়েছে' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'একটি সমস্যা হয়েছে' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">সেবাসমূহ ব্যবস্থাপনা</h1>
                        <p className="text-slate-600">নতুন পরিষেবার নাম যুক্ত করুন যা ড্যাশবোর্ড ফর্মের তালিকায় দেখা যাবে</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Add Service Section */}
                        <div className="glass-card rounded-2xl p-8 h-fit">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </span>
                                নতুন সেবা যোগ করুন
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="serviceName" className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                        পরিষেবার নাম
                                    </label>
                                    <input
                                        type="text"
                                        id="serviceName"
                                        value={newServiceName}
                                        onChange={(e) => setNewServiceName(e.target.value)}
                                        placeholder="যেমন: অনলাইন আবেদন"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-3 px-6 rounded-xl text-white font-bold transition-all transform active:scale-[0.98] ${submitting ? 'bg-slate-400' : 'vibrant-gradient hover:shadow-lg hover:-translate-y-0.5'
                                        }`}
                                >
                                    {submitting ? 'যুক্ত হচ্ছে...' : 'যুক্ত করুন'}
                                </button>

                                {message && (
                                    <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                        }`}>
                                        {message.text}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* List Services Section */}
                        <div className="glass-card rounded-2xl p-8 overflow-hidden">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">বিদ্যমান সেবাসমূহ</h2>

                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {serviceOptions.length > 0 ? (
                                        serviceOptions.map((option, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors group">
                                                <span className="font-semibold text-slate-700">{option}</span>
                                                <span className="text-xs font-medium text-slate-400 group-hover:text-blue-500 transition-colors">সক্রিয়</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center py-10 text-slate-400 font-medium">কোনো সেবা পাওয়া যায়নি</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
