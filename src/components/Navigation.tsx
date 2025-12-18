'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: '/', label: 'ড্যাশবোর্ড' },
  { href: '/manage-services', label: 'সেবাসমূহ' },
  { href: '/reports', label: 'রিপোর্ট' },
];

export default function Navigation() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-lg font-semibold tracking-wide text-white">
              কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার
            </span>
            <span className="hidden text-xs uppercase tracking-[0.3em] text-blue-300/80 sm:inline">
              UDC
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-200 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:border-blue-400/70 hover:bg-blue-500/20"
            >
              Logout
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="md:hidden rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}