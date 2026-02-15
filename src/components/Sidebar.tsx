'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, logout, isPinOnlyMode } = useAuth();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isAuthenticated || pathname === '/login') {
        return null;
    }

    const navItems: NavItem[] = isPinOnlyMode
        ? [
            // PIN-only mode: Only Entry link available
            {
                href: '/entry',
                label: 'নতুন এন্ট্রি',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                ),
            },
        ]
        : [
            // Full mode: All navigation links
            {
                href: '/',
                label: 'ড্যাশবোর্ড',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                ),
            },
            {
                href: '/entry',
                label: 'নতুন এন্ট্রি',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                ),
            },
            {
                href: '/reports',
                label: 'রিপোর্ট',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                ),
            },
            {
                href: '/manage-services',
                label: 'সেবা ব্যবস্থাপনা',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l-.22-.38a2 2 0 0 0 2.73-.73l.15-.08a2 2 0 0 1 2 0l.43-.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                ),
            },
        ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Topbar */}
            <header
                className="mobile-topbar"
                style={{
                    boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
                }}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="icon-btn"
                    aria-label="Toggle menu"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--brand-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: 'white',
                        }}
                    >
                        ক
                    </div>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        কালিকচ্ছ UDC
                    </span>
                </div>

                <div style={{ width: 36 }} />
            </header>

            {/* Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Brand */}
                <div
                    style={{
                        padding: '1.5rem 1.25rem',
                        borderBottom: '1px solid var(--sidebar-border)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--brand-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.125rem',
                                fontWeight: 700,
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            }}
                        >
                            ক
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.3,
                                }}
                            >
                                কালিকচ্ছ UDC
                            </h1>
                            <p
                                style={{
                                    fontSize: '0.6875rem',
                                    color: 'var(--text-tertiary)',
                                    marginTop: '2px',
                                }}
                            >
                                সেবা লগার
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav
                    style={{
                        flex: 1,
                        padding: '1rem 0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        overflowY: 'auto',
                    }}
                >
                    <div
                        style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '0.5rem 0.875rem',
                            marginBottom: '0.25rem',
                        }}
                    >
                        {isPinOnlyMode ? 'এন্ট্রি মোড' : 'মেনু'}
                    </div>

                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 0.875rem',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.875rem',
                                    fontWeight: isActive ? 600 : 500,
                                    color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                                    background: isActive ? 'var(--sidebar-bg-active)' : 'transparent',
                                    transition: 'all var(--transition-fast)',
                                    textDecoration: 'none',
                                    position: 'relative',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'flex',
                                        flexShrink: 0,
                                        color: isActive ? 'var(--brand-primary)' : 'inherit',
                                    }}
                                >
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                                {isActive && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 3,
                                            height: 20,
                                            background: 'var(--brand-primary)',
                                            borderRadius: '0 3px 3px 0',
                                        }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div
                    style={{
                        padding: '1rem 0.75rem',
                        borderTop: '1px solid var(--sidebar-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                    }}
                >
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.625rem 0.875rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--sidebar-text)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            fontFamily: "'Noto Sans Bengali', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-muted)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {theme === 'dark' ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                            )}
                            <span>{theme === 'dark' ? 'ডার্ক মোড' : 'লাইট মোড'}</span>
                        </span>
                        <div className="theme-toggle" aria-label="Toggle theme" />
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.625rem 0.875rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'var(--color-error)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            fontFamily: "'Noto Sans Bengali', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-error-light)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>লগআউট</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
