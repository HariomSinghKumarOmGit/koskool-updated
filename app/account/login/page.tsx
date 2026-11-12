'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-navy-950 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
            K
          </div>
          <h1 className="text-2xl font-black text-navy-950">
            {isLogin ? 'Sign In to KOSKOOL' : 'Create School Account'}
          </h1>
          <p className="text-xs text-gray-500">
            Manage school orders, track dispatches, and save sizes for quick reorders.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 animate-fadeIn">
            <h3 className="text-sm font-bold text-emerald-800">Welcome to KOSKOOL!</h3>
            <p className="text-xs text-emerald-700">You are successfully signed in with {email}.</p>
            <Link
              href="/"
              className="inline-block mt-2 bg-navy-950 text-white text-xs font-bold px-5 py-2 rounded-xl"
            >
              Go to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Parent / Student Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-gray-100 text-xs">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setSubmitted(false);
            }}
            className="text-brand-600 hover:underline font-semibold"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
