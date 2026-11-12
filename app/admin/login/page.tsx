'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAdmin, user } = useAuth();

  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/admin');
      } else {
        setError(res.error || 'Invalid admin credentials');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white font-black text-2xl shadow-xl shadow-brand-600/30">
          K
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          KOSKOOL Admin Portal
        </h1>
        <p className="text-xs text-gray-400">
          Direct Supabase Management • Bawana Industrial Area, Delhi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-gray-100 space-y-6">
          {/* Default Credentials Badge */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Admin Access Pre-configured</span>
            </div>
            <p className="text-[11px] text-brand-700">
              ID: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold">admin@gmail.com</code> | Pass:{' '}
              <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold">admin</code>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs text-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs text-navy-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-950 hover:bg-navy-900 text-white font-extrabold text-xs py-3.5 px-6 rounded-xl shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-navy-950 transition font-medium"
            >
              ← Return to Public Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
