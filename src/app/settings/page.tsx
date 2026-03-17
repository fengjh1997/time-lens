"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Cloud,
  Download,
  Palette,
  RefreshCw,
  Settings2,
  Tag as TagIcon,
  Trash2,
  Upload,
} from "lucide-react";
import type { PrimaryColor } from "@/types";
import { useTimeStore } from "@/store/timeStore";
import { useAuthStore } from "@/store/authStore";
import { useSync } from "@/hooks/useSync";

const PRIMARY_COLORS: Array<{ id: PrimaryColor; color: string; name: string }> = [
  { id: "emerald", color: "#10b981", name: "翡翠绿" },
  { id: "amber", color: "#f59e0b", name: "暖金" },
  { id: "blue", color: "#3b82f6", name: "深海蓝" },
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
    window.setTimeout(() => {
      pushSettings();
    }, 50);
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
    window.setTimeout(() => {
      pushSettings();
    }, 50);
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
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6">
        <section className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--primary-color)] font-black">Settings</p>
          <h1 className="mt-2 text-3xl font-black">统一配置与同步</h1>
          <p className="mt-2 text-sm text-gray-500">
            主题色、标签颜色和展示策略都在这里集中管理，减少跨页面状态打架。
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="rounded-[18px] bg-[var(--primary-light)] p-3 text-[var(--primary-color)]">
                <Palette size={18} />
              </div>
              <div>
                <h2 className="text-lg font-black">外观</h2>
                <p className="text-[12px] font-medium text-gray-400">颜色一改就同步，避免切页回弹。</p>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm font-black">主题模式</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => syncSettings({ theme: "light" })}
                    className={`rounded-[18px] px-4 py-3 text-sm font-black ${
                      settings.theme === "light"
                        ? "bg-[var(--primary-color)] text-white"
                        : "bg-black/[0.03] text-gray-500 dark:bg-white/[0.05]"
                    }`}
                  >
                    浅色
                  </button>
                  <button
                    type="button"
                    onClick={() => syncSettings({ theme: "dark" })}
                    className={`rounded-[18px] px-4 py-3 text-sm font-black ${
                      settings.theme === "dark"
                        ? "bg-[var(--primary-color)] text-white"
                        : "bg-black/[0.03] text-gray-500 dark:bg-white/[0.05]"
                    }`}
                  >
                    深色
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-black">主题色</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {PRIMARY_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => syncSettings({ primaryColor: color.id })}
                      className={`flex items-center justify-between rounded-[20px] border px-4 py-3 text-sm font-black transition-all ${
                        settings.primaryColor === color.id
                          ? "border-[var(--primary-color)] bg-[var(--primary-light)]"
                          : "border-[var(--border-color)]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color.color }} />
                        {color.name}
                      </span>
                      {settings.primaryColor === color.id && <Check size={16} className="text-[var(--primary-color)]" />}
                    </button>
                  ))}
                </div>
              </div>

              <ToggleRow
                label="隐藏睡眠时段"
                description="折叠 23:00 - 09:00，日视图和周视图统一生效。"
                enabled={settings.hideSleepTime}
                onChange={() => syncSettings({ hideSleepTime: !settings.hideSleepTime })}
              />

              <ToggleRow
                label="周视图显示内容"
                description="直接在周视图显示标签与简短说明。"
                enabled={settings.showDetailsInWeekView}
                onChange={() => syncSettings({ showDetailsInWeekView: !settings.showDetailsInWeekView })}
              />
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="rounded-[18px] bg-[var(--primary-light)] p-3 text-[var(--primary-color)]">
                <Cloud size={18} />
              </div>
              <div>
                <h2 className="text-lg font-black">云同步</h2>
                <p className="text-[12px] font-medium text-gray-400">登录后按更新时间合并，减少覆盖冲突。</p>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <ToggleRow
                label="启用云同步"
                description={user ? "设置、标签和时间块会自动尝试同步到云端。" : "先登录，再打开。"}
                enabled={!!settings.cloudSyncEnabled}
                onChange={() => syncSettings({ cloudSyncEnabled: !settings.cloudSyncEnabled })}
              />

              {user ? (
                <>
                  <button
                    type="button"
                    onClick={manualSync}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-5 py-3 text-sm font-black text-white"
                  >
                    <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} />
                    立即同步
                  </button>
                  <p className="text-[12px] font-medium text-gray-400">
                    上次同步：{lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "尚未同步"}
                  </p>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-5 py-3 text-sm font-black text-white"
                >
                  <Cloud size={15} />
                  登录开启同步
                </Link>
              )}

              <div className="rounded-[24px] bg-black/[0.03] p-4 text-[12px] font-medium text-gray-500 dark:bg-white/[0.04]">
                标签颜色同步依赖云端 `settings.tags_json` 扩展字段。代码已经兼容旧表结构，但为了完整同步，仍建议把最新 schema 一并迁上去。
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="rounded-[18px] bg-[var(--primary-light)] p-3 text-[var(--primary-color)]">
              <TagIcon size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black">标签</h2>
              <p className="text-[12px] font-medium text-gray-400">标签颜色与 emoji 同步管理。</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="rounded-[24px] border border-[var(--border-color)] bg-black/[0.02] p-4 dark:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between">
                  <input
                    value={tag.emoji}
                    onChange={(event) =>
                      updateTag({ ...tag, emoji: event.target.value || "✨", updatedAt: new Date().toISOString() })
                    }
                    onBlur={() => pushSettings()}
                    className="w-12 rounded-xl bg-white px-2 py-2 text-center text-lg font-black outline-none dark:bg-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      removeTag(tag.id);
                      window.setTimeout(() => {
                        pushSettings();
                      }, 50);
                    }}
                    className="rounded-full bg-red-50 p-2 text-red-500 dark:bg-red-950/20"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <input
                  value={tag.name}
                  onChange={(event) =>
                    updateTag({ ...tag, name: event.target.value, updatedAt: new Date().toISOString() })
                  }
                  onBlur={() => pushSettings()}
                  className="mt-3 w-full rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm font-black outline-none"
                />

                <input
                  type="color"
                  value={tag.color}
                  onChange={(event) =>
                    updateTag({ ...tag, color: event.target.value, updatedAt: new Date().toISOString() })
                  }
                  onBlur={() => pushSettings()}
                  className="mt-3 h-10 w-full cursor-pointer rounded-xl border border-[var(--border-color)] bg-transparent"
                />
              </div>
            ))}

            <div className="rounded-[24px] border border-dashed border-[var(--border-color)] p-4">
              <input
                value={newTagEmoji}
                onChange={(event) => setNewTagEmoji(event.target.value)}
                className="w-12 rounded-xl bg-white px-2 py-2 text-center text-lg font-black outline-none dark:bg-white/10"
              />
              <input
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                placeholder="新标签名"
                className="mt-3 w-full rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm font-black outline-none"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(event) => setNewTagColor(event.target.value)}
                className="mt-3 h-10 w-full cursor-pointer rounded-xl border border-[var(--border-color)] bg-transparent"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="mt-3 w-full rounded-xl bg-[var(--primary-color)] px-4 py-3 text-sm font-black text-white"
              >
                添加标签
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--border-color)] bg-white/75 p-5 shadow-[var(--shadow-sm)] dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="rounded-[18px] bg-[var(--primary-light)] p-3 text-[var(--primary-color)]">
              <Settings2 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black">数据管理</h2>
              <p className="text-[12px] font-medium text-gray-400">导入导出和重置。</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-[var(--border-color)] px-4 py-3 text-sm font-black"
            >
              <Download size={15} />
              导出
            </button>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[20px] border border-[var(--border-color)] px-4 py-3 text-sm font-black">
              <Upload size={15} />
              导入
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (loadEvent) => {
                    importData(String(loadEvent.target?.result || ""));
                  };
                  reader.readAsText(file);
                }}
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (confirm("确认清空本地数据吗？")) clearAllData();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-red-50 px-4 py-3 text-sm font-black text-red-500 dark:bg-red-950/20"
            >
              <Trash2 size={15} />
              重置
            </button>
          </div>
        </section>
      </div>
    </div>
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
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-black">{label}</p>
        <p className="mt-1 text-[12px] font-medium text-gray-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-14 rounded-full transition-all ${enabled ? "bg-[var(--primary-color)]" : "bg-gray-300 dark:bg-gray-700"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${enabled ? "left-8" : "left-1"}`}
        />
      </button>
    </div>
  );
}
