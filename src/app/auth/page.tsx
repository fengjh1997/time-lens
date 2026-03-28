"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Github, Loader2, Lock, Mail, Sparkles, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export default function AuthPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    if (user) router.push("/now");
  }, [router, user]);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setRegSuccess(false);

    try {
      if (mode === "register") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          setRegSuccess(true);
        } else {
          router.push("/now");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push("/now");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "认证失败");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) setError(oauthError.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[42px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.72))] p-8 shadow-[var(--shadow-lg)] backdrop-blur-[30px] sm:p-10">
        <div className="pointer-events-none absolute inset-x-10 top-24 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--primary-rgb),0.28),transparent)]" />
        <div className="pointer-events-none absolute inset-x-8 bottom-24 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--primary-rgb),0.18),transparent)]" />
        <div className="pointer-events-none absolute right-10 top-16 h-2 w-2 rounded-full bg-[rgba(var(--primary-rgb),0.28)]" />
        <div className="pointer-events-none absolute left-14 top-32 h-1.5 w-1.5 rounded-full bg-[rgba(var(--primary-rgb),0.22)]" />

        <div className="relative z-10 text-center">
          <div className="mb-4 inline-flex rounded-[26px] bg-[var(--primary-light)] p-4 text-[var(--primary-color)]">
            <Sparkles size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-[-0.06em]">
            {regSuccess ? "查收确认邮件" : mode === "login" ? "继续进入时流" : "创建 TimeFlow 账号"}
          </h1>
          <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.22em] text-faint">
            {regSuccess ? "check your inbox" : "timeflow cloud sync"}
          </p>
        </div>

        {regSuccess ? (
          <div className="relative z-10 mt-8 space-y-4 text-center">
            <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-50 p-5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
              已向 {email} 发送确认邮件，验证后再回来登录即可。
            </div>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setRegSuccess(false);
              }}
              className="w-full rounded-[24px] bg-[var(--primary-color)] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[var(--primary-glow)]"
            >
              返回登录
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleAuth} className="relative z-10 mt-8 space-y-4">
              {mode === "register" && (
                <Field icon={<UserIcon size={18} />} value={fullName} onChange={setFullName} placeholder="昵称" type="text" />
              )}
              <Field icon={<Mail size={18} />} value={email} onChange={setEmail} placeholder="邮箱" type="email" />
              <Field icon={<Lock size={18} />} value={password} onChange={setPassword} placeholder="密码" type="password" />

              {error && <div className="rounded-[18px] bg-red-50 px-4 py-3 text-sm font-medium text-red-500 dark:bg-red-950/20">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[var(--primary-color)] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[var(--primary-glow)]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : mode === "login" ? "登录" : "注册"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="relative z-10 my-6 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] text-faint">
              <div className="h-px flex-1 bg-[var(--border-color)]" />
              <span>or</span>
              <div className="h-px flex-1 bg-[var(--border-color)]" />
            </div>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="relative z-10 flex w-full items-center justify-center gap-3 rounded-[24px] border border-[var(--border-color)] bg-black/[0.03] px-5 py-4 text-sm font-black dark:bg-white/[0.04]"
            >
              <Github size={18} />
              使用 GitHub 登录
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="relative z-10 mt-6 w-full text-center text-sm font-bold text-faint"
            >
              {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  icon,
  value,
  onChange,
  placeholder,
  type,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint">{icon}</div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-[20px] border border-transparent bg-black/[0.03] py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all focus:border-[var(--primary-color)]/30 dark:bg-white/[0.04]"
      />
    </div>
  );
}
