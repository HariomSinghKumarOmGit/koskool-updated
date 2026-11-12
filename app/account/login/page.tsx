'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User, Phone, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const isAdminRedirect = redirectUrl.startsWith('/admin');

  const { login, signup, user, isAdmin, isLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        router.replace(redirectUrl || '/admin');
      } else if (!isAdminRedirect) {
        router.replace(redirectUrl || '/');
      }
    }
  }, [user, isLoading, redirectUrl, isAdminRedirect, router]);

  // If redirected from admin, force login mode
  useEffect(() => {
    if (isAdminRedirect) {
      setIsLogin(true);
    }
  }, [isAdminRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid credentials');
        } else if (res.role === 'admin') {
          // Successfully logged in as admin - navigate to admin panel
          router.replace(redirectUrl || '/admin');
        } else {
          // Logged in as regular customer
          if (isAdminRedirect) {
            setError('Access Denied: This account does not have administrator privileges.');
          } else {
            router.replace(redirectUrl || '/');
          }
        }
      } else {
        const res = await signup(email, password, name, phone);
        if (!res.success) {
          setError(res.error || 'Failed to create account');
        } else {
          router.replace(redirectUrl || '/');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-navy-950 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            K
          </div>
          <h1 className="text-2xl font-black text-navy-950">
            {isAdminRedirect
              ? 'Administrator Login'
              : isLogin
              ? 'Sign In to KOSKOOL'
              : 'Create Student / Parent Account'}
          </h1>
          <p className="text-xs text-gray-500">
            {isAdminRedirect
              ? 'Please authenticate with your administrator credentials to access the management portal.'
              : 'Manage school orders, track dispatches, and save sizes for quick reorders.'}
          </p>
        </div>

        {/* Admin notice banner when redirected from admin area */}
        {isAdminRedirect && (
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Admin Authentication Required</span>
              <span>Sign in with authorized administrator credentials to open the control panel.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Parent / Student Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {!isAdminRedirect && (
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-1 font-bold text-brand-600 hover:underline"
              >
                {isLogin ? 'Register now' : 'Sign In'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-navy-950 border-t-brand-600 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
