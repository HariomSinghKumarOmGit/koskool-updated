'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User, Phone, X, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, signup, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to sign in');
        } else if (email.trim().toLowerCase() === 'admin@gmail.com') {
          router.push('/admin');
        }
      } else {
        const res = await signup(email, password, name, phone);
        if (!res.success) {
          setError(res.error || 'Failed to create account');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setIsLogin(true);
    setEmail('admin@gmail.com');
    setPassword('admin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-5 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-navy-950 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            K
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-950">
            {isLogin ? 'Sign In to KOSKOOL' : 'Create Student / Parent Account'}
          </h2>
          <p className="text-xs text-gray-500">
            {isLogin
              ? 'Sign in to apply promo codes, manage orders, and proceed to checkout.'
              : 'Save delivery details, track uniform orders, and unlock member discounts.'}
          </p>
        </div>

        {/* Quick Admin Credential Fill Banner */}
        <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-brand-900 block">Administrator Credentials:</span>
            <span className="text-gray-600 font-mono text-[11px]">admin@gmail.com | pass: admin</span>
          </div>
          <button
            type="button"
            onClick={fillAdmin}
            className="text-[11px] font-bold text-white bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-lg transition shrink-0"
          >
            Auto Fill
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Parent or Student Name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
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
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Please wait...' : isLogin ? 'Sign In & Continue' : 'Create Account & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="pt-2 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            {isLogin ? "Don't have an account yet?" : 'Already registered?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="ml-1.5 font-bold text-brand-600 hover:underline"
            >
              {isLogin ? 'Sign Up here' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
