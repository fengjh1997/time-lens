"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Cloud,
  Download,
  FolderKanban,
  Palette,
  RefreshCw,
  Settings2,
  Sparkles,
  Tags,
  Trash2,
  Upload,
} from "lucide-react";
import AppLogoMark from "@/components/layout/AppLogoMark";
import type { PrimaryColor } from "@/types";
import { useTimeStore } from "@/store/timeStore";
import { useAuthStore } from "@/store/authStore";
import { useSync } from "@/hooks/useSync";

const PRIMARY_COLORS: Array<{ id: PrimaryColor; color: string; name: string }> = [
  { id: "emerald", color: "#10b981", name: "翡翠" },
  { id: "amber", color: "#f59e0b", name: "暖金" },
  { id: "blue", color: "#3b82f6", name: "深蓝" },
  { id: "violet", color: "#8b5cf6", name: "暮紫" },
];

export default function SettingsPage() {
  const { settings, updateSettings, exportData, importData, clearAllData, isSyncing, lastSyncedAt } = useTimeStore();
  const { user } = useAuthStore();
  const { manualSync, pushSettings } = useSync();
  const [importError, setImportError] = useState<string | null>(null);

  const syncSettings = (partial: Parameters<typeof updateSettings>[0]) => {
    updateSettings(partial);
    window.setTimeout(() => pushSettings(), 50);
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `timeflow-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <section className="glass-card-strong rounded-[34px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <AppLogoMark />
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[var(--primary-color)]">More</p>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.06em]">更多</h1>
                <p className="mt-2 text-sm font-medium text-faint">系统设置、同步、数据备份和扩展入口都放在这里，标签与趋势已经拆成独立系统。</p>
              </div>
            </div>

            <div className="rounded-full bg-[rgba(var(--primary-rgb),0.1)] px-4 py-2 text-[12px] font-black text-[var(--primary-color)]">
              TimeFlow
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <QuickLinkCard href="/tags" icon={<Tags size={16} />} title="标签管理" description="编辑标签并查看使用趋势" />
          <QuickLinkCard href="/dashboard?tab=goals" icon={<FolderKanban size={16} />} title="目标追踪" description="设置结构目标和缺口提醒" />
          <QuickLinkCard href="/auth" icon={<Cloud size={16} />} title={user ? "账户与同步" : "登录云同步"} description={user ? "管理当前账号和同步状态" : "登录后可启用云同步"} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="glass-card rounded-[28px] p-4">
            <SectionHeader icon={<Palette size={17} />} title="外观" />

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <ChoiceButton active={settings.theme === "light"} onClick={() => syncSettings({ theme: "light" })} label="浅色" />
                <ChoiceButton active={settings.theme === "dark"} onClick={() => syncSettings({ theme: "dark" })} label="暗色" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PRIMARY_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => syncSettings({ primaryColor: color.id })}
                    className={`flex items-center justify-between rounded-[16px] border px-3 py-2.5 text-[13px] font-black ${
                      settings.primaryColor === color.id
                        ? "border-[var(--primary-color)] bg-[var(--primary-light)]"
                        : "border-[var(--border-color)]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color.color }} />
                      {color.name}
                    </span>
                    {settings.primaryColor === color.id && <Check size={13} className="text-[var(--primary-color)]" />}
                  </button>
                ))}
              </div>

              <ToggleRow
                label="隐藏睡眠时段"
                description="23:00 - 09:00"
                enabled={settings.hideSleepTime}
                onChange={() => syncSettings({ hideSleepTime: !settings.hideSleepTime })}
              />
              <ToggleRow
                label="周视图显示感悟"
                description="在时间块里保留短感悟"
                enabled={settings.showDetailsInWeekView}
                onChange={() => syncSettings({ showDetailsInWeekView: !settings.showDetailsInWeekView })}
              />
              <ToggleRow
                label="周视图显示标签名"
                description="默认以 emoji 为主，必要时显示名称"
                enabled={settings.showTagNamesInWeekView}
                onChange={() => syncSettings({ showTagNamesInWeekView: !settings.showTagNamesInWeekView })}
              />
            </div>
          </section>

          <section className="glass-card rounded-[28px] p-4">
            <SectionHeader icon={<Cloud size={17} />} title="同步" />

            <div className="mt-4 space-y-4">
              <ToggleRow
                label="云端同步"
                description={user ? "登录后自动同步标签、设置和时间块" : "需要先登录后启用"}
                enabled={!!settings.cloudSyncEnabled}
                onChange={() => syncSettings({ cloudSyncEnabled: !settings.cloudSyncEnabled })}
              />

              {user ? (
                <>
                  <button
                    type="button"
                    onClick={manualSync}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-4 py-2.5 text-[13px] font-black text-white"
                  >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                    立即同步
                  </button>
                  <p className="text-[12px] font-medium text-faint">
                    {lastSyncedAt ? `最近同步：${new Date(lastSyncedAt).toLocaleString()}` : "尚未同步"}
                  </p>
                </>
              ) : (
                <Link href="/auth" className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-4 py-2.5 text-[13px] font-black text-white">
                  <Cloud size={14} />
                  登录账号
                </Link>
              )}
            </div>
          </section>
        </div>

        <section className="glass-card rounded-[28px] p-4">
          <SectionHeader icon={<Sparkles size={17} />} title="扩展入口" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ExtensionCard title="备注模板" description="下一阶段用于快速插入常用感悟或计划模板。" />
            <ExtensionCard title="父子标签" description="本阶段先保留接口，下一轮再把标签分组做成真正的层级系统。" />
          </div>
        </section>

        <section className="glass-card rounded-[28px] p-4">
          <SectionHeader icon={<Settings2 size={17} />} title="数据管理" />

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={handleExport} className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-[var(--border-color)] px-4 py-3 text-[13px] font-black">
              <Download size={14} />
              导出
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-[var(--border-color)] px-4 py-3 text-[13px] font-black">
              <Upload size={14} />
              导入
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={(event) => {
                  setImportError(null);
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const success = importData(String(reader.result || ""));
                    if (!success) setImportError("导入失败，请检查文件格式。");
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("确认清空本地数据吗？")) clearAllData();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-red-200 px-4 py-3 text-[13px] font-black text-red-500 dark:border-red-950/40"
            >
              <Trash2 size={14} />
              清空
            </button>
          </div>
          {importError ? <p className="mt-3 text-[12px] font-medium text-red-500">{importError}</p> : null}
        </section>
      </div>
    </div>
  );
}

function QuickLinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="glass-card rounded-[28px] p-4 transition hover:-translate-y-0.5">
      <div className="inline-flex rounded-[14px] bg-[var(--primary-light)] p-2 text-[var(--primary-color)]">{icon}</div>
      <p className="mt-3 text-base font-black">{title}</p>
      <p className="mt-1 text-[12px] font-medium text-faint">{description}</p>
    </Link>
  );
}

function ExtensionCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--border-color)] bg-black/[0.03] px-4 py-4 dark:bg-white/[0.04]">
      <p className="text-sm font-black">{title}</p>
      <p className="mt-2 text-[13px] font-medium text-faint">{description}</p>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-[14px] bg-[var(--primary-light)] p-2.5 text-[var(--primary-color)]">{icon}</div>
      <h2 className="text-base font-black">{title}</h2>
    </div>
  );
}

function ChoiceButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[16px] px-4 py-3 text-[13px] font-black ${
        active ? "bg-[var(--primary-color)] text-white" : "border border-[var(--border-color)]"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-[18px] border border-[var(--border-color)] px-3 py-3 text-left"
    >
      <div>
        <p className="text-[13px] font-black">{label}</p>
        <p className="mt-0.5 text-[11px] font-medium text-faint">{description}</p>
      </div>
      <div className={`flex h-6 w-11 items-center rounded-full p-1 transition-all ${enabled ? "bg-[var(--primary-color)]" : "bg-black/10 dark:bg-white/10"}`}>
        <div className={`h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : ""}`} />
      </div>
    </button>
  );
}
