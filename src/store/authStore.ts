import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setProfile: (profile) => set({ profile }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, profile: null });
      },
      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          set({ profile: data });
        }
      }
    }),
    {
      name: 'time-lens-auth',
    }
  )
);
