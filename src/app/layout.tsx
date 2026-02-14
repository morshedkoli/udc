import type { Metadata } from "next";
import { Noto_Sans_Bengali, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Sidebar from "@/components/Sidebar";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans-bengali",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার — সেবা লগার",
  description: "ইউনিয়ন ডিজিটাল সেন্টারের সেবা আয়ের হিসাব এবং রিপোর্ট তৈরির ড্যাশবোর্ড।",
  openGraph: {
    title: "কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার — সেবা লগার",
    description: "ইউনিয়ন ডিজিটাল সেন্টারের সেবা আয়ের হিসাব এবং রিপোর্ট তৈরির ড্যাশবোর্ড।",
    type: "website",
    locale: "bn_BD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansBengali.variable}`}>
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