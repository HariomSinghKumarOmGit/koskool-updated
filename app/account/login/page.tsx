'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const isAdminRedirect = redirectUrl.startsWith('/admin');

  const { login, signup, resendVerificationEmail, resetPassword, user, isAdmin, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(
    isAdminRedirect ? 'login' : 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);

  // If already logged in, redirect appropriately
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        router.replace(redirectUrl || '/admin');
      } else if (!isAdminRedirect) {
        router.replace(redirectUrl || '/account');
      }
    }
  }, [user, isLoading, redirectUrl, isAdminRedirect, router]);

  // If redirected from admin, force login mode
  useEffect(() => {
    if (isAdminRedirect) {
      setMode('login');
    }
  }, [isAdminRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid credentials');
          if (res.unverified) {
            setIsUnverified(true);
          }
        } else if (res.role === 'admin') {
          router.replace(redirectUrl || '/admin');
        } else {
          if (isAdminRedirect) {
            setError('Access Denied: You do not have permission to access this area.');
          } else {
            router.replace(redirectUrl || '/account');
          }
        }
      } else if (mode === 'signup') {
        const res = await signup(email, password, name, phone);
        if (!res.success) {
          setError(res.error || 'Failed to create account');
        } else {
          setSignupComplete(true);
          setSuccessMsg(`Account created! We've sent a verification email to ${email}.`);
        }
      } else if (mode === 'forgot_password') {
        const res = await resetPassword(email);
        if (!res.success) {
          setError(res.error || 'Failed to send password reset email');
        } else {
          setSuccessMsg(`Password reset instructions have been sent to ${email}. Please check your inbox.`);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }
    setResending(true);
    setError('');
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        setSuccessMsg(`Verification email resent to ${email}! Please check your inbox and spam folder.`);
      } else {
        setError(res.error || 'Failed to resend verification email.');
      }
    } catch {
      setError('Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6 animate-scaleIn">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-navy-950 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            K
          </div>
          <h1 className="text-2xl font-black text-navy-950">
            {signupComplete
              ? 'Verify Your Email'
              : mode === 'login'
              ? 'Sign In to KOSKOOL'
              : mode === 'signup'
              ? 'Create Student / Parent Account'
              : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-gray-500">
            {signupComplete
              ? 'Click the verification link sent to your email to activate your account.'
              : mode === 'login'
              ? 'Manage school orders, track dispatches, and save delivery addresses.'
              : mode === 'signup'
              ? 'Email verification is mandatory before placing uniform orders.'
              : 'Enter your registered email address to receive password reset instructions.'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span>{error}</span>
              {isUnverified && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="block text-[11px] font-bold text-red-800 underline hover:no-underline pt-0.5"
                >
                  {resending ? 'Sending...' : 'Click here to resend verification email'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1">
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        {signupComplete ? (
          <div className="space-y-4 pt-2 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-navy-950">Verification Email Sent!</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We sent an activation link to <strong className="text-navy-950">{email}</strong>. Please check your inbox and confirm your email before placing an order.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] font-medium text-left">
              <strong>Mandatory Email Verification:</strong> As per security policy, customers must verify their email before logging in or completing checkout.
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-navy-950 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resending ? 'Sending...' : 'Resend Verification Email'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignupComplete(false);
                  setMode('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs transition"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Mobile Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
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

            {mode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Password *</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] font-bold text-brand-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3 px-6 rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Sign In to Account'
                  : mode === 'signup'
                  ? 'Create Verified Account'
                  : 'Send Reset Instructions'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode switch */}
        {!isAdminRedirect && !signupComplete && (
          <div className="pt-2 border-t border-gray-100 text-center space-y-1 text-xs text-gray-500">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-brand-600 hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-brand-600 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="font-bold text-brand-600 hover:underline"
                >
                  Back to Sign In
                </button>
              </p>
            )}
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
