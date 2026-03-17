"use client";

import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { DEFAULT_TAGS, useTimeStore } from "@/store/timeStore";
import type { Tag, TimeBlock } from "@/types";

function asIso(value?: string | null) {
  return value || new Date(0).toISOString();
}

function buildBasicSettingsPayload(settings: ReturnType<typeof useTimeStore.getState>["settings"], userId: string) {
  return {
    user_id: userId,
    theme: settings.theme,
    primary_color: settings.primaryColor,
    hide_sleep_time: settings.hideSleepTime,
    decimal_places: settings.decimalPlaces,
    updated_at: settings.updatedAt || new Date().toISOString(),
  };
}

function buildExtendedSettingsPayload(
  settings: ReturnType<typeof useTimeStore.getState>["settings"],
  tags: Tag[],
  userId: string,
) {
  return {
    ...buildBasicSettingsPayload(settings, userId),
    show_details_in_week_view: settings.showDetailsInWeekView,
    show_tag_names_in_week_view: settings.showTagNamesInWeekView,
    daily_energy_goal: settings.dailyEnergyGoal,
    weekly_energy_goal: settings.weeklyEnergyGoal,
    tags_json: tags,
  };
}

async function upsertSettingsWithFallback(
  settings: ReturnType<typeof useTimeStore.getState>["settings"],
  tags: Tag[],
  userId: string,
) {
  const extendedPayload = buildExtendedSettingsPayload(settings, tags, userId);
  const { error } = await supabase.from("settings").upsert(extendedPayload);
  if (!error) return true;

  const fallbackPayload = buildBasicSettingsPayload(settings, userId);
  const { error: fallbackError } = await supabase.from("settings").upsert(fallbackPayload);
  if (fallbackError) {
    console.error("Settings sync failed:", fallbackError);
    return false;
  }
  return false;
}

export function useSync() {
  const {
    blocks,
    saveBlock,
    settings,
    updateSettings,
    tags,
    setSyncStatus,
    setLastSyncedAt,
  } = useTimeStore();
  const { user } = useAuthStore();

  const isSyncingFromCloud = useRef(false);
  const latestBlocksRef = useRef(blocks);
  const latestSettingsRef = useRef(settings);
  const latestTagsRef = useRef(tags);

  useEffect(() => {
    latestBlocksRef.current = blocks;
    latestSettingsRef.current = settings;
    latestTagsRef.current = tags;
  }, [blocks, settings, tags]);

  const pushSettings = useCallback(async () => {
    if (!user || !settings.cloudSyncEnabled || isSyncingFromCloud.current) return;
    const usedExtendedSchema = await upsertSettingsWithFallback(settings, tags, user.id);
    if (usedExtendedSchema || tags.length === DEFAULT_TAGS.length) {
      setLastSyncedAt(new Date().toISOString());
    }
  }, [settings, tags, user, setLastSyncedAt]);

  useEffect(() => {
    if (!user || !settings.cloudSyncEnabled) return;

    const pullData = async () => {
      isSyncingFromCloud.current = true;
      setSyncStatus(true);

      try {
        const { data: cloudBlocks } = await supabase.from("blocks").select("*").eq("user_id", user.id);

        if (cloudBlocks) {
          for (const cloudBlock of cloudBlocks) {
            const localKey = `${cloudBlock.date}-${cloudBlock.hour_id}`;
            const localBlock = latestBlocksRef.current[localKey];
            const cloudUpdatedAt = asIso(cloudBlock.updated_at);
            const localUpdatedAt = asIso(localBlock?.updatedAt);

            if (!localBlock || cloudUpdatedAt > localUpdatedAt) {
              const nextBlock: TimeBlock = {
                id: cloudBlock.id,
                content: cloudBlock.content || "",
                score: cloudBlock.score,
                tagId: cloudBlock.tag_id || undefined,
                status: cloudBlock.status,
                pomodoros: cloudBlock.pomodoros || 0,
                isBonus: !!cloudBlock.is_bonus,
                dayOfWeek: new Date(cloudBlock.date).getDay(),
                hourId: cloudBlock.hour_id,
                updatedAt: cloudUpdatedAt,
              };
              saveBlock(cloudBlock.date, nextBlock);
            } else if (localUpdatedAt > cloudUpdatedAt) {
              await supabase.from("blocks").upsert({
                id: localBlock.id,
                user_id: user.id,
                date: cloudBlock.date,
                hour_id: localBlock.hourId,
                content: localBlock.content,
                score: localBlock.score,
                tag_id: localBlock.tagId,
                status: localBlock.status,
                pomodoros: localBlock.pomodoros || 0,
                is_bonus: localBlock.isBonus || false,
                updated_at: localUpdatedAt,
              });
            }
          }
        }

        const { data: cloudSettings } = await supabase.from("settings").select("*").eq("user_id", user.id).maybeSingle();

        if (cloudSettings) {
          const cloudUpdatedAt = asIso(cloudSettings.updated_at);
          const localUpdatedAt = asIso(latestSettingsRef.current.updatedAt);

          if (cloudUpdatedAt >= localUpdatedAt) {
            updateSettings({
              theme: cloudSettings.theme || latestSettingsRef.current.theme,
              primaryColor: cloudSettings.primary_color || latestSettingsRef.current.primaryColor,
              hideSleepTime: cloudSettings.hide_sleep_time ?? latestSettingsRef.current.hideSleepTime,
              decimalPlaces: cloudSettings.decimal_places ?? latestSettingsRef.current.decimalPlaces,
              showDetailsInWeekView:
                cloudSettings.show_details_in_week_view ?? latestSettingsRef.current.showDetailsInWeekView,
              showTagNamesInWeekView:
                cloudSettings.show_tag_names_in_week_view ?? latestSettingsRef.current.showTagNamesInWeekView,
              dailyEnergyGoal: cloudSettings.daily_energy_goal ?? latestSettingsRef.current.dailyEnergyGoal,
              weeklyEnergyGoal: cloudSettings.weekly_energy_goal ?? latestSettingsRef.current.weeklyEnergyGoal,
              updatedAt: cloudUpdatedAt,
            });

            if (Array.isArray(cloudSettings.tags_json)) {
              const cloudTags = cloudSettings.tags_json as Tag[];
              const store = useTimeStore.getState();

              store.tags
                .filter((tag) => !cloudTags.some((cloudTag) => cloudTag.id === tag.id))
                .forEach((localOnlyTag) => store.removeTag(localOnlyTag.id));

              cloudTags.forEach((tag) => {
                if (store.tags.some((existing) => existing.id === tag.id)) {
                  store.updateTag(tag);
                } else {
                  store.addTag(tag);
                }
              });
            }
          } else {
            await upsertSettingsWithFallback(latestSettingsRef.current, latestTagsRef.current, user.id);
          }
        } else {
          await upsertSettingsWithFallback(latestSettingsRef.current, latestTagsRef.current, user.id);
        }

        setLastSyncedAt(new Date().toISOString());
      } catch (error) {
        console.error("Sync pull error:", error);
      } finally {
        setSyncStatus(false);
        isSyncingFromCloud.current = false;
      }
    };

    pullData();
  }, [saveBlock, settings.cloudSyncEnabled, updateSettings, user, setLastSyncedAt, setSyncStatus]);

  const manualSync = useCallback(async () => {
    if (!user) return;
    setSyncStatus(true);

    try {
      await upsertSettingsWithFallback(settings, tags, user.id);

      const blockEntries = Object.entries(blocks).map(([key, block]) => {
        const dateStr = key.split("-").slice(0, 3).join("-");
        return {
          id: block.id,
          user_id: user.id,
          date: dateStr,
          hour_id: block.hourId,
          content: block.content,
          score: block.score,
          tag_id: block.tagId,
          status: block.status,
          pomodoros: block.pomodoros || 0,
          is_bonus: block.isBonus || false,
          updated_at: block.updatedAt || new Date().toISOString(),
        };
      });

      if (blockEntries.length > 0) {
        await supabase.from("blocks").upsert(blockEntries);
      }

      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      console.error("Manual sync error:", error);
    } finally {
      setSyncStatus(false);
    }
  }, [blocks, settings, setLastSyncedAt, setSyncStatus, tags, user]);

  const pushBlock = useCallback(
    async (block: TimeBlock, dateStr: string) => {
      if (!user || !settings.cloudSyncEnabled || isSyncingFromCloud.current) return;
      await supabase.from("blocks").upsert({
        id: block.id,
        user_id: user.id,
        date: dateStr,
        hour_id: block.hourId,
        content: block.content,
        score: block.score,
        tag_id: block.tagId,
        status: block.status,
        pomodoros: block.pomodoros || 0,
        is_bonus: block.isBonus || false,
        updated_at: block.updatedAt || new Date().toISOString(),
      });
      setLastSyncedAt(new Date().toISOString());
    },
    [settings.cloudSyncEnabled, user, setLastSyncedAt],
  );

  const deleteCloudBlock = useCallback(
    async (blockId: string) => {
      if (!user || !settings.cloudSyncEnabled || isSyncingFromCloud.current) return;
      await supabase.from("blocks").delete().eq("id", blockId).eq("user_id", user.id);
      setLastSyncedAt(new Date().toISOString());
    },
    [settings.cloudSyncEnabled, user, setLastSyncedAt],
  );

  return { pushBlock, deleteCloudBlock, pushSettings, manualSync };
}
