-- Time Lens (星辰透镜) - Supabase 数据库建模 SQL
-- 请在 Supabase 控制台的 SQL Editor 中粘贴并执行以下代码

-- 1. 创建 User Profiles 表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 开启 Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和编辑自己的 Profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. 创建 Time Blocks 表 (核心记录)
CREATE TABLE IF NOT EXISTS public.blocks (
  id TEXT PRIMARY KEY, -- 格式：date-hour (例如 2026-03-14-10)
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  hour_id TEXT NOT NULL,
  content TEXT,
  score FLOAT DEFAULT 0,
  tag_id TEXT,
  status TEXT DEFAULT 'completed',
  pomodoros INTEGER DEFAULT 0,
  is_bonus BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- 复合唯一索引（确保每个用户每个时段只有一个记录）
  UNIQUE(user_id, date, hour_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能操作自己的 Block
CREATE POLICY "Users can view own blocks" ON public.blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own blocks" ON public.blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own blocks" ON public.blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own blocks" ON public.blocks FOR DELETE USING (auth.uid() = user_id);

-- 3. 创建 User Settings 表
CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'light',
  primary_color TEXT DEFAULT 'amber',
  hide_sleep_time BOOLEAN DEFAULT true,
  decimal_places INTEGER DEFAULT 1,
  show_details_in_week_view BOOLEAN DEFAULT true,
  daily_energy_goal INTEGER DEFAULT 5,
  weekly_energy_goal INTEGER DEFAULT 30,
  tags_json JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS show_details_in_week_view BOOLEAN DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS daily_energy_goal INTEGER DEFAULT 5;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS weekly_energy_goal INTEGER DEFAULT 30;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tags_json JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);

-- 4. 自动化 Trigger: 当用户注册时自动创建 Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
