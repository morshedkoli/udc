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

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      const success = login(pin);
      
      if (success) {
        router.replace('/');
      } else {
        setError('Invalid PIN. Please try again.');
        setPin('');
      }
      
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-300">Kalikkachh UDC</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Sign in to continue</h1>
          <p className="mt-2 text-slate-400 text-sm">Enter your 4-digit PIN to access the service dashboard.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="pin" className="block text-sm font-medium text-white">PIN</label>
              <div className="relative">
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  autoComplete="off"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter 4-digit PIN"
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-white/40 text-sm font-semibold">
                  {pin.length}/4
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 ${
                isDisabled
                  ? 'bg-blue-400/40 cursor-not-allowed'
                  : 'bg-linear-to-r from-blue-500 to-indigo-500 hover:shadow-lg hover:shadow-blue-500/40'
              }`}
            >
              {(isSubmitting || isLoading) ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/50">
            Need access? Contact the Kalikkachh UDC administrator.
          </p>
        </div>
      </div>
    </div>
  );
}