"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumnBig, Clock3, Compass, Ellipsis } from "lucide-react";

const navItems = [
  { href: "/now", label: "此刻", icon: Clock3, matches: ["/now"] },
  { href: "/", label: "视图", icon: Compass, matches: ["/", "/day", "/month"] },
  { href: "/dashboard", label: "趋势", icon: ChartColumnBig, matches: ["/dashboard"] },
  { href: "/settings", label: "更多", icon: Ellipsis, matches: ["/settings", "/auth", "/tags"] },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <div className="glass-panel mx-3 mb-3 flex items-center justify-around rounded-[24px] px-2 py-2 safe-bottom">
        {navItems.map((item) => {
          const active = item.matches.some((match) => (match === "/" ? false : pathname.startsWith(match))) ||
            (item.href === "/" && (pathname === "/" || pathname === "/day" || pathname === "/month"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-[18px] px-2 py-2 text-[10px] font-black transition-all ${
                active ? "bg-[var(--primary-light)] text-[var(--primary-color)]" : "text-faint"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
