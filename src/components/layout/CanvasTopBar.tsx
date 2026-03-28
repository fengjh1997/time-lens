"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import AppLogoMark from "@/components/layout/AppLogoMark";
import FocusScopeSwitcher from "@/components/layout/FocusScopeSwitcher";
import CanvasUtilityPanels from "@/components/layout/CanvasUtilityPanels";

interface CanvasTopBarProps {
  subtitle: string;
  statusLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

export default function CanvasTopBar({
  subtitle,
  statusLabel,
  onPrev,
  onNext,
  onReset,
}: CanvasTopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
      <div className="glass-panel rounded-[30px] px-3 py-3 sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AppLogoMark compact />
            <div className="min-w-0">
              <div className="truncate text-xl font-black tracking-[-0.04em] text-[var(--foreground)] sm:text-[1.6rem]">
                TimeFlow
              </div>
              <div className="truncate text-[11px] font-semibold text-faint sm:text-xs">{subtitle}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-full bg-[rgba(var(--primary-rgb),0.1)] px-3 py-2 text-[12px] font-black text-[var(--primary-color)] sm:inline-flex sm:items-center sm:gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--primary-color)]" />
              <span>{statusLabel}</span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="glass-card inline-flex h-10 w-10 items-center justify-center rounded-full text-subtle"
              aria-label="打开更多"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <FocusScopeSwitcher />

          <div className="flex items-center gap-2">
            <CanvasUtilityPanels />
            <div className="glass-card flex items-center gap-1 rounded-full p-1">
              <button
                type="button"
                onClick={onPrev}
                className="rounded-full p-2 text-subtle transition hover:bg-white/45 dark:hover:bg-white/[0.06]"
                aria-label="上一段"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={onReset}
                className="rounded-full p-2 text-subtle transition hover:bg-white/45 dark:hover:bg-white/[0.06]"
                aria-label="回到当前"
              >
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--primary-color)]" />
              </button>
              <button
                type="button"
                onClick={onNext}
                className="rounded-full p-2 text-subtle transition hover:bg-white/45 dark:hover:bg-white/[0.06]"
                aria-label="下一段"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
