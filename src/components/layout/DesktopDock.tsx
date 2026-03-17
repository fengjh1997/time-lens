"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumnBig, Compass, Settings } from "lucide-react";
import AppLogoMark from "@/components/layout/AppLogoMark";

const navItems = [
  { href: "/", label: "主画布", icon: Compass, matches: ["/", "/day", "/month"] },
  { href: "/dashboard", label: "数据", icon: ChartColumnBig, matches: ["/dashboard"] },
  { href: "/settings", label: "设置", icon: Settings, matches: ["/settings", "/auth"] },
];

export default function DesktopDock() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 hidden px-6 py-4 sm:block">
      <div className="glass-panel flex items-center justify-between rounded-[28px] px-5 py-4">
        <div className="flex items-center gap-3">
          <AppLogoMark />
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[var(--primary-color)]">Time Lens</p>
            <h1 className="mt-1 text-[20px] font-black tracking-tight">液态聚焦画布</h1>
          </div>
        </div>

        <nav className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-white/70 px-2 py-2 shadow-[var(--shadow-sm)] dark:bg-white/[0.05]">
          {navItems.map((item) => {
            const active =
              item.matches.some((match) => (match === "/" ? false : pathname.startsWith(match))) ||
              (item.href === "/" && (pathname === "/" || pathname === "/day" || pathname === "/month"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-black transition-all ${
                  active
                    ? "bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-glow)]"
                    : "text-subtle hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
