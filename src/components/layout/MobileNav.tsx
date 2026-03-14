"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, LayoutDashboard, Settings, Compass, Sun } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "今日", href: "/day", icon: Sun },
    { name: "一周", href: "/", icon: Compass },
    { name: "月度", href: "/month", icon: Calendar },
    { name: "洞察", href: "/dashboard", icon: LayoutDashboard },
    { name: "设置", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:hidden z-50 bg-[var(--background)] border-t border-[#e5e5e5] dark:border-[#333333] backdrop-blur-xl">
      <div className="flex items-center justify-around py-2 px-1 safe-bottom">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200 min-w-[48px]
                ${isActive 
                  ? 'text-amber-500 dark:text-amber-400' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }
              `}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? 'font-black' : 'font-semibold'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
