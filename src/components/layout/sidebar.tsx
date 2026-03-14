"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  LayoutDashboard, 
  Compass, 
  Sun, 
  Settings, 
  Star,
  Moon,
  Sparkles
} from "lucide-react";
import { useTimeStore } from "@/store/timeStore";
import { EnergyDisplay } from "@/components/ui/StarRating";

const NAV_ITEMS = [
  { icon: Compass, label: "一周规划", href: "/" },
  { icon: Sun, label: "今日焦点", href: "/day" },
  { icon: Calendar, label: "全景视野", href: "/month" },
  { icon: LayoutDashboard, label: "数据洞察", href: "/dashboard" },
  { icon: Settings, label: "应用设置", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { totalEnergy, settings, toggleTheme } = useTimeStore();

  return (
    <div className="w-[260px] h-full bg-[var(--background)] border-r border-[#e5e5e5] dark:border-[#333333] hidden sm:flex flex-col p-6">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-[14px] bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Star size={22} color="white" fill="white" />
        </div>
        <div>
          <h1 className="font-black text-xl tracking-tight leading-none italic">Time Lens</h1>
          <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Star Energy</span>
        </div>
      </div>

      {/* Energy Card */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[28px] p-5 text-white mb-8 shadow-xl shadow-amber-500/20 group relative overflow-hidden transition-transform hover:scale-[1.02]">
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
        <p className="text-[11px] font-black opacity-80 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={12} />
          当前总能量
        </p>
        <div className="text-3xl font-black mt-2 flex items-center gap-1">
          <EnergyDisplay value={totalEnergy} />
        </div>
        <div className="mt-3 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
          <div className="bg-white h-full w-[65%] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        </div>
        <p className="text-[10px] font-bold mt-2 opacity-70">距离下一等级还需 42.5 ★</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                ${isActive 
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                  : "text-gray-400 font-bold hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                }
              `}
            >
              <item.icon size={20} className={isActive ? "text-white" : "group-hover:scale-110 transition-transform"} />
              <span className="text-[14px] font-black">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle & User */}
      <div className="pt-6 border-t border-[#e5e5e5] dark:border-[#333333] space-y-4">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all group"
        >
          <div className="flex items-center gap-3">
             {settings.theme === 'light' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-blue-400" />}
             <span className="text-[13px] font-black text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
               {settings.theme === 'light' ? '白天模式' : '深色模式'}
             </span>
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${settings.theme === 'light' ? 'bg-amber-200' : 'bg-blue-900'}`}>
             <div className={`w-3 h-3 rounded-full bg-white transition-transform ${settings.theme === 'light' ? 'translate-x-0' : 'translate-x-4'}`} />
          </div>
        </button>

        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black truncate">Time Lens 用户</p>
            <p className="text-[10px] text-gray-400 font-bold">Standard Edition</p>
          </div>
        </div>
      </div>
    </div>
  );
}
