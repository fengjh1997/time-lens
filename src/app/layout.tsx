import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/MobileNav";
import ThemeProvider from "@/components/layout/ThemeProvider";
import AuthProvider from "@/components/layout/AuthProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Time Lens | 星辰透镜",
  description: "捕捉每一刻的心流状态 - Time Lens 时间管理与规划",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "星辰透镜",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="ambient-bg">
              <div className="ambient-blob-1" />
              <div className="ambient-blob-2" />
            </div>
            <div className="flex h-screen overflow-hidden relative">
              <Sidebar />
              <main className="flex-1 min-w-0 overflow-hidden relative">
                {children}
              </main>
              <MobileNav />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
