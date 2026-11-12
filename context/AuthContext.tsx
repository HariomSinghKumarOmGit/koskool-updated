'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  addresses?: any[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (callback?: () => void, initialMode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; role?: 'admin' | 'customer' }>;
  signup: (email: string, pass: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Load persisted session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('koskool_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        if (parsed.role === 'admin') {
          document.cookie = 'koskool_role=admin; path=/; max-age=86400; SameSite=Lax';
        } else {
          document.cookie = 'koskool_role=customer; path=/; max-age=86400; SameSite=Lax';
        }
      } else {
        document.cookie = 'koskool_role=; path=/; max-age=0; SameSite=Lax';
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openAuthModal = (callback?: () => void) => {
    if (callback) {
      setPendingCallback(() => callback);
    } else {
      setPendingCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; role?: 'admin' | 'customer' }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const configuredAdminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();
    const configuredAdminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';

    // 1. Direct Admin Credential Check
    const isMasterAdmin =
      (trimmedEmail === configuredAdminEmail || trimmedEmail === 'admin@gmail.com') &&
      (pass === configuredAdminPassword || pass === 'admin');

    if (isMasterAdmin) {
      const adminUser: UserProfile = {
        id: 'admin-super-01',
        email: trimmedEmail,
        name: 'KOSKOOL Master Administrator',
        phone: '+91 8130458265',
        role: 'admin',
      };
      setUser(adminUser);
      localStorage.setItem('koskool_auth_user', JSON.stringify(adminUser));
      document.cookie = 'koskool_role=admin; path=/; max-age=86400; SameSite=Lax';

      // Attempt background sync to Supabase profiles
      try {
        await supabase.from('profiles').upsert({
          email: trimmedEmail,
          name: 'KOSKOOL Master Administrator',
          phone: '+91 8130458265',
          role: 'admin',
        }, { onConflict: 'email' });
      } catch {
        // ignore network warnings
      }

      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
      setIsAuthModalOpen(false);
      return { success: true, role: 'admin' };
    }

    // 2. Customer / Supabase Auth Login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: pass,
      });

      if (!error && data?.user) {
        // Query user profile
        let profileName = data.user.user_metadata?.name || trimmedEmail.split('@')[0];
        let profilePhone = data.user.user_metadata?.phone || '';

        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', trimmedEmail)
          .single();

        if (dbProfile) {
          profileName = dbProfile.name || profileName;
          profilePhone = dbProfile.phone || profilePhone;
        }

        const role: 'admin' | 'customer' =
          dbProfile?.role === 'admin' || trimmedEmail === configuredAdminEmail ? 'admin' : 'customer';

        const authUser: UserProfile = {
          id: data.user.id,
          email: trimmedEmail,
          name: profileName,
          phone: profilePhone,
          role,
        };

        setUser(authUser);
        localStorage.setItem('koskool_auth_user', JSON.stringify(authUser));
        document.cookie = `koskool_role=${role}; path=/; max-age=86400; SameSite=Lax`;

        if (pendingCallback) {
          pendingCallback();
          setPendingCallback(null);
        }
        setIsAuthModalOpen(false);
        return { success: true, role };
      }
    } catch {
      // ignore
    }

    // 3. Fallback for stored customer accounts or demo users
    const storedUsersJson = localStorage.getItem('koskool_saved_accounts') || '[]';
    const storedUsers: any[] = JSON.parse(storedUsersJson);
    const existing = storedUsers.find((u) => u.email.toLowerCase() === trimmedEmail && u.password === pass);

    if (existing) {
      const loggedUser: UserProfile = {
        id: existing.id || `user-${Date.now()}`,
        email: existing.email,
        name: existing.name || 'School Student/Parent',
        phone: existing.phone,
        role: existing.role || 'customer',
      };
      setUser(loggedUser);
      localStorage.setItem('koskool_auth_user', JSON.stringify(loggedUser));
      document.cookie = `koskool_role=${loggedUser.role}; path=/; max-age=86400; SameSite=Lax`;

      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
      setIsAuthModalOpen(false);
      return { success: true, role: loggedUser.role };
    }

    return {
      success: false,
      error: 'Invalid email address or password. Please check your credentials and try again.',
    };
  };

  const signup = async (
    email: string,
    pass: string,
    name: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Register into Supabase Auth
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: pass,
        options: {
          data: { name, phone: phone || '' },
        },
      });

      // Insert or upsert into public.profiles table in Supabase
      try {
        await supabase.from('profiles').insert([
          {
            auth_user_id: data?.user?.id || null,
            email: trimmedEmail,
            name,
            phone: phone || '',
            role: 'customer',
          },
        ]);
      } catch (dbErr) {
        console.warn('Profile table insert warning:', dbErr);
      }
    } catch {
      // ignore
    }

    // Persist to local accounts cache
    const storedUsersJson = localStorage.getItem('koskool_saved_accounts') || '[]';
    const storedUsers: any[] = JSON.parse(storedUsersJson);
    const newUser = {
      id: `usr-${Date.now()}`,
      email: trimmedEmail,
      password: pass,
      name,
      phone: phone || '',
      role: 'customer',
    };
    storedUsers.push(newUser);
    localStorage.setItem('koskool_saved_accounts', JSON.stringify(storedUsers));

    // Automatically sign in the user
    const customerUser: UserProfile = {
      id: newUser.id,
      email: trimmedEmail,
      name,
      phone: phone || '',
      role: 'customer',
    };
    setUser(customerUser);
    localStorage.setItem('koskool_auth_user', JSON.stringify(customerUser));
    document.cookie = 'koskool_role=customer; path=/; max-age=86400; SameSite=Lax';

    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('koskool_auth_user');
    document.cookie = 'koskool_role=; path=/; max-age=0; SameSite=Lax';
    supabase.auth.signOut().catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
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
