import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার",
  description: "Track services, payments, and customer demographics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 bn-font">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,#e2e8f0_0%,#f8fafc_100%)] opacity-40"></div>
        <AuthProvider>
          <Navigation />
          <main className="relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}