import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import DesktopDock from "@/components/layout/DesktopDock";
import MobileNav from "@/components/layout/MobileNav";
import ThemeProvider from "@/components/layout/ThemeProvider";
import AuthProvider from "@/components/layout/AuthProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TimeFlow | 时流",
  description: "A fluid time canvas for day, week, month, and year planning.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TimeFlow",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
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

            <div className="relative flex h-screen flex-col overflow-hidden">
              <DesktopDock />
              <main className="relative min-w-0 flex-1 overflow-hidden">{children}</main>
              <MobileNav />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
