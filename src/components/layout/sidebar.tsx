"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  LayoutDashboard, 
  Compass, 
  Sun, 
  Settings, 
  Star,
  Sparkles,
  User,
  LogOut,
  ChevronUp,
  ArrowRight
} from "lucide-react";
import { useTimeStore } from "@/store/timeStore";
import { useAuthStore } from "@/store/authStore";
import { EnergyDisplay } from "@/components/ui/StarRating";
import { useState } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { icon: Compass, label: "一周规划", href: "/" },
  { icon: Sun, label: "今日焦点", href: "/day" },
  { icon: Calendar, label: "全景视野", href: "/month" },
  { icon: LayoutDashboard, label: "数据洞察", href: "/dashboard" },
  { icon: Settings, label: "应用设置", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalEnergy } = useTimeStore();
  const { user, profile, signOut } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    router.push("/auth");
  };

  return (
    <div className="w-[260px] h-full bg-[var(--background)] border-r border-[var(--border-color)] hidden sm:flex flex-col p-6 transition-colors duration-300">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-[14px] bg-[var(--primary-color)] flex items-center justify-center shadow-lg shadow-[var(--primary-glow)]">
          <Star size={22} color="white" fill="white" />
        </div>
        <div>
          <h1 className="font-black text-xl tracking-tight leading-none italic">Time Lens</h1>
          <span className="text-[10px] font-black tracking-widest text-[var(--primary-color)] uppercase">Star Energy</span>
        </div>
      </div>

      {/* Energy Card */}
      <div className="bg-[var(--primary-color)] rounded-[28px] p-5 text-white mb-8 shadow-xl shadow-[var(--primary-glow)] group relative overflow-hidden transition-transform hover:scale-[1.02]">
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
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                ${isActive 
                  ? "bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-glow)]" 
                  : "text-gray-400 font-bold hover:bg-[var(--hover-bg)] hover:text-[var(--foreground)]"
                }
              `}
            >
              <item.icon size={20} className={isActive ? "text-white" : "group-hover:scale-110 transition-transform"} />
              <span className="text-[14px] font-black">{item.label}</span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="pt-6 border-t border-[var(--border-color)] relative">
        {user ? (
          <>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--hover-bg)] transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary-color)]/20 to-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)] overflow-hidden">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-black truncate text-[var(--foreground)]">{profile?.full_name || user.email?.split('@')[0] || "已登录用户"}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cloud Sync Active</p>
              </div>
              <ChevronUp size={16} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Popover User Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full mb-3 p-2 bg-[var(--modal-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-[24px] shadow-2xl animate-spring z-50">
                <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 border-b border-[var(--border-color)] pb-2 mx-1">账户管理</p>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--hover-bg)] transition-all text-[13px] font-black text-gray-600 dark:text-gray-300">
                  <User size={16} /> 个人中心 (待开放)
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-all text-[13px] font-black"
                >
                  <LogOut size={16} /> 登出账号
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            href="/auth"
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[var(--primary-light)] text-[var(--primary-color)] hover:brightness-105 transition-all group border border-[var(--primary-color)]/10"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-black">访客模式</p>
              <p className="text-[10px] font-bold opacity-70">点击登录同步云端</p>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
