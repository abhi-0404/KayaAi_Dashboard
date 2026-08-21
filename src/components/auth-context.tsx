import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  DEV_AUTH_BYPASS,
  DEV_USER_EMAIL,
  DEV_USER_ID,
  DEV_USER_NAME,
} from "@/lib/dev-auth";

export type AppRole = "admin" | "supervisor" | "worker";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type AuthProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  approval_status: ApprovalStatus;
};

type AuthValue = {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  roles: AppRole[];
  loading: boolean;
  profileLoading: boolean;
  approvalStatus: ApprovalStatus | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  profile: null,
  roles: [],
  loading: true,
  profileLoading: true,
  approvalStatus: null,
  refreshProfile: async () => {},
  signOut: async () => {},
});

/*
 * Synthetic identity used only when the local bypass is active. Cast rather than
 * fully constructed: Supabase's Session/User carry a dozen fields the app never
 * reads, and inventing plausible values for tokens would be worse than admitting
 * only these four are real.
 */
const devUser = {
  id: DEV_USER_ID,
  email: DEV_USER_EMAIL,
  app_metadata: {},
  user_metadata: { full_name: DEV_USER_NAME },
  aud: "authenticated",
  created_at: new Date(0).toISOString(),
} as unknown as User;

const devSession = { user: devUser } as unknown as Session;

const devProfile: AuthProfile = {
  id: DEV_USER_ID,
  display_name: DEV_USER_NAME,
  email: DEV_USER_EMAIL,
  avatar_url: null,
  approval_status: "approved",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    // Skip Supabase entirely under the bypass: subscribing would immediately
    // report "no session" and fight the synthetic value below.
    if (DEV_AUTH_BYPASS) return;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  const loadProfile = useCallback(async (id: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, email, avatar_url, approval_status")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", id),
    ]);
    setProfile((p as AuthProfile | null) ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((row) => row.role));
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    if (DEV_AUTH_BYPASS) {
      setProfileLoading(false);
      return;
    }
    if (!userId) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    void loadProfile(userId);

    // Subscribe to real-time profile changes
    const subscription = supabase
      .channel(`profile_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Profile updated:', payload);
          // Reload profile when it changes in the database
          void loadProfile(userId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (userId) await loadProfile(userId);
  }, [userId, loadProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session: DEV_AUTH_BYPASS ? devSession : session,
        user: DEV_AUTH_BYPASS ? devUser : (session?.user ?? null),
        profile: DEV_AUTH_BYPASS ? devProfile : profile,
        // Admin so every route, including the two admin-only ones, is reviewable.
        roles: DEV_AUTH_BYPASS ? ["admin"] : roles,
        loading: DEV_AUTH_BYPASS ? false : loading,
        profileLoading: DEV_AUTH_BYPASS ? false : profileLoading,
        approvalStatus: DEV_AUTH_BYPASS
          ? "approved"
          : (profile?.approval_status ?? null),
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
