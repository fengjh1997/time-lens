"use client";

import { useState, useRef } from "react";
import { useTimeStore, DEFAULT_TAGS } from "@/store/timeStore";
import { Download, Upload, Trash2, Plus, X, Palette, Clock, Eye, Database, Info, Check } from "lucide-react";

export default function SettingsPage() {
  const { tags, settings, updateSettings, addTag, removeTag, exportData, importData, clearAllData } = useTimeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("📌");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [showAddTag, setShowAddTag] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-lens-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("✅ 数据已导出");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const ok = importData(json);
      showToast(ok ? "✅ 数据导入成功！" : "❌ 导入失败，文件格式不正确");
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    addTag({
      id: `custom-${Date.now()}`,
      name: newTagName.trim(),
      emoji: newTagEmoji,
      color: newTagColor,
    });
    setNewTagName("");
    setNewTagEmoji("📌");
    setShowAddTag(false);
    showToast("✅ 标签已添加");
  };

  const handleClear = () => {
    clearAllData();
    setConfirmClear(false);
    showToast("🗑️ 所有数据已清空");
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto pb-28 sm:pb-8">
      <header className="px-6 sm:px-8 py-5 border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <h1 className="text-[22px] font-bold tracking-tight">应用设置</h1>
        <p className="text-[13px] text-gray-400 mt-1 font-medium">自定义你的 Time Lens 体验</p>
      </header>

      <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-6">

        {/* --- Section: Tags --- */}
        <SettingsSection icon={<Palette size={18} />} title="标签管理" desc="自定义你的活动分类标签">
          <div className="space-y-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl">
                <span className="text-xl w-8 text-center">{tag.emoji}</span>
                <span className="flex-1 text-[14px] font-bold">{tag.name}</span>
                <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: tag.color }} />
                {!DEFAULT_TAGS.find(dt => dt.id === tag.id) && (
                  <button onClick={() => removeTag(tag.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {showAddTag ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl">
              <input value={newTagEmoji} onChange={e => setNewTagEmoji(e.target.value)} className="w-12 text-center text-xl bg-transparent border-none focus:outline-none" maxLength={2} />
              <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="标签名称" className="flex-1 px-3 py-2 bg-black/[0.03] dark:bg-white/[0.03] rounded-xl text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50" />
              <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border-none" />
              <div className="flex gap-2">
                <button onClick={handleAddTag} className="px-3 py-2 bg-amber-500 text-white rounded-full text-[13px] font-bold hover:bg-amber-600 transition-colors">
                  <Check size={15} />
                </button>
                <button onClick={() => setShowAddTag(false)} className="px-3 py-2 text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddTag(true)} className="flex items-center gap-2 mt-3 px-4 py-2.5 text-[13px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-full transition-colors">
              <Plus size={15} />
              <span>添加自定义标签</span>
            </button>
          )}
        </SettingsSection>

        {/* --- Section: Time --- */}
        <SettingsSection icon={<Clock size={18} />} title="时间粒度" desc="每个时间块的长度">
          <div className="grid grid-cols-3 gap-2">
            {[60, 30, 25].map(min => (
              <button
                key={min}
                onClick={() => updateSettings({ timeGranularity: min as 60 | 30 | 25 })}
                className={`py-3 rounded-2xl text-[14px] font-bold transition-all duration-300
                  ${settings.timeGranularity === min 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'bg-black/[0.03] dark:bg-white/[0.03] text-gray-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.06]'
                  }
                `}
              >
                {min === 25 ? '25 分钟 🍅' : `${min} 分钟`}
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* --- Section: Display --- */}
        <SettingsSection icon={<Eye size={18} />} title="显示偏好" desc="能量值的展示精度">
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map(d => (
              <button
                key={d}
                onClick={() => updateSettings({ decimalPlaces: d as 0 | 1 })}
                className={`py-3 rounded-2xl text-[14px] font-bold transition-all duration-300
                  ${settings.decimalPlaces === d
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'bg-black/[0.03] dark:bg-white/[0.03] text-gray-500 hover:bg-black/[0.06] dark:hover:bg-white/[0.06]'
                  }
                `}
              >
                {d === 0 ? '整数 (如 8)' : '一位小数 (如 7.5)'}
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* --- Section: Data --- */}
        <SettingsSection icon={<Database size={18} />} title="数据管理" desc="备份、恢复、或清空你的数据">
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-2xl text-[14px] font-bold hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors border border-green-200/40 dark:border-green-800/30">
              <Download size={16} />
              导出 JSON
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl text-[14px] font-bold hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors border border-blue-200/40 dark:border-blue-800/30">
              <Upload size={16} />
              导入 JSON
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          
          {confirmClear ? (
            <div className="flex items-center gap-3 mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200/40 dark:border-red-800/30">
              <span className="text-[13px] font-bold text-red-600 dark:text-red-400 flex-1">确定要清空所有数据吗？此操作不可撤销！</span>
              <button onClick={handleClear} className="px-4 py-2 bg-red-500 text-white rounded-full text-[13px] font-bold">确定</button>
              <button onClick={() => setConfirmClear(false)} className="px-4 py-2 text-gray-500 rounded-full text-[13px] font-bold">取消</button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="flex items-center justify-center gap-2 mt-3 w-full py-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl text-[14px] font-bold transition-colors border border-red-200/20 dark:border-red-800/20">
              <Trash2 size={16} />
              清空所有数据
            </button>
          )}
        </SettingsSection>

        {/* --- Section: About --- */}
        <SettingsSection icon={<Info size={18} />} title="关于" desc="">
          <div className="space-y-2 text-[13px] text-gray-500">
            <p><span className="font-bold text-[var(--foreground)]">Time Lens</span> v4.0</p>
            <p>技术栈：Next.js · React · Zustand · Tailwind CSS</p>
            <p>数据存储：浏览器 localStorage（刷新/重启不丢失）</p>
            <p className="text-[11px] text-gray-400">© 2026 Time Lens. 星辰能量驱动的时间管理工具。</p>
          </div>
        </SettingsSection>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] px-5 py-3 rounded-full text-[14px] font-bold shadow-lg z-[100] animate-spring">
          {toast}
        </div>
      )}
    </div>
  );
}

function SettingsSection({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-black/[0.01] dark:bg-white/[0.01] rounded-[20px] p-5 sm:p-6 border border-white/30 dark:border-white/5">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="text-gray-400">{icon}</span>
        <h2 className="text-[16px] font-bold tracking-tight">{title}</h2>
      </div>
      {desc && <p className="text-[12px] text-gray-400 font-medium mb-4">{desc}</p>}
      {!desc && <div className="mb-3" />}
      {children}
    </div>
  );
}
