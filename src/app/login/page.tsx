'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const isDisabled = useMemo(() => {
    return isSubmitting || isLoading || pin.length !== 4;
  }, [isSubmitting, isLoading, pin.length]);

  useEffect(() => {
    if (!isAuthenticated && isLoading) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;

    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      const success = login(pin);
      if (success) {
        router.replace('/');
      } else {
        setError('ভুল PIN। আবার চেষ্টা করুন।');
        setPin('');
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <div style={{ maxWidth: 420, width: '100%' }} className="animate-slide-up">
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-xl)',
              background: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: 'white',
              margin: '0 auto 1.25rem',
              boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)',
            }}
          >
            ক
          </div>
          <h1
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            কালিকচ্ছ UDC
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', fontWeight: 400 }}>
            সেবা লগার ড্যাশবোর্ড
          </p>
        </div>

        {/* Login Card */}
        <div
          className="card"
          style={{
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem', fontSize: 'var(--text-xl)' }}>
              লগইন করুন
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>আপনার ৪-সংখ্যার PIN দিন</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                PIN
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="pin-input"
                  type="password"
                  autoComplete="off"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="input"
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    letterSpacing: '0.5em',
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    paddingRight: '3.5rem',
                    paddingTop: '0.875rem',
                    paddingBottom: '0.875rem',
                  }}
                  placeholder="••••"
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    background: 'var(--bg-muted)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {pin.length}/4
                </div>
              </div>
            </div>

            {error && (
              <div className="toast toast-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {isSubmitting || isLoading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderTopColor: 'white' }} />
                  লগইন হচ্ছে...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                  </svg>
                  লগইন
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              অ্যাক্সেস প্রয়োজন?
              <br />
              কালিকচ্ছ UDC প্রশাসকের সাথে যোগাযোগ করুন
            </p>
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)',
          }}
        >
          © {new Date().getFullYear()} কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার
        </p>
      </div>
    </div>
  );
}
