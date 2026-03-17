"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Cloud, Download, Palette, RefreshCw, Settings2, Tag as TagIcon, Trash2, Upload } from "lucide-react";
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
  const {
    tags,
    addTag,
    removeTag,
    updateTag,
    settings,
    updateSettings,
    exportData,
    importData,
    clearAllData,
    isSyncing,
    lastSyncedAt,
  } = useTimeStore();
  const { user } = useAuthStore();
  const { manualSync, pushSettings } = useSync();

  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("✨");
  const [newTagColor, setNewTagColor] = useState("#10b981");

  const syncSettings = (partial: Parameters<typeof updateSettings>[0]) => {
    updateSettings(partial);
    window.setTimeout(() => pushSettings(), 50);
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    addTag({
      id: `${Date.now()}`,
      name: newTagName.trim(),
      emoji: newTagEmoji || "✨",
      color: newTagColor,
      updatedAt: new Date().toISOString(),
    });
    setNewTagName("");
    setNewTagEmoji("✨");
    setNewTagColor("#10b981");
    window.setTimeout(() => pushSettings(), 50);
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `time-lens-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--background)] pb-32 sm:pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
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
                label="周视图说明"
                description="块内短文"
                enabled={settings.showDetailsInWeekView}
                onChange={() => syncSettings({ showDetailsInWeekView: !settings.showDetailsInWeekView })}
              />
              <ToggleRow
                label="周视图标签"
                description="块内标签"
                enabled={settings.showTagNamesInWeekView}
                onChange={() => syncSettings({ showTagNamesInWeekView: !settings.showTagNamesInWeekView })}
              />
            </div>
          </section>

          <section className="glass-card rounded-[28px] p-4">
            <SectionHeader icon={<Cloud size={17} />} title="同步" />

            <div className="mt-4 space-y-4">
              <ToggleRow
                label="云同步"
                description={user ? "自动同步" : "需先登录"}
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
                    {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "尚未同步"}
                  </p>
                </>
              ) : (
                <Link href="/auth" className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-4 py-2.5 text-[13px] font-black text-white">
                  <Cloud size={14} />
                  登录
                </Link>
              )}
            </div>
          </section>
        </div>

        <section className="glass-card rounded-[28px] p-4">
          <SectionHeader icon={<TagIcon size={17} />} title="标签" />

          <div className="mt-4 space-y-2">
            {tags.map((tag) => (
              <div key={tag.id} className="grid grid-cols-[36px_1fr_30px] items-center gap-2 rounded-[16px] border border-[var(--border-color)] px-2.5 py-2">
                <input
                  value={tag.emoji}
                  onChange={(event) => updateTag({ ...tag, emoji: event.target.value || "✨", updatedAt: new Date().toISOString() })}
                  onBlur={() => pushSettings()}
                  className="h-9 w-9 rounded-[12px] bg-white/80 text-center text-base font-black outline-none dark:bg-white/[0.08]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <input
                      value={tag.name}
                      onChange={(event) => updateTag({ ...tag, name: event.target.value, updatedAt: new Date().toISOString() })}
                      onBlur={() => pushSettings()}
                      className="min-w-0 flex-1 bg-transparent text-[13px] font-black outline-none"
                    />
                    <input
                      type="color"
                      value={tag.color}
                      onChange={(event) => updateTag({ ...tag, color: event.target.value, updatedAt: new Date().toISOString() })}
                      onBlur={() => pushSettings()}
                      className="h-6 w-8 cursor-pointer rounded-md border border-[var(--border-color)] bg-transparent"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeTag(tag.id);
                    window.setTimeout(() => pushSettings(), 50);
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/20"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-[36px_1fr_52px_auto] items-center gap-2 rounded-[16px] border border-dashed border-[var(--border-color)] px-2.5 py-2">
              <input
                value={newTagEmoji}
                onChange={(event) => setNewTagEmoji(event.target.value)}
                className="h-9 w-9 rounded-[12px] bg-white/80 text-center text-base font-black outline-none dark:bg-white/[0.08]"
              />
              <input
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                placeholder="新标签"
                className="h-9 rounded-[12px] border border-[var(--border-color)] bg-transparent px-3 text-[13px] font-black outline-none"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(event) => setNewTagColor(event.target.value)}
                className="h-9 w-full cursor-pointer rounded-[12px] border border-[var(--border-color)] bg-transparent"
              />
              <button type="button" onClick={handleAddTag} className="rounded-[12px] bg-[var(--primary-color)] px-3 py-2 text-[12px] font-black text-white">
                添加
              </button>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[28px] p-4">
          <SectionHeader icon={<Settings2 size={17} />} title="数据" />

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
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const success = importData(String(reader.result || ""));
                    if (!success) window.alert("导入失败");
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
        </section>
      </div>
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
