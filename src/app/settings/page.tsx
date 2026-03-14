"use client";

import { Outfit } from "next/font/google";
import { useState } from "react";
import { useTimeStore } from "@/store/timeStore";
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  Info, 
  Settings2, 
  Clock, 
  Tag as TagIcon,
  Sun,
  Moon,
  Github,
  Globe,
  Star as StarIcon
} from "lucide-react";

export default function SettingsPage() {
  const { tags, addTag, removeTag, updateTag, settings, updateSettings, toggleTheme, exportData, importData, clearAllData } = useTimeStore();
  
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("✨");
  const [newTagColor, setNewTagColor] = useState("#amber-500");

  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const id = newTagName.toLowerCase().replace(/\s+/g, '-');
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
    // Removed toast calls to fix build
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (importData(json)) {
        // Success
      } else {
        // Error
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (confirm("确定要清除所有记录吗？此操作无法撤销！")) {
      clearAllData();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto pb-32 sm:pb-12">
      <header className="px-4 sm:px-6 py-4 border-b border-[#e5e5e5] dark:border-[#333333] sticky top-0 bg-[var(--background)] z-20">
        <h1 className="text-lg sm:text-[22px] font-black tracking-tight">应用设置</h1>
        <p className="text-[12px] sm:text-[13px] text-gray-400 font-bold mt-1 tracking-widest uppercase">偏好与资产管理</p>
      </header>

      <div className="flex-1 p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-8 sm:space-y-12">
        
        {/* Appearance Section */}
        <section className="space-y-4">
          <SectionHeader icon={<Sun size={18} />} title="感官与主题" />
          <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[28px] p-6 border border-white/20 dark:border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-black">界面主题</p>
                <p className="text-[12px] text-gray-400 font-bold">目前工作在 {settings.theme === 'light' ? '明亮' : '深色'} 模式</p>
              </div>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 text-white font-black text-[13px] shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                {settings.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                切换至{settings.theme === 'light' ? '深色' : '明亮'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-black/[0.05] dark:border-white/[0.05]">
              <div>
                <p className="text-[15px] font-black">小数点显示</p>
                <p className="text-[12px] text-gray-400 font-bold">能量值显示精度</p>
              </div>
              <div className="flex bg-black/[0.05] dark:bg-white/10 p-1 rounded-full">
                {[0, 1].map(v => (
                  <button
                    key={v}
                    onClick={() => updateSettings({ decimalPlaces: v as 0 | 1 })}
                    className={`px-5 py-1.5 rounded-full text-[12px] font-black transition-all ${settings.decimalPlaces === v ? 'bg-white dark:bg-white/10 shadow-sm text-amber-500' : 'text-gray-400'}`}
                  >
                    {v === 0 ? '整数' : '0.1 精准'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tag Management */}
        <section className="space-y-4">
          <SectionHeader icon={<TagIcon size={18} />} title="智能标签库" />
          <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[28px] p-6 border border-white/20 dark:border-white/5 space-y-6">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
              {tags.map(tag => (
                <div 
                  key={tag.id}
                  className="group relative flex flex-col items-center gap-2 p-4 rounded-[22px] bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.03] hover:shadow-xl hover:-translate-y-1 transition-all"
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
                  <span className="text-[12px] font-black px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: tag.color }}>
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
              
              {/* Add New Tag */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-[22px] bg-black/[0.03] dark:bg-white/[0.03] border border-dashed border-gray-300 dark:border-gray-700">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTagEmoji} 
                    onChange={e => setNewTagEmoji(e.target.value)}
                    className="w-10 h-10 text-center text-xl bg-white dark:bg-white/10 rounded-xl focus:outline-none"
                    placeholder="✨"
                  />
                  <input 
                    type="color" 
                    value={newTagColor} 
                    onChange={e => setNewTagColor(e.target.value)}
                    className="w-10 h-10 p-0 overflow-hidden rounded-xl border-none cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <input 
                    type="text"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    placeholder="标签名称"
                    className="w-full px-3 py-1.5 text-[11px] font-black bg-white dark:bg-white/10 rounded-xl focus:outline-none"
                  />
                  <button 
                    onClick={handleAddTag}
                    className="w-full py-2 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-[11px] font-black hover:opacity-90 transition-opacity"
                  >
                    添加新标签
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">点击标签表情可进行快速修改</p>
          </div>
        </section>

        {/* Time Settings */}
        <section className="space-y-4">
          <SectionHeader icon={<Clock size={18} />} title="时间与折叠" />
          <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[28px] p-6 border border-white/20 dark:border-white/5 space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-[15px] font-black">睡眠时段折叠</p>
                   <p className="text-[12px] text-gray-400 font-bold">默认隐藏 23:00 - 09:00</p>
                </div>
                <button 
                  onClick={() => updateSettings({ hideSleepTime: !settings.hideSleepTime })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${settings.hideSleepTime ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.hideSleepTime ? 'left-7' : 'left-1'}`} />
                </button>
             </div>

             <div className="pt-6 border-t border-black/[0.05] dark:border-white/[0.05]">
                <p className="text-[15px] font-black">原子时间粒度</p>
                <p className="text-[12px] text-gray-400 font-bold">应用已优化为以 1 小时为原子单位，内含双番茄钟架构</p>
             </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="space-y-4">
          <SectionHeader icon={<RotateCcw size={18} />} title="地平线资产管理" />
          <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-[28px] p-6 border border-white/20 dark:border-white/5 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.03] hover:shadow-lg transition-all"
              >
                <Download size={20} className="text-amber-500" />
                <span className="text-[14px] font-black">导出 JSON 备份</span>
              </button>
              <label className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.03] hover:shadow-lg transition-all cursor-pointer">
                <Upload size={20} className="text-blue-500" />
                <span className="text-[14px] font-black">导入备份文件</span>
                <input type="file" className="hidden" accept=".json" onChange={handleImport} />
              </label>
            </div>
            
            <button 
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/40 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={20} />
              <span className="text-[14px] font-black">重置所有数据</span>
            </button>
          </div>
        </section>

        {/* About */}
        <section className="text-center pt-8 pb-12 space-y-4 border-t border-black/[0.05] dark:border-white/[0.05]">
          <div className="flex items-center justify-center gap-2 text-[var(--foreground)] opacity-30">
             <StarIcon size={16} fill="currentColor" />
             <span className="text-[12px] font-black tracking-widest uppercase">Time Lens V5.0 Professional</span>
          </div>
          <p className="text-[12px] text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
            此应用致力于通过量化时间、映射心流，助您在繁杂的世界中捕捉生命的每一颗星辰。
          </p>
          <div className="flex items-center justify-center gap-6 pt-4">
             <button className="text-gray-400 hover:text-amber-500 transition-colors"><Github size={20} /></button>
             <button className="text-gray-400 hover:text-amber-500 transition-colors"><Globe size={20} /></button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-3 px-4">
      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shadow-sm">
        {icon}
      </div>
      <h2 className="text-[16px] font-black tracking-tight">{title}</h2>
    </div>
  );
}
