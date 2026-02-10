'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ServiceOption {
    name: string;
    index: number;
}

export default function ManageServices() {
    const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
    const [newServiceName, setNewServiceName] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

    const fetchServiceOptions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/service-options');
            const data = await res.json();
            if (Array.isArray(data)) {
                setServiceOptions(data.map((name: string, index: number) => ({ name, index })));
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
                setMessage({ type: 'success', text: '✓ সেবা সফলভাবে যুক্ত হয়েছে!' });
                setNewServiceName('');
                fetchServiceOptions();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: result.error || 'ব্যর্থ হয়েছে' });
            }
        } catch {
            setMessage({ type: 'error', text: 'একটি সমস্যা হয়েছে' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (index: number, name: string) => {
        setEditingIndex(index);
        setEditingName(name);
    };

    const handleSaveEdit = async (index: number) => {
        if (!editingName.trim()) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/service-options', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index, name: editingName.trim() }),
            });

            const result = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: '✓ সেবা সফলভাবে আপডেট হয়েছে!' });
                setEditingIndex(null);
                setEditingName('');
                fetchServiceOptions();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: result.error || 'আপডেট ব্যর্থ হয়েছে' });
            }
        } catch {
            setMessage({ type: 'error', text: 'একটি সমস্যা হয়েছে' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (index: number, name: string) => {
        if (!confirm(`আপনি কি "${name}" সেবাটি মুছে ফেলতে চান?`)) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/service-options', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index }),
            });

            const result = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: '✓ সেবা সফলভাবে মুছে ফেলা হয়েছে!' });
                fetchServiceOptions();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: result.error || 'মুছে ফেলা ব্যর্থ হয়েছে' });
            }
        } catch {
            setMessage({ type: 'error', text: 'একটি সমস্যা হয়েছে' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingName('');
    };

    return (
        <ProtectedRoute>
            <div className="animate-fade-in">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: '0.375rem', letterSpacing: '-0.02em' }}>
                            সেবা ব্যবস্থাপনা
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                            নতুন সেবার নাম যুক্ত করুন, সম্পাদনা করুন বা মুছে ফেলুন
                        </p>
                    </div>
                </div>

                <div className="page-content">
                    {/* Message */}
                    {message && (
                        <div className={`toast ${message.type === 'success' ? 'toast-success' : 'toast-error'}`} style={{ marginBottom: '1.5rem' }}>
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

                    <div className="responsive-grid-2" style={{ maxWidth: '1000px' }}>
                        {/* Add Service */}
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
                                        <h2 style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>নতুন সেবা যুক্ত করুন</h2>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            নতুন সেবার নাম লিখুন
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label className="input-label">সেবার নাম</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={newServiceName}
                                            onChange={(e) => setNewServiceName(e.target.value)}
                                            placeholder="যেমন: অনলাইন আবেদন"
                                            required
                                        />
                                    </div>

                                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
                                        {submitting ? (
                                            <>
                                                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'white' }} />
                                                যুক্ত হচ্ছে...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M5 13l4 4L19 7" />
                                                </svg>
                                                যুক্ত করুন
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Service List */}
                        <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-secondary)',
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>বিদ্যমান সেবাসমূহ</h2>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                            মোট {serviceOptions.length} টি সেবা
                                        </p>
                                    </div>
                                </div>
                                <span className="badge badge-primary">{serviceOptions.length} টি</span>
                            </div>

                            <div style={{ flex: 1, maxHeight: '520px', overflowY: 'auto', padding: '0.75rem' }}>
                                {loading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                        <div className="spinner" style={{ width: 32, height: 32 }} />
                                    </div>
                                ) : serviceOptions.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {serviceOptions.map((option) => (
                                            <div
                                                key={option.index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.75rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '1px solid var(--border-subtle)',
                                                    background: 'var(--bg-surface)',
                                                    transition: 'all var(--transition-fast)',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: 32,
                                                        height: 32,
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
                                                    {option.index + 1}
                                                </span>

                                                {editingIndex === option.index ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            className="input"
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            style={{ flex: 1, fontSize: 'var(--text-sm)', padding: '0.5rem 0.75rem' }}
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleSaveEdit(option.index)}
                                                            disabled={submitting}
                                                            className="btn btn-primary btn-sm"
                                                            style={{ padding: '0.5rem 0.75rem' }}
                                                            title="সংরক্ষণ করুন"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                <path d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            disabled={submitting}
                                                            className="btn btn-secondary btn-sm"
                                                            style={{ padding: '0.5rem 0.75rem' }}
                                                            title="বাতিল করুন"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span style={{ flex: 1, fontWeight: 500, fontSize: 'var(--text-sm)' }}>{option.name}</span>
                                                        <button
                                                            onClick={() => handleEdit(option.index, option.name)}
                                                            disabled={submitting || editingIndex !== null}
                                                            className="icon-btn"
                                                            title="সম্পাদনা করুন"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(option.index, option.name)}
                                                            disabled={submitting || editingIndex !== null}
                                                            className="icon-btn"
                                                            style={{ color: 'var(--color-error)' }}
                                                            title="মুছে ফেলুন"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
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
                                        <h3 className="empty-state-title">কোনো সেবা পাওয়া যায়নি</h3>
                                        <p className="empty-state-description">বাম দিকের ফর্ম ব্যবহার করে নতুন সেবা যুক্ত করুন</p>
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
