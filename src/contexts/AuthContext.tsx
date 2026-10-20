import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map a raw profiles row (DB schema) to the app's Profile type
function normalizeProfile(data: any, authUser?: User | null): Profile {
  return {
    id: data.id,
    email: data.email || authUser?.email || '',
    full_name:
      data.full_name ||
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      (data.email || authUser?.email || '').split('@')[0] ||
      'User',
    phone: data.phone || undefined,
    company_name: data.company_name ?? data.company ?? undefined,
    gst_number: data.gst_number ?? data.tax_id ?? undefined,
    city: data.city || undefined,
    country: data.country || 'India',
    role: data.role || 'customer',
    is_blocked: data.is_blocked ?? (data.status === 'blocked' || data.status === 'disabled'),
    avatar_url: data.avatar_url || authUser?.user_metadata?.avatar_url || undefined,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || undefined,
  };
}

function fallbackProfile(authUser: User): Profile {
  return {
    id: authUser.id,
    email: authUser.email || '',
    full_name:
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      (authUser.email || '').split('@')[0] ||
      'User',
    role: 'customer',
    is_blocked: false,
    avatar_url: authUser.user_metadata?.avatar_url || undefined,
    created_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (authUser: User) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (data) {
        setProfile(normalizeProfile(data, authUser));
        return;
      }

      // No profile row yet — create one from the auth user (the DB trigger
      // normally does this; this is a safety net for OAuth first logins)
      const base = fallbackProfile(authUser);
      try {
        await supabase.from('profiles').insert([
          {
            id: base.id,
            email: base.email,
            full_name: base.full_name,
            role: 'customer',
            status: 'active',
          },
        ]);
      } catch {
        // Ignore — in-state fallback profile below still lets the app work
      }
      setProfile(base);
    } catch (err) {
      console.error('Exception fetching profile:', err);
      setProfile(fallbackProfile(authUser));
    }
  };

  const signInWithGoogle = async (): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        if (/provider/i.test(error.message)) {
          return 'Google login is not enabled yet. Enable it in Supabase Dashboard → Authentication → Sign In / Providers → Google.';
        }
        return error.message;
      }
      return null;
    } catch (err: any) {
      return err?.message || 'Google sign-in failed. Please try again.';
    }
  };

  useEffect(() => {
    // Clean up legacy demo-mode flags from older versions
    localStorage.removeItem('lw_demo_role');
    localStorage.removeItem('lw_demo_admin_bypass');

    // 1. Initial Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setIsLoading(false);
    });

    // 2. Auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Roles come only from the real profiles table — no hardcoded accounts
  const isSuperAdmin = profile?.role === 'super_admin';
  const isAdmin = Boolean(
    isSuperAdmin || profile?.role === 'admin' || profile?.role === 'staff'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAdmin,
        isSuperAdmin,
        isLoading,
        signOut,
        refreshProfile,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
