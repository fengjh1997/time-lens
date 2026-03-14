"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Github } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/day");
    }
  }, [user, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        alert("注册成功！请查收确认邮件。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/day");
      }
    } catch (err: any) {
      setError(err.message || "身份验证失败");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-spring">
        <div className="glass-modal rounded-[48px] p-8 sm:p-12 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles size={120} className="text-[var(--primary-color)]" />
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex p-4 rounded-3xl bg-[var(--primary-light)] text-[var(--primary-color)] mb-4">
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)]">
              {mode === 'login' ? '欢迎回来' : '开启星辰之旅'}
            </h1>
            <p className="text-[13px] text-gray-400 font-bold uppercase tracking-widest">
              {mode === 'login' ? 'TIME LENS · 时间透镜' : '创建您的专属时间蓝图'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="您的昵称"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-black/[0.03] dark:bg-white/[0.05] border-2 border-transparent focus:border-[var(--primary-color)]/20 rounded-2xl py-4 pl-12 pr-4 text-[15px] font-bold focus:outline-none focus:ring-4 focus:ring-[var(--primary-glow)] transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="电子邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border-2 border-transparent focus:border-[var(--primary-color)]/20 rounded-2xl py-4 pl-12 pr-4 text-[15px] font-bold focus:outline-none focus:ring-4 focus:ring-[var(--primary-glow)] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="登录密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/[0.03] dark:bg-white/[0.05] border-2 border-transparent focus:border-[var(--primary-color)]/20 rounded-2xl py-4 pl-12 pr-4 text-[15px] font-bold focus:outline-none focus:ring-4 focus:ring-[var(--primary-glow)] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {error && (
              <p className="text-[12px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-xl border border-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary-color)] text-white py-4.5 rounded-3xl font-black text-[16px] shadow-2xl shadow-[var(--primary-glow)] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {mode === 'login' ? '立即登录' : '立即注册'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]"></div>
            </div>
            <div className="relative flex justify-center text-[11px] font-black uppercase tracking-widest">
              <span className="bg-[var(--modal-bg)] px-4 text-gray-400">或者通过</span>
            </div>
          </div>

          <button
            onClick={handleGithubLogin}
            className="w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)] py-4 rounded-3xl font-bold text-[14px] transition-all flex items-center justify-center gap-3 border border-[var(--border-color)]"
          >
            <Github size={20} />
            使用 GitHub 账号登录
          </button>

          <div className="text-center pt-4">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[14px] font-bold text-gray-400 hover:text-[var(--primary-color)] transition-colors"
            >
              {mode === 'login' ? '还没有账号？立即创建' : '已有账号？返回登录'}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-[12px] text-gray-400 font-bold opacity-50 px-8">
          注册即代表您同意我们的《服务条款》与《隐私政策》。数据将通过 Supabase 加密存储在云端，实现多端实时同步。
        </div>
      </div>
    </div>
  );
}
