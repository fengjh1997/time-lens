"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChartColumnBig, Compass, Settings, SunMedium } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "日", href: "/day", icon: SunMedium },
    { name: "周", href: "/", icon: Compass },
    { name: "全景", href: "/month", icon: CalendarDays },
    { name: "数据", href: "/dashboard", icon: ChartColumnBig },
    { name: "设置", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:hidden z-50 border-t border-[var(--border-color)] glass-panel">
      <div className="flex items-center justify-around px-2 py-2 safe-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex min-w-[56px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-black transition-all ${
                isActive
                  ? "bg-[var(--primary-light)] text-[var(--primary-color)]"
                  : "text-gray-400"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
