"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, LayoutDashboard, Settings, Compass, Sun } from "lucide-react";
import { useTimeStore } from "@/store/timeStore";
import { EnergyDisplay } from "@/components/ui/StarRating";

export default function Sidebar() {
  const pathname = usePathname();
  const { totalEnergy, settings } = useTimeStore();

  const navItems = [
    { name: "今日焦点", href: "/day", icon: Sun },
    { name: "一周规划", href: "/", icon: Compass },
    { name: "月度全景", href: "/month", icon: Calendar },
    { name: "数据洞察", href: "/dashboard", icon: LayoutDashboard },
    { name: "应用设置", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-[var(--background)] border-r border-[#e5e5e5] dark:border-[#333333] flex-col hidden sm:flex pt-6 relative z-50">
      {/* Logo */}
      <div className="px-6 pb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-black shadow-sm">
          ★
        </div>
        <span className="font-black text-[17px] tracking-tight">Time Lens</span>
      </div>

      {/* Energy Card */}
      <div className="px-4 py-4 mx-4 my-1 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 flex items-center gap-3.5 border border-amber-200/30 dark:border-amber-800/20 shadow-sm">
        <div className="p-2.5 bg-amber-400/20 dark:bg-amber-500/10 rounded-xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-amber-600/60 dark:text-amber-400/50 font-bold tracking-wider">总能量值</span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400 tracking-tight">
            <EnergyDisplay value={totalEnergy} decimals={settings.decimalPlaces} />
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4 flex flex-col gap-1">
        <div className="px-3 py-2 text-[11px] font-bold text-gray-400 tracking-widest mt-1 mb-1">功能导航</div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
               key={item.name}
               href={item.href}
               className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[14px] transition-all duration-300 ease-out
                 ${isActive 
                   ? "bg-[var(--foreground)] text-[var(--background)] font-semibold shadow-md" 
                   : "text-gray-500 hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)] font-medium"
                 }
               `}
            >
              <Icon size={18} className={isActive ? "text-[var(--background)]" : "text-gray-400"} />
              <span className="flex-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
