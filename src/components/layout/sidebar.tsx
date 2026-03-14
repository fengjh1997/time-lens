"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, LayoutDashboard, Settings, Compass, Plus, Sprout, Sun } from "lucide-react";
import { useTimeStore } from "@/store/timeStore";

export default function Sidebar() {
  const pathname = usePathname();
  const { totalPoints } = useTimeStore();

  const navItems = [
    { name: "今日焦点", href: "/day", icon: Sun },
    { name: "一周回顾", href: "/", icon: Compass },
    { name: "月度全景", href: "/month", icon: Calendar },
    { name: "数据洞察", href: "/dashboard", icon: LayoutDashboard },
    { name: "应用设置", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-[var(--background)] border-r border-[#e5e5e5] dark:border-[#333333] flex flex-col hidden sm:flex pt-6 relative z-50">
      {/* App Header */}
      <div className="px-6 pb-6 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#40bf40] to-[#267326] flex items-center justify-center text-white text-sm font-bold shadow-sm">
            T
          </div>
          <span className="font-bold text-[17px] tracking-tight">Time Lens</span>
        </div>
      </div>

      {/* Gamification Status Area */}
      <div className="px-4 py-3.5 mx-4 my-2 rounded-2xl bg-[var(--hover-bg)] flex items-center gap-3.5 backdrop-blur-xl border border-white/10 shadow-sm transition-transform hover:scale-[1.02] cursor-default">
        <div className="p-2 bg-[#cce8cc] text-[#1a4d1a] dark:bg-[#1a4d1a] dark:text-[#cce8cc] rounded-full shadow-inner">
          <Sprout size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-500 font-semibold tracking-wider">专注能量值</span>
          <span className="text-base font-black text-[#33a333] dark:text-[#40bf40] tracking-tight">
            {totalPoints.toLocaleString()} <span className="text-xs font-semibold opacity-60">pts</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 flex flex-col gap-1">
        <div className="px-3 py-2 text-[11px] font-bold text-gray-400 tracking-widest mt-2 mb-1">功能导航</div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
               key={item.name}
               href={item.href}
               className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[14px] transition-all duration-300 ease-out
                 ${isActive 
                   ? "bg-[var(--foreground)] text-[var(--background)] font-medium shadow-md shadow-black/5 dark:shadow-white/5 transform scale-[1.02]" 
                   : "text-gray-500 hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
                 }
               `}
            >
              <Icon size={18} className={isActive ? "text-[var(--background)]" : "text-gray-400"} />
              <span className="flex-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-5 mt-auto">
        <button className="w-full flex items-center justify-center gap-2 bg-[#33a333] hover:bg-[#2e922e] text-white px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(51,163,51,0.3)] hover:shadow-[0_6px_20px_rgba(51,163,51,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-200">
          <Plus size={18} strokeWidth={2.5} />
          <span>记录时段</span>
        </button>
      </div>
    </aside>
  );
}
