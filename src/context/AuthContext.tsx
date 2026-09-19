import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, Business } from '../types/database';
import { INITIAL_BUSINESS } from '../lib/mockData';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  business: Business;
  loading: boolean;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  updateBusiness: (updates: Partial<Business>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<Business>(() => {
    const saved = localStorage.getItem('studioos_business');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS;
  });
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured);

  useEffect(() => {
    localStorage.setItem('studioos_business', JSON.stringify(business));
  }, [business]);

  useEffect(() => {
    if (!isSupabaseConfigured || isDemoMode) {
      // Demo Mode Authenticated State for Tejas
      setUser({
        id: 'u-tejas-demo',
        email: 'tejas@icontejas.com',
        user_metadata: { full_name: 'Tejas' }
      });
      setProfile({
        id: 'u-tejas-demo',
        full_name: 'Tejas (IconTejas Studio)',
        phone: '+91 98765 43210',
        role: 'owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    if (supabase) {
      // Listen to Supabase Auth changes
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [isDemoMode]);

  async function fetchProfile(userId: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }
  }

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured || !supabase) {
      setUser({
        id: 'u-tejas-demo',
        email,
        user_metadata: { full_name: 'Tejas' }
      });
      setIsDemoMode(true);
      return {};
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, pass: string, fullName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      setUser({
        id: 'u-tejas-demo',
        email,
        user_metadata: { full_name: fullName }
      });
      setIsDemoMode(true);
      return {};
    }
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: fullName } }
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (supabase && isSupabaseConfigured && !isDemoMode) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: true };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return { success: true };
  };

  const updateBusiness = (updates: Partial<Business>) => {
    setBusiness(prev => ({ ...prev, ...updates, updated_at: new Date().toISOString() }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        business,
        loading,
        isDemoMode,
        setIsDemoMode,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateBusiness
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
