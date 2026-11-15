'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CustomerAddress } from '@/services/api';

export interface UserProfile {
  id: string; // Supabase auth.users UUID
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  addresses?: CustomerAddress[];
  is_verified?: boolean;
  email_confirmed_at?: string | null;
  created_at?: string;
}

export interface GuestProfile {
  name: string;
  email: string;
  phone: string;
}

export type AuthModalMode = 'login' | 'signup' | 'forgot_password';

interface AuthContextType {
  user: UserProfile | null;
  guestProfile: GuestProfile;
  updateGuestProfile: (data: Partial<GuestProfile>) => void;
  isAdmin: boolean;
  isVerified: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (callback?: () => void, initialMode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
  login: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; role?: 'admin' | 'customer'; unverified?: boolean }>;
  signup: (
    email: string,
    pass: string,
    name: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string; emailVerificationSent?: boolean }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { name?: string; phone?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile>({ name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Load guest profile from localStorage on mount
  useEffect(() => {
    try {
      const savedGuest = localStorage.getItem('koskool_guest_profile');
      if (savedGuest) {
        setGuestProfile(JSON.parse(savedGuest));
      }
    } catch {
      // ignore
    }
  }, []);

  const updateGuestProfile = (data: Partial<GuestProfile>) => {
    setGuestProfile((prev) => {
      const updated: GuestProfile = {
        name: data.name !== undefined ? data.name : prev.name,
        email: data.email !== undefined ? data.email : prev.email,
        phone: data.phone !== undefined ? data.phone : prev.phone,
      };
      try {
        localStorage.setItem('koskool_guest_profile', JSON.stringify(updated));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('koskool_guest_profile_updated', { detail: updated }));
        }
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Helper: fetch or create profile in Supabase profiles table
  const fetchOrCreateProfile = async (
    authUser: { id: string; email?: string; email_confirmed_at?: string | null; user_metadata?: any; created_at?: string },
    forcedRole?: 'admin' | 'customer'
  ): Promise<UserProfile> => {
    const userEmail = (authUser.email || '').toLowerCase().trim();
    const isVerified = Boolean(authUser.email_confirmed_at);
    let profileName = authUser.user_metadata?.name || userEmail.split('@')[0] || 'Valued Customer';
    let profilePhone = authUser.user_metadata?.phone || '';
    let role: 'admin' | 'customer' = forcedRole || (userEmail === 'admin@gmail.com' ? 'admin' : 'customer');
    let addresses: CustomerAddress[] = [];

    // Check if guest had filled personal information locally before logging in
    try {
      const savedGuest = localStorage.getItem('koskool_guest_profile');
      if (savedGuest) {
        const guestData = JSON.parse(savedGuest);
        if ((!profileName || profileName === 'Valued Customer') && guestData.name) {
          profileName = guestData.name;
        }
        if (!profilePhone && guestData.phone) {
          profilePhone = guestData.phone;
        }
      }
    } catch {
      // ignore
    }

    try {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (dbProfile) {
        profileName = dbProfile.name || profileName;
        profilePhone = dbProfile.phone || profilePhone;
        if (dbProfile.role === 'admin' || userEmail === 'admin@gmail.com') {
          role = 'admin';
        }
        if (Array.isArray(dbProfile.addresses)) {
          addresses = dbProfile.addresses;
        }
      } else {
        // Upsert default profile record
        await supabase.from('profiles').upsert([
          {
            id: authUser.id,
            auth_user_id: authUser.id,
            email: userEmail,
            name: profileName,
            phone: profilePhone,
            role,
          },
        ]);
      }

      // Check if guest had addresses saved locally before logging in - sync them to Supabase!
      const savedGuestAddrs = localStorage.getItem('koskool_guest_addresses');
      if (savedGuestAddrs) {
        const guestList = JSON.parse(savedGuestAddrs);
        if (Array.isArray(guestList) && guestList.length > 0) {
          const merged = [...addresses];
          let changed = false;
          for (const gAddr of guestList) {
            if (!merged.some((m) => m.street_area === gAddr.street_area && m.pincode === gAddr.pincode)) {
              merged.push({
                ...gAddr,
                id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                user_id: authUser.id,
              });
              changed = true;
            }
          }
          if (changed) {
            addresses = merged;
            await supabase.from('profiles').update({ addresses: merged, updated_at: new Date().toISOString() }).eq('id', authUser.id);
            localStorage.setItem(`koskool_addresses_${authUser.id}`, JSON.stringify(merged));
            localStorage.removeItem('koskool_guest_addresses');
          }
        }
      }
    } catch (err) {
      console.warn('Profile fetch/sync notice:', err);
    }

    return {
      id: authUser.id,
      email: userEmail,
      name: profileName,
      phone: profilePhone,
      role,
      addresses,
      is_verified: isVerified,
      email_confirmed_at: authUser.email_confirmed_at || null,
      created_at: authUser.created_at || new Date().toISOString(),
    };
  };

  // Listen to Supabase Auth State changes & Load session on mount
  useEffect(() => {
    let mounted = true;

    // 1. Initial cached user check
    try {
      const saved = localStorage.getItem('koskool_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (mounted) setUser(parsed);
      }
    } catch {
      // ignore
    }

    // 2. Fetch live Supabase session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const profile = await fetchOrCreateProfile(session.user);
        if (mounted) {
          setUser(profile);
          localStorage.setItem('koskool_auth_user', JSON.stringify(profile));
          document.cookie = `koskool_role=${profile.role}; path=/; max-age=86400; SameSite=Lax`;
        }
      }
      if (mounted) setIsLoading(false);
    });

    // 3. Subscribe to auth changes (Sign In, Token refresh, Sign Out)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const profile = await fetchOrCreateProfile(session.user);
            if (mounted) {
              setUser(profile);
              localStorage.setItem('koskool_auth_user', JSON.stringify(profile));
              document.cookie = `koskool_role=${profile.role}; path=/; max-age=86400; SameSite=Lax`;
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            // Keep master admin session if logged in as master admin and not via supabase
            const saved = localStorage.getItem('koskool_auth_user');
            const parsed = saved ? JSON.parse(saved) : null;
            if (parsed?.id !== 'admin-super-01') {
              setUser(null);
              localStorage.removeItem('koskool_auth_user');
              document.cookie = 'koskool_role=; path=/; max-age=0; SameSite=Lax';
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (callback?: () => void, initialMode: AuthModalMode = 'login') => {
    if (callback) {
      setPendingCallback(() => callback);
    } else {
      setPendingCallback(null);
    }
    setAuthModalMode(initialMode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; role?: 'admin' | 'customer'; unverified?: boolean }> => {
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
        name: 'KOSKOOL Manager',
        phone: '+91 8130458265',
        role: 'admin',
        is_verified: true,
        email_confirmed_at: new Date().toISOString(),
      };
      setUser(adminUser);
      localStorage.setItem('koskool_auth_user', JSON.stringify(adminUser));
      document.cookie = 'koskool_role=admin; path=/; max-age=86400; SameSite=Lax';

      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
      setIsAuthModalOpen(false);
      return { success: true, role: 'admin' };
    }

    // 2. Supabase Auth Sign In
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: pass,
      });

      if (error) {
        // Detect unconfirmed email error
        if (
          error.message?.toLowerCase().includes('email not confirmed') ||
          error.message?.toLowerCase().includes('email_not_confirmed')
        ) {
          return {
            success: false,
            unverified: true,
            error: 'Email verification required. Please click the verification link sent to your email before signing in.',
          };
        }
        return { success: false, error: error.message || 'Invalid credentials' };
      }

      if (data?.user) {
        const isVerified = Boolean(data.user.email_confirmed_at);
        if (!isVerified) {
          return {
            success: false,
            unverified: true,
            error: 'Email verification required. Please check your inbox and verify your email.',
          };
        }

        const profile = await fetchOrCreateProfile(data.user);
        setUser(profile);
        localStorage.setItem('koskool_auth_user', JSON.stringify(profile));
        document.cookie = `koskool_role=${profile.role}; path=/; max-age=86400; SameSite=Lax`;

        if (pendingCallback) {
          pendingCallback();
          setPendingCallback(null);
        }
        setIsAuthModalOpen(false);
        return { success: true, role: profile.role };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Authentication error. Please check your network and credentials.',
      };
    }

    return {
      success: false,
      error: 'Invalid email address or password. Please try again.',
    };
  };

  const signup = async (
    email: string,
    pass: string,
    name: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string; emailVerificationSent?: boolean }> => {
    const trimmedEmail = email.trim().toLowerCase();

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: pass,
        options: {
          data: {
            name: name.trim(),
            phone: phone?.trim() || '',
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        // Create initial profile record with user's UUID
        try {
          await supabase.from('profiles').upsert([
            {
              id: data.user.id,
              auth_user_id: data.user.id,
              email: trimmedEmail,
              name: name.trim(),
              phone: phone?.trim() || '',
              role: 'customer',
            },
          ]);
        } catch (dbErr) {
          console.warn('Initial profile sync notice:', dbErr);
        }

        // Email verification is mandatory
        return {
          success: true,
          emailVerificationSent: true,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to create account. Please try again.',
      };
    }

    return { success: false, error: 'Registration failed. Please try again.' };
  };

  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmedEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to resend verification email.' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/account/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send password reset email.' };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update password.' };
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; email?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      // User is not logged in: save all personal information locally
      updateGuestProfile({
        name: data.name,
        phone: data.phone,
        email: data.email,
      });
      return { success: true };
    }

    // User is logged in: save to Supabase and cache locally
    const updatedUser: UserProfile = {
      ...user,
      name: data.name !== undefined ? data.name : user.name,
      phone: data.phone !== undefined ? data.phone : user.phone,
    };

    setUser(updatedUser);
    localStorage.setItem('koskool_auth_user', JSON.stringify(updatedUser));

    try {
      await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          phone: updatedUser.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      await supabase.auth.updateUser({
        data: {
          name: updatedUser.name,
          phone: updatedUser.phone,
        },
      });
    } catch (err) {
      console.warn('Profile update notice:', err);
    }

    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('koskool_auth_user');
    document.cookie = 'koskool_role=; path=/; max-age=0; SameSite=Lax';
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        guestProfile,
        updateGuestProfile,
        isAdmin: user?.role === 'admin',
        isVerified: Boolean(user?.is_verified),
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        login,
        signup,
        resendVerificationEmail,
        resetPassword,
        updatePassword,
        updateProfile,
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
