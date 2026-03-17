-- Time Lens v6.8.0
-- Supabase settings sync migration
-- 用途：
-- 1. 给 settings 表补齐需要同步的设置字段
-- 2. 支持标签快照、周视图标签显示和能量目标同步

BEGIN;

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS show_details_in_week_view BOOLEAN DEFAULT true;

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS show_tag_names_in_week_view BOOLEAN DEFAULT true;

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS daily_energy_goal INTEGER DEFAULT 5;

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS weekly_energy_goal INTEGER DEFAULT 30;

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS tags_json JSONB DEFAULT '[]'::jsonb;

UPDATE public.settings
SET
  show_details_in_week_view = COALESCE(show_details_in_week_view, true),
  show_tag_names_in_week_view = COALESCE(show_tag_names_in_week_view, true),
  daily_energy_goal = COALESCE(daily_energy_goal, 5),
  weekly_energy_goal = COALESCE(weekly_energy_goal, 30),
  tags_json = COALESCE(tags_json, '[]'::jsonb),
  updated_at = timezone('utc'::text, now())
WHERE
  show_details_in_week_view IS NULL
  OR show_tag_names_in_week_view IS NULL
  OR daily_energy_goal IS NULL
  OR weekly_energy_goal IS NULL
  OR tags_json IS NULL;

COMMENT ON COLUMN public.settings.show_details_in_week_view IS '是否在周视图中显示时间块说明';
COMMENT ON COLUMN public.settings.show_tag_names_in_week_view IS '是否在周视图中显示标签名';
COMMENT ON COLUMN public.settings.daily_energy_goal IS '每日能量目标';
COMMENT ON COLUMN public.settings.weekly_energy_goal IS '每周能量目标';
COMMENT ON COLUMN public.settings.tags_json IS '标签配置快照，用于跨端同步标签颜色与 emoji';

COMMIT;
