"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useTimeStore } from '@/store/timeStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { TimeBlock } from '@/types';

export function useSync() {
  const { blocks, saveBlock, settings, updateSettings } = useTimeStore();
  const { user } = useAuthStore();
  
  // Use a ref to prevent infinite loops when syncing back from cloud
  const isSyncingFromCloud = useRef(false);

  // 1. Fetch from Cloud on Login
  useEffect(() => {
    if (!user) return;

    const pullData = async () => {
      isSyncingFromCloud.current = true;
      try {
        // Fetch Blocks
        const { data: cloudBlocks, error: blocksError } = await supabase
          .from('blocks')
          .select('*')
          .eq('user_id', user.id);

        if (!blocksError && cloudBlocks) {
          cloudBlocks.forEach((cb) => {
            const block: TimeBlock = {
              id: cb.id,
              content: cb.content || "",
              score: cb.score as any,
              tagId: cb.tag_id,
              status: cb.status as any,
              pomodoros: cb.pomodoros,
              isBonus: cb.is_bonus,
              dayOfWeek: new Date(cb.date).getDay(),
              hourId: cb.hour_id,
            };
            saveBlock(cb.date, block);
          });
        }

        // Fetch Settings
        const { data: cloudSettings, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!settingsError && cloudSettings) {
          updateSettings({
            theme: cloudSettings.theme as any,
            primaryColor: cloudSettings.primary_color as any,
            hideSleepTime: cloudSettings.hide_sleep_time,
            decimalPlaces: cloudSettings.decimal_places,
          });
        }
      } catch (err) {
        console.error("Sync pull error:", err);
      } finally {
        isSyncingFromCloud.current = false;
      }
    };

    pullData();
  }, [user, saveBlock, updateSettings]);

  // Push Logic (Individual updates are better handled in saveBlock, but for now we listen to change)
  const pushBlock = useCallback(async (block: TimeBlock, dateStr: string) => {
    if (!user || isSyncingFromCloud.current) return;

    await supabase.from('blocks').upsert({
      id: block.id,
      user_id: user.id,
      date: dateStr,
      hour_id: block.hourId,
      content: block.content,
      score: block.score,
      tag_id: block.tagId,
      status: block.status,
      pomodoros: block.pomodoros,
      is_bonus: block.isBonus,
      updated_at: new Date().toISOString(),
    });
  }, [user]);

  const deleteCloudBlock = useCallback(async (blockId: string) => {
    if (!user || isSyncingFromCloud.current) return;
    await supabase.from('blocks').delete().eq('id', blockId).eq('user_id', user.id);
  }, [user]);

  const pushSettings = useCallback(async () => {
    if (!user || isSyncingFromCloud.current) return;
    await supabase.from('settings').upsert({
      user_id: user.id,
      theme: settings.theme,
      primary_color: settings.primaryColor,
      hide_sleep_time: settings.hideSleepTime,
      decimal_places: settings.decimalPlaces,
      updated_at: new Date().toISOString(),
    });
  }, [user, settings]);

  return { pushBlock, deleteCloudBlock, pushSettings };
}
