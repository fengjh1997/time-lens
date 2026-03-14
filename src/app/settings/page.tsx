"use client";

import { useState } from "react";
import { useTimeStore } from "@/store/timeStore";
import { type PrimaryColor } from "@/types";
import { 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  Clock, 
  Tag as TagIcon,
  Sun,
  Moon,
  Github,
  Globe,
  Star as StarIcon,
  Palette,
  Cloud,
  Check
} from "lucide-react";

const PRIMARY_COLORS: { id: PrimaryColor, color: string, name: string }[] = [
  { id: 'amber', color: '#f59e0b', name: '琥珀金' },
  { id: 'emerald', color: '#10b981', name: '翡翠绿' },
  { id: 'violet', color: '#8b5cf6', name: '紫罗兰' },
  { id: 'blue', color: '#3b82f6', name: '深邃蓝' },
];

export default function SettingsPage() {
  const { tags, addTag, removeTag, updateTag, settings, updateSettings, toggleTheme, exportData, importData, clearAllData } = useTimeStore();
  
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("✨");
  const [newTagColor, setNewTagColor] = useState("#f59e0b");

  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const id = Date.now().toString();
    addTag({ id, name: newTagName, emoji: newTagEmoji, color: newTagColor });
    setNewTagName("");
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-lens-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      importData(json);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto pb-32 sm:pb-12">
      <header className="px-4 sm:px-6 py-6 border-b border-[var(--border-color)] sticky top-0 bg-[var(--background)]/80 backdrop-blur-md z-20">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">应用设置</h1>
        <p className="text-[12px] sm:text-[13px] text-gray-400 font-bold mt-1 tracking-widest uppercase">偏好与资产管理</p>
      </header>

      <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-8 sm:space-y-12">
        
        {/* Appearance Section */}
        <section className="space-y-4">
          <SectionHeader icon={<Palette size={18} />} title="感官与视觉" />
          <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 border border-[var(--border-color)] space-y-8">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-black">界面主题</p>
                <p className="text-[12px] text-gray-400 font-bold">目前处于 {settings.theme === 'light' ? '明亮' : '深色'} 模式</p>
              </div>
              <div className="flex bg-black/[0.05] dark:bg-white/10 p-1 rounded-full">
                <button 
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-black transition-all ${settings.theme === 'light' ? 'bg-white dark:bg-white/10 shadow-sm text-[var(--primary-color)]' : 'text-gray-400'}`}
                >
                  <Sun size={14} /> 明亮
                </button>
                <button 
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-black transition-all ${settings.theme === 'dark' ? 'bg-white dark:bg-white/10 shadow-sm text-[var(--primary-color)]' : 'text-gray-400'}`}
                >
                  <Moon size={14} /> 深色
                </button>
              </div>
            </div>

            {/* Primary Color Picker */}
            <div className="space-y-3 pt-6 border-t border-[var(--border-color)]">
              <p className="text-[15px] font-black">主题色自定义</p>
              <div className="flex flex-wrap gap-3">
                {PRIMARY_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => updateSettings({ primaryColor: color.id })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all hover:scale-[1.05] active:scale-95
                      ${settings.primaryColor === color.id 
                        ? 'border-[var(--primary-color)] bg-[var(--primary-light)]' 
                        : 'border-transparent bg-black/[0.03] dark:bg-white/[0.03]'
                      }
                    `}
                  >
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: color.color }} />
                    <span className={`text-[13px] font-black ${settings.primaryColor === color.id ? 'text-[var(--primary-color)]' : 'text-gray-400'}`}>
                      {color.name}
                    </span>
                    {settings.primaryColor === color.id && <Check size={14} className="text-[var(--primary-color)]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cloud Sync Placeholder */}
        <section className="space-y-4">
          <SectionHeader icon={<Cloud size={18} />} title="多端同步 (敬请期待)" />
          <div className="bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]/70 rounded-[32px] p-6 text-white shadow-xl shadow-[var(--primary-glow)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <Cloud size={120} />
             </div>
             <p className="text-[11px] font-black opacity-80 uppercase tracking-widest">Cloud Sync</p>
             <h3 className="text-xl font-black mt-1">跨端同步架构即将开启</h3>
             <p className="text-[12px] font-bold mt-2 opacity-90 max-w-[280px]">使用 Supabase 强力驱动，支持多电脑与手机实时同步，让你的心流数据永不丢失。</p>
             <button className="mt-6 px-6 py-2.5 bg-white text-[var(--primary-color)] rounded-full text-[13px] font-black hover:scale-105 active:scale-95 transition-all opacity-50 cursor-not-allowed">
               即将上线...
             </button>
          </div>
        </section>

        {/* Tag Management */}
        <section className="space-y-4">
          <SectionHeader icon={<TagIcon size={18} />} title="智能标签库" />
          <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 border border-[var(--border-color)] space-y-6">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
              {tags.map(tag => (
                <div 
                  key={tag.id}
                  className="group relative flex flex-col items-center gap-2 p-4 rounded-[22px] bg-white dark:bg-white/5 border border-[var(--border-color)] hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  {editingTagId === tag.id ? (
                    <input 
                      type="text" 
                      defaultValue={tag.emoji} 
                      onBlur={(e) => {
                        updateTag({ ...tag, emoji: e.target.value });
                        setEditingTagId(null);
                      }}
                      className="text-2xl w-10 h-10 bg-black/5 rounded-xl text-center focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="text-2xl cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => setEditingTagId(tag.id)}
                      title="点击修改 Emoji"
                    >
                      {tag.emoji}
                    </span>
                  )}
                  <span className="text-[12px] font-bold truncate max-w-full px-2" style={{ color: tag.color }}>
                    {tag.name}
                  </span>
                  <button 
                    onClick={() => removeTag(tag.id)}
                    className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              
              <div className="flex flex-col items-center justify-center p-4 rounded-[22px] bg-black/[0.03] dark:bg-white/[0.03] border border-dashed border-gray-300 dark:border-gray-700 space-y-2 group hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all">
                <div className="flex gap-1.5">
                   <input type="text" value={newTagEmoji} onChange={e => setNewTagEmoji(e.target.value)} className="w-8 h-8 text-center bg-white dark:bg-white/10 rounded-lg text-lg focus:outline-none" />
                   <input type="text" value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="名称" className="flex-1 min-w-0 px-2 h-8 text-[11px] font-black bg-white dark:bg-white/10 rounded-lg focus:outline-none" />
                </div>
                <button onClick={handleAddTag} className="w-full py-2 bg-[var(--primary-color)] text-white rounded-lg text-[11px] font-black">
                  添加标签
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Time Settings */}
        <section className="space-y-4">
          <SectionHeader icon={<Clock size={18} />} title="时间与折叠" />
          <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 border border-[var(--border-color)] space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-[15px] font-black">全站隐藏睡眠时段</p>
                   <p className="text-[12px] text-gray-400 font-bold">隐藏 23:00 - 09:00 (仅设置页可开启)</p>
                </div>
                <button 
                  onClick={() => updateSettings({ hideSleepTime: !settings.hideSleepTime })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${settings.hideSleepTime ? 'bg-[var(--primary-color)]' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.hideSleepTime ? 'left-7' : 'left-1'}`} />
                </button>
             </div>

             <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
              <div>
                <p className="text-[15px] font-black">数值精度</p>
                <p className="text-[12px] text-gray-400 font-bold">是否在看板显示 0.1 级能效</p>
              </div>
              <button 
                onClick={() => updateSettings({ decimalPlaces: settings.decimalPlaces === 0 ? 1 : 0 })}
                className="px-5 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/10 text-[12px] font-black text-gray-500"
              >
                {settings.decimalPlaces === 0 ? '整数' : '0.1 精度'}
              </button>
             </div>
          </div>
        </section>

        {/* Reset & Export */}
        <section className="space-y-4">
          <SectionHeader icon={<RotateCcw size={18} />} title="数据管护" />
          <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[32px] p-6 border border-[var(--border-color)] space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleExport} className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-white dark:bg-white/5 border border-[var(--border-color)] hover:shadow-lg transition-all">
                <Download size={16} className="text-[var(--primary-color)]" />
                <span className="text-[13px] font-black">导出备份</span>
              </button>
              <label className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-white dark:bg-white/5 border border-[var(--border-color)] hover:shadow-lg transition-all cursor-pointer">
                <Upload size={16} className="text-[var(--primary-color)]" />
                <span className="text-[13px] font-black">导入备份</span>
                <input type="file" className="hidden" accept=".json" onChange={handleImport} />
              </label>
            </div>
            <button 
              onClick={() => confirm('确定清除所有数据吗？') && clearAllData()}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-[13px]"
            >
              <RotateCcw size={16} /> 重置应用
            </button>
          </div>
        </section>

        {/* Version Info */}
        <div className="text-center pb-20 opacity-30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <StarIcon size={14} fill="currentColor" />
            <span className="text-[11px] font-black tracking-widest uppercase">Time Lens v6.0.0 Alpha</span>
          </div>
          <p className="text-[10px] font-bold">Developed with ❤️ by Antigravity</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-3 px-4">
      <div className="p-2.5 rounded-2xl bg-[var(--primary-light)] text-[var(--primary-color)] shadow-sm">
        {icon}
      </div>
      <h2 className="text-[17px] font-black tracking-tight">{title}</h2>
    </div>
  );
}
