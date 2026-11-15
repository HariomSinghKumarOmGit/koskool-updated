'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and retype.');
      return;
    }

    setLoading(true);
    try {
      const res = await updatePassword(password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.replace('/account');
        }, 2500);
      } else {
        setError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6 animate-scaleIn">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-navy-950 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            <KeyRound className="w-6 h-6 text-brand-500" />
          </div>
          <h1 className="text-2xl font-black text-navy-950">Set New Password</h1>
          <p className="text-xs text-gray-500">
            Please enter your new secure password below to regain full account access.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-navy-950">Password Updated!</h2>
              <p className="text-xs text-gray-600">
                Your password has been changed successfully. Redirecting you to your account...
              </p>
            </div>
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow"
            >
              <span>Go to My Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Saving Password...' : 'Save New Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
