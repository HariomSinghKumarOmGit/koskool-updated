'use client';

import React, { useState } from 'react';
import { useAuth, AuthModalMode } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  User,
  Phone,
  X,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    signup,
    resendVerificationEmail,
    resetPassword,
    authModalMode,
    setAuthModalMode,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);

  const router = useRouter();

  if (!isAuthModalOpen) return null;

  const handleModeChange = (mode: AuthModalMode) => {
    setAuthModalMode(mode);
    setError('');
    setSuccessMsg('');
    setIsUnverified(false);
    setSignupComplete(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to sign in');
          if (res.unverified) {
            setIsUnverified(true);
          }
        } else if (res.role === 'admin') {
          closeAuthModal();
          router.push('/admin');
        } else {
          closeAuthModal();
        }
      } else if (authModalMode === 'signup') {
        const res = await signup(email, password, name, phone);
        if (!res.success) {
          setError(res.error || 'Failed to create account');
        } else {
          setSignupComplete(true);
          setSuccessMsg('Account created! A mandatory verification email has been sent to ' + email + '.');
        }
      } else if (authModalMode === 'forgot_password') {
        const res = await resetPassword(email);
        if (!res.success) {
          setError(res.error || 'Failed to send reset link');
        } else {
          setSuccessMsg('Password reset instructions have been sent to ' + email + '. Please check your inbox.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your registered email address first.');
      return;
    }
    setResending(true);
    setError('');
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        setSuccessMsg('Verification email resent! Please check your inbox and spam folder.');
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
            {signupComplete
              ? 'Verify Your Email'
              : authModalMode === 'login'
              ? 'Sign In to KOSKOOL'
              : authModalMode === 'signup'
              ? 'Create Student / Parent Account'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-gray-500">
            {signupComplete
              ? 'A confirmation link has been sent to activate your account.'
              : authModalMode === 'login'
              ? 'Sign in to access saved addresses, track uniform orders, and complete checkout.'
              : authModalMode === 'signup'
              ? 'Email verification is mandatory before placing orders.'
              : 'Enter your account email to receive secure password recovery instructions.'}
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
                  onClick={handleResendVerification}
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
              <h3 className="text-sm font-black text-navy-950">Check Your Inbox</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We sent a verification link to <strong className="text-navy-950">{email}</strong>. Click the link in your email to activate your account.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] font-medium">
              Important: You must verify your email address before logging in or completing your checkout.
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-navy-950 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resending ? 'Sending...' : 'Resend Verification Email'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="w-full py-2.5 px-4 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs transition"
              >
                I have verified, Sign In now
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalMode === 'signup' && (
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
                      placeholder="Parent or Student Full Name"
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

            {authModalMode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Password *</label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleModeChange('forgot_password')}
                      className="text-[11px] font-bold text-brand-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>
                {loading
                  ? 'Please wait...'
                  : authModalMode === 'login'
                  ? 'Sign In & Continue'
                  : authModalMode === 'signup'
                  ? 'Create Verified Account'
                  : 'Send Reset Instructions'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer navigation */}
        <div className="pt-2 border-t border-gray-100 text-center space-y-1">
          {authModalMode === 'login' && (
            <p className="text-xs text-gray-500">
              Don&apos;t have an account yet?
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                className="ml-1.5 font-bold text-brand-600 hover:underline"
              >
                Sign Up here
              </button>
            </p>
          )}

          {authModalMode === 'signup' && (
            <p className="text-xs text-gray-500">
              Already registered?
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="ml-1.5 font-bold text-brand-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}

          {authModalMode === 'forgot_password' && (
            <p className="text-xs text-gray-500">
              Remembered your credentials?
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="ml-1.5 font-bold text-brand-600 hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
