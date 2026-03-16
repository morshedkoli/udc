import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-sans-bengali",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kalikachha UDC — Service Dashboard",
  description: "Kalikachha Union Digital Center Service Management Dashboard",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansBengali.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
