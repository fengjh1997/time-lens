import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Time Lens - Time Management SaaS",
  description: "Gamified time management and tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Ambient Glassmorphism Background */}
        <div className="ambient-bg">
          <div className="ambient-blob-1"></div>
          <div className="ambient-blob-2"></div>
        </div>

        <div className="flex h-screen bg-transparent text-[var(--foreground)] overflow-hidden">
          {/* Sidebar Navigation */}
          <Sidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto w-full max-w-[100vw] sm:max-w-none relative z-10 glass-panel">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
