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
  loginAsDemo: (role: 'admin' | 'customer') => void;
}

const DEMO_ADMIN_USER: User = {
  id: 'usr-admin-rahul',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'RM Rahul' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
  email: 'admin@licensewala.com',
  phone: '+91 99999 88888',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
} as User;

const DEMO_ADMIN_PROFILE: Profile = {
  id: 'usr-admin-rahul',
  email: 'admin@licensewala.com',
  full_name: 'RM Rahul (Super Admin)',
  phone: '+91 99999 88888',
  role: 'super_admin',
  is_blocked: false,
  created_at: '2026-01-01T00:00:00Z',
};

const DEMO_CUSTOMER_USER: User = {
  id: 'user-1',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Amit Patel' },
  aud: 'authenticated',
  created_at: '2026-03-01T00:00:00Z',
  email: 'amit.patel@gmail.com',
  phone: '+91 98200 12345',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
} as User;

const DEMO_CUSTOMER_PROFILE: Profile = {
  id: 'user-1',
  email: 'amit.patel@gmail.com',
  full_name: 'Amit Patel',
  phone: '+91 98200 12345',
  role: 'customer',
  is_blocked: false,
  created_at: '2026-03-01T00:00:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isUUID = (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      if (!isUUID(userId)) {
        const isSuper =
          email?.toLowerCase().includes('rahul') ||
          email?.toLowerCase().includes('admin') ||
          userId.includes('admin');
        const fallbackProfile: Profile = {
          id: userId,
          email: email || (isSuper ? 'admin@licensewala.com' : 'user@example.com'),
          full_name: isSuper ? 'RM Rahul (Super Admin)' : email?.split('@')[0] || 'User',
          role: isSuper ? 'super_admin' : 'customer',
          is_blocked: false,
          created_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      } else {
        const isSuper = email?.toLowerCase().includes('rahul') || email?.toLowerCase().includes('admin');
        const fallbackProfile: Profile = {
          id: userId,
          email: email || '',
          full_name: isSuper ? 'RM Rahul (Super Admin)' : email?.split('@')[0] || 'User',
          role: isSuper ? 'super_admin' : 'customer',
          is_blocked: false,
          created_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
      }
    } catch (err) {
      console.error('Exception fetching profile:', err);
    }
  };

  const loginAsDemo = (role: 'admin' | 'customer') => {
    localStorage.setItem('lw_demo_role', role);
    if (role === 'admin') {
      setUser(DEMO_ADMIN_USER);
      setProfile(DEMO_ADMIN_PROFILE);
    } else {
      setUser(DEMO_CUSTOMER_USER);
      setProfile(DEMO_CUSTOMER_PROFILE);
    }
    setIsLoading(false);
  };

  const signInWithGoogle = async (): Promise<string | null> => {
    try {
      // Clear any demo session so the real OAuth session is picked up on return
      localStorage.removeItem('lw_demo_role');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) {
        if (/provider/i.test(error.message)) {
          return 'Google login is not enabled yet. Enable it in Supabase Dashboard → Authentication → Providers → Google.';
        }
        return error.message;
      }
      return null;
    } catch (err: any) {
      return err?.message || 'Google sign-in failed. Please try again.';
    }
  };

  useEffect(() => {
    // Check saved demo role first
    const savedRole = localStorage.getItem('lw_demo_role');
    if (savedRole === 'admin') {
      setUser(DEMO_ADMIN_USER);
      setProfile(DEMO_ADMIN_PROFILE);
      setIsLoading(false);
      return;
    } else if (savedRole === 'customer') {
      setUser(DEMO_CUSTOMER_USER);
      setProfile(DEMO_CUSTOMER_PROFILE);
      setIsLoading(false);
      return;
    }

    // 1. Initial Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setIsLoading(false);
    });

    // 2. Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email);
        } else if (!localStorage.getItem('lw_demo_role')) {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user && !localStorage.getItem('lw_demo_role')) {
      await fetchProfile(user.id, user.email);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('lw_demo_role');
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const isSuperAdmin = Boolean(
    profile?.role === 'super_admin' || 
    user?.email?.toLowerCase().includes('rahul') ||
    user?.email?.toLowerCase().includes('admin@')
  );

  const isAdmin = Boolean(
    isSuperAdmin || 
    profile?.role === 'admin' || 
    profile?.role === 'staff'
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
        loginAsDemo,
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
