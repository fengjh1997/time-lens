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
  manifest: process.env.NODE_ENV === "development" ? undefined : "/manifest.json",
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
              <div className="ambient-flow left-[12%] top-[14%] w-[26vw]" />
              <div className="ambient-flow right-[10%] top-[32%] w-[22vw]" />
              <div className="ambient-flow left-[18%] bottom-[18%] w-[18vw]" />
              <div className="ambient-particle left-[10%] top-[20%]" />
              <div className="ambient-particle left-[22%] top-[64%] [animation-delay:2s]" />
              <div className="ambient-particle right-[18%] top-[24%] [animation-delay:4s]" />
              <div className="ambient-particle right-[12%] bottom-[20%] [animation-delay:6s]" />
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
