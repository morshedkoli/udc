import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার — সেবা লগার",
  description: "প্রতিদিনের সেবা আয় ট্র্যাক করুন, রিপোর্ট তৈরি করুন এবং PDF ডাউনলোড করুন",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div className="app-layout">
              <Sidebar />
              <div className="main-content">
                {children}
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}