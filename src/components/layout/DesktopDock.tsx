"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChartColumnBig, Compass, Settings, SunMedium } from "lucide-react";

const navItems = [
  { href: "/day", label: "日", icon: SunMedium },
  { href: "/", label: "周", icon: Compass },
  { href: "/month", label: "全景", icon: CalendarDays },
  { href: "/dashboard", label: "数据", icon: ChartColumnBig },
  { href: "/settings", label: "设置", icon: Settings },
];

export default function DesktopDock() {
  const pathname = usePathname();

  return (
    <div className="hidden sm:flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] glass-panel sticky top-0 z-40">
      <div>
        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--primary-color)] font-black">Time Lens</p>
        <h1 className="text-[20px] font-black tracking-tight">聚焦当下，兼顾全景</h1>
      </div>

      <nav className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-white/70 dark:bg-white/5 px-2 py-2 shadow-[var(--shadow-sm)]">
        {navItems.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-black transition-all ${
                active
                  ? "bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-glow)]"
                  : "text-gray-500 hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
