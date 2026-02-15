'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import dataService from '@/lib/data-service';

interface Service {
    id: number;
    serviceName: string;
    serviceDate: string;
    amountPaid: number;
    customerGender: string;
    notes?: string;
}

export default function EntryPage() {
    const [formData, setFormData] = useState({
        serviceName: '',
        serviceDate: new Date().toISOString().split('T')[0],
        quantity: '1',
        amountPaid: '',
        customerGender: 'Male',
    });
    const [serviceOptions, setServiceOptions] = useState<string[]>([]);
    const [todayEntries, setTodayEntries] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
    const [todayTotal, setTodayTotal] = useState(0);
    const serviceSelectRef = useRef<HTMLSelectElement>(null);

    // Fetch service options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const data = await dataService.getServiceOptions();
                if (Array.isArray(data)) setServiceOptions(data);
            } catch (error) {
                console.error('Error fetching service options:', error);
                setServiceOptions([]);
            }
        };
        fetchOptions();
    }, []);

    // Fetch today's entries
    const fetchTodayEntries = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await dataService.getServices(today, today);
            if (Array.isArray(data)) {
                setTodayEntries(data);
                setTodayTotal(data.reduce((sum: number, s: Service) => sum + s.amountPaid, 0));
            }
        } catch (error) {
            console.error('Error fetching today entries:', error);
        }
    }, []);

    useEffect(() => {
        fetchTodayEntries();
    }, [fetchTodayEntries]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.serviceName || !formData.amountPaid) return;

        setLoading(true);
        setMessage(null);

        try {
            const result = await dataService.addService(formData);

            if (result.success) {
                setMessage({ type: 'success', text: '✓ সেবা সফলভাবে যোগ হয়েছে!' });

                // Reset form for next entry
                setFormData({
                    serviceName: '',
                    serviceDate: new Date().toISOString().split('T')[0],
                    quantity: '1',
                    amountPaid: '',
                    customerGender: 'Male',
                });

                // Refresh today's entries
                fetchTodayEntries();

                // Focus back to service select for next entry
                setTimeout(() => {
                    serviceSelectRef.current?.focus();
                }, 100);

                // Auto-clear success message
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: result.error || 'সেবা যোগ করতে ব্যর্থ হয়েছে' });
            }
        } catch {
            setMessage({ type: 'error', text: 'একটি সমস্যা হয়েছে' });
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount: number) => '৳' + amount.toLocaleString('en-US');

    const genderOptions = [
        { value: 'Male', label: 'পুরুষ', color: '#3b82f6' },
        { value: 'Female', label: 'মহিলা', color: '#ec4899' },
        { value: 'Other', label: 'অন্যান্য', color: '#8b5cf6' },
    ];

    return (
        <ProtectedRoute>
            <div className="animate-fade-in">
                {/* Page Header */}
                <div className="page-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
                                নতুন এন্ট্রি
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                দ্রুত সেবা এন্ট্রি করুন
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'var(--brand-primary-subtle)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--brand-primary-light)',
                                }}
                            >
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                    আজকের মোট আয়
                                </span>
                                <span className="amount-text" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-success)' }}>
                                    {formatAmount(todayTotal)}
                                </span>
                            </div>
                            <div
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-muted)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-subtle)',
                                }}
                            >
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                    আজকের এন্ট্রি
                                </span>
                                <span className="amount-text" style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                                    {todayEntries.length} টি
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="page-content">
                    <div className="responsive-grid-2">
                        {/* Entry Form */}
                        <div className="card">
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--brand-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>সেবা যোগ করুন</h2>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            নতুন সেবার তথ্য পূরণ করুন
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {/* Service Name */}
                                    <div>
                                        <label className="input-label">সেবার নাম *</label>
                                        <select
                                            ref={serviceSelectRef}
                                            className="input"
                                            value={formData.serviceName}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, serviceName: e.target.value }))}
                                            required
                                        >
                                            <option value="">— সেবা নির্বাচন করুন —</option>
                                            {serviceOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Quantity, Amount and Gender */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label className="input-label">পরিমাণ *</label>
                                            <input
                                                type="number"
                                                className="input"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                                                required
                                                min="1"
                                                step="1"
                                                placeholder="1"
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">মূল্য (৳) *</label>
                                            <div className="input-group">
                                                <span className="input-group-prefix">৳</span>
                                                <input
                                                    type="number"
                                                    className="input"
                                                    value={formData.amountPaid}
                                                    onChange={(e) => setFormData((prev) => ({ ...prev, amountPaid: e.target.value }))}
                                                    required
                                                    min="0"
                                                    step="1"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="input-label">লিঙ্গ *</label>
                                            <select
                                                className="input"
                                                value={formData.customerGender}
                                                onChange={(e) => setFormData((prev) => ({ ...prev, customerGender: e.target.value }))}
                                                required
                                            >
                                                {genderOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="input-label">তারিখ</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={formData.serviceDate}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, serviceDate: e.target.value }))}
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary btn-lg"
                                        style={{ width: '100%', marginTop: '0.5rem' }}
                                    >
                                        {loading ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: 'white' }} />
                                                যোগ হচ্ছে...
                                            </span>
                                        ) : (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M5 13l4 4L19 7" />
                                                </svg>
                                                যোগ করুন
                                            </>
                                        )}
                                    </button>

                                    {/* Message */}
                                    {message && (
                                        <div className={`toast ${message.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                                            {message.type === 'success' ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                    <polyline points="22 4 12 14.01 9 11.01" />
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="15" y1="9" x2="9" y2="15" />
                                                    <line x1="9" y1="9" x2="15" y2="15" />
                                                </svg>
                                            )}
                                            {message.text}
                                        </div>
                                    )}
                                </form>

                                {/* Keyboard shortcut hint */}
                                <div
                                    style={{
                                        marginTop: '1.25rem',
                                        padding: '0.75rem',
                                        background: 'var(--bg-muted)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="16" x2="12" y2="12" />
                                        <line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                                        টিপ: সেবা নির্বাচন → পরিমাণ লিখুন → Enter চাপুন
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Today's Entries List */}
                        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div
                                className="card-header"
                                style={{
                                    background: 'var(--bg-muted)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-surface)',
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
                                        <h2 style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>আজকের এন্ট্রি তালিকা</h2>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            সর্বশেষ যোগ করা সেবাসমূহ
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="badge badge-primary">{todayEntries.length} টি</span>
                                    <span className="badge badge-success" style={{ fontWeight: 600 }}>
                                        {formatAmount(todayTotal)}
                                    </span>
                                </div>
                            </div>

                            <div style={{ flex: 1, maxHeight: '520px', overflowY: 'auto' }}>
                                {todayEntries.length > 0 ? (
                                    <div style={{ padding: '0.75rem' }}>
                                        {todayEntries.map((entry, idx) => (
                                            <div key={entry.id} className="entry-item" style={{ marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span
                                                        style={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: 'var(--radius-full)',
                                                            background: 'var(--brand-primary-subtle)',
                                                            color: 'var(--brand-primary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: 'var(--text-xs)',
                                                            fontWeight: 700,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {todayEntries.length - idx}
                                                    </span>
                                                    <div>
                                                        <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)', display: 'block' }}>
                                                            {entry.serviceName}
                                                        </span>
                                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                                            {entry.customerGender === 'Male'
                                                                ? 'পুরুষ'
                                                                : entry.customerGender === 'Female'
                                                                    ? 'মহিলা'
                                                                    : 'অন্যান্য'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="amount-text" style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                                                    {formatAmount(entry.amountPaid)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state" style={{ padding: '3rem 2rem' }}>
                                        <div className="empty-state-icon">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <h3 className="empty-state-title">কোনো এন্ট্রি নেই</h3>
                                        <p className="empty-state-description">বাম দিকের ফর্ম ব্যবহার করে নতুন সেবা যোগ করুন</p>
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
