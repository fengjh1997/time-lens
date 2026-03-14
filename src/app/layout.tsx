import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Time Lens - 时间管理",
  description: "星辰能量驱动的时间管理与规划工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Ambient Background */}
        <div className="ambient-bg">
          <div className="ambient-blob-1"></div>
          <div className="ambient-blob-2"></div>
        </div>

        <div className="flex h-screen bg-transparent text-[var(--foreground)] overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto w-full max-w-[100vw] sm:max-w-none relative z-10">
            {children}
          </main>
        </div>

        <MobileNav />
      </body>
    </html>
  );
}
