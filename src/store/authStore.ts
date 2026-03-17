import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
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
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          set({ profile: data as UserProfile });
        }
      },
    }),
    {
      name: "time-lens-auth",
    },
  ),
);
