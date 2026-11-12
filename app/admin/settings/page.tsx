'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Building,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  HardDrive,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const checkConnection = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.from('products').select('count', { count: 'exact' });
      // If error is PGRST205 (table doesn't exist yet), connection is still reachable!
      if (!error || (error && error.code === 'PGRST205')) {
        setSupabaseConnected(true);
      } else {
        setSupabaseConnected(false);
      }
    } catch {
      setSupabaseConnected(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(`-- KOSKOOL Supabase SQL Schema
-- Run in Supabase Dashboard -> SQL Editor
-- File located at: supabase/schema.sql in project repository`);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-navy-950">System Settings &amp; Architecture</h1>
        <p className="text-xs text-gray-500">
          Manufacturing facility metadata, Supabase credentials, storage buckets, and database sync.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Factory & Brand Profile */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Building className="w-5 h-5 text-brand-600" />
            <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
              Manufacturing Facility Profile
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-gray-500 uppercase text-[10px] block">Brand Name</span>
              <span className="font-black text-navy-950 text-sm">KOSKOOL Footwear</span>
              <p className="text-gray-500 text-[11px]">Motto: &quot;Aaao School Chale Hum&quot;</p>
            </div>

            <div>
              <span className="font-bold text-gray-500 uppercase text-[10px] block">
                Manufacturing Unit
              </span>
              <span className="font-bold text-navy-950">
                Sector 2, Bawana Industrial Area, Delhi
              </span>
              <p className="text-gray-500 text-[11px]">
                Primary production &amp; dispatch hub for school shoes and bags.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-400 text-[10px] block uppercase">
                  Founder &amp; Owner
                </span>
                <span className="font-bold text-navy-950">Vipul Singla</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-400 text-[10px] block uppercase">
                  Institutional Hotline
                </span>
                <span className="font-bold text-navy-950 font-mono">+91 8130458265</span>
              </div>
            </div>

            <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100">
              <span className="font-bold text-brand-900 block">Uniform Standard:</span>
              <p className="text-[11px] text-brand-800 mt-0.5">
                Strict adherence to CBSE, ICSE and State Board uniform footwear specifications with anti-skid rubber soles.
              </p>
            </div>
          </div>
        </div>

        {/* Supabase Connection & Storage Status */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
                Supabase Backend Engine
              </h2>
            </div>
            <button
              onClick={checkConnection}
              disabled={checking}
              className="p-1.5 text-gray-400 hover:text-navy-950 rounded-lg hover:bg-gray-100 transition"
              title="Re-check Connection"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="space-y-0.5">
                <span className="font-bold text-navy-950 block">Project Reference</span>
                <span className="font-mono text-[11px] text-gray-500">srndqucwzvtfsjyagheg</span>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  supabaseConnected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {supabaseConnected ? 'Online & Connected' : 'Checking / Connecting'}
              </span>
            </div>

            <div>
              <span className="font-bold text-gray-500 uppercase text-[10px] block">
                API Endpoint URL
              </span>
              <code className="block bg-gray-100 p-2 rounded-xl font-mono text-[11px] text-navy-950 overflow-x-auto">
                https://srndqucwzvtfsjyagheg.supabase.co
              </code>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-gray-500 uppercase text-[10px] block">
                Supabase Storage Buckets
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-brand-600" />
                    <span className="font-bold text-navy-950">product-images</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">Public</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-navy-950">promotions</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">Public</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Database Migration & SQL Setup */}
        <div className="col-span-full bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
                  Supabase SQL Migration File Ready
                </h2>
                <p className="text-xs text-gray-500">
                  Located in project root: <code className="font-bold">supabase/schema.sql</code>
                </p>
              </div>
            </div>

            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-navy-950 text-xs font-bold transition"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Path Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Reference</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
              <span className="font-bold text-navy-950 block">Step 1: Open SQL Editor</span>
              <p className="text-[11px] text-gray-500">
                Go to your Supabase Dashboard and click <strong>SQL Editor</strong> in the left menu.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
              <span className="font-bold text-navy-950 block">Step 2: Paste Schema</span>
              <p className="text-[11px] text-gray-500">
                Open <code className="bg-white px-1 rounded">supabase/schema.sql</code>, copy its content, and paste it into the editor.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
              <span className="font-bold text-navy-950 block">Step 3: Click Run</span>
              <p className="text-[11px] text-gray-500">
                Click <strong>Run</strong>. All tables, RLS policies, buckets, and promo codes will be created in seconds!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
