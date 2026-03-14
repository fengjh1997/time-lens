import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/MobileNav";
import ThemeProvider from "@/components/layout/ThemeProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Time Lens | 星辰透镜",
  description: "捕捉每一刻的心流状态 - Time Lens 时间管理与规划",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`${outfit.className} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-hidden relative">
              {children}
            </main>
            <MobileNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
