"use client";

import { type ComponentType, useMemo } from "react";
import { AppWindowMac, CalendarDays, CircleDashed, Clock3, SunMedium } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Scope = "now" | "day" | "week" | "month" | "year";

const options: Array<{ id: Scope; label: string; icon: ComponentType<{ size?: number }>; route: string }> = [
  { id: "now", label: "此刻", icon: Clock3, route: "/now" },
  { id: "day", label: "日", icon: SunMedium, route: "/?view=day&offset=0" },
  { id: "week", label: "周", icon: AppWindowMac, route: "/?view=week&offset=0" },
  { id: "month", label: "月", icon: CalendarDays, route: "/month?scope=month" },
  { id: "year", label: "年", icon: CircleDashed, route: "/month?scope=year" },
];

export default function FocusScopeSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentScope: Scope = useMemo(() => {
    if (pathname === "/now") return "now";
    if (pathname === "/month") return searchParams.get("scope") === "year" ? "year" : "month";
    if (pathname === "/day" || searchParams.get("view") === "day") return "day";
    return "week";
  }, [pathname, searchParams]);

  return (
    <div className="glass-card inline-flex items-center rounded-full p-1 no-select">
      {options.map((option) => {
        const Icon = option.icon;
        const active = option.id === currentScope;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => router.replace(option.route)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-black transition-all sm:px-4 ${
              active
                ? "bg-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-glow)]"
                : "text-faint hover:bg-white/45 hover:text-[var(--foreground)] dark:hover:bg-white/[0.06]"
            }`}
            aria-label={`${option.label}视图`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
