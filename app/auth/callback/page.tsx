'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email address with Supabase Auth...');

  useEffect(() => {
    let isSubscribed = true;

    async function handleAuthVerification() {
      try {
        // Exchange code if PKCE code is in searchParams
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (isSubscribed) {
              setStatus('error');
              setMessage(error.message || 'Failed to verify email link.');
            }
            return;
          }
        }

        // Check active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (isSubscribed) {
            setStatus('error');
            setMessage(sessionError.message);
          }
          return;
        }

        if (session?.user) {
          // Sync confirmed email to public.profiles table
          try {
            await supabase.from('profiles').upsert([
              {
                id: session.user.id,
                auth_user_id: session.user.id,
                email: (session.user.email || '').toLowerCase().trim(),
                name: session.user.user_metadata?.name || '',
                phone: session.user.user_metadata?.phone || '',
                role: 'customer',
                updated_at: new Date().toISOString(),
              },
            ]);
          } catch {
            // ignore
          }

          if (isSubscribed) {
            setStatus('success');
            setMessage('Your email address has been verified successfully!');
            // Auto-redirect to account dashboard
            setTimeout(() => {
              router.replace('/account');
            }, 2500);
          }
        } else {
          // If no session but no error, verification link might have confirmed in background
          if (isSubscribed) {
            setStatus('success');
            setMessage('Your email verification link was processed. Please sign in to continue.');
            setTimeout(() => {
              router.replace('/account/login');
            }, 3000);
          }
        }
      } catch (err: any) {
        if (isSubscribed) {
          setStatus('error');
          setMessage(err?.message || 'Email verification failed. The link may have expired.');
        }
      }
    }

    handleAuthVerification();

    return () => {
      isSubscribed = false;
    };
  }, [router, searchParams]);

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center space-y-6 animate-scaleIn">
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto" />
            <h1 className="text-xl font-black text-navy-950">Confirming Email Verification</h1>
            <p className="text-xs text-gray-500">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                EMAIL VERIFIED
              </span>
              <h1 className="text-2xl font-black text-navy-950">Account Activated!</h1>
              <p className="text-xs text-gray-600 leading-relaxed pt-1">{message}</p>
            </div>
            <p className="text-[11px] text-gray-400">Redirecting to your account dashboard...</p>
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow"
            >
              <span>Go to My Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                VERIFICATION ERROR
              </span>
              <h1 className="text-2xl font-black text-navy-950">Link Expired or Invalid</h1>
              <p className="text-xs text-gray-600 leading-relaxed pt-1">{message}</p>
            </div>
            <div className="pt-2 space-y-2">
              <Link
                href="/account/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs transition"
              >
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
