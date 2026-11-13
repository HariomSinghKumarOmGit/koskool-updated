'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Layers,
  Truck,
  MessageSquare,
  TicketPercent,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { getDashboardMetrics, Order } from '@/services/api';
import { Product } from '@/data/products';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/30 text-brand-300 text-[11px] font-black uppercase tracking-wider border border-brand-500/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            Live Supabase Connected
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            KOSKOOL Admin Dashboard
          </h1>
          <p className="text-xs text-gray-300 max-w-xl">
            Managing products, categories, factory deliveries, customer messages &amp; dynamic promo codes for Bawana Industrial Area manufacturing unit.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-3 rounded-2xl border border-white/10 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>

        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Products */}
        <Link
          href="/admin/products"
          className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-navy-950">
            {loading ? '...' : metrics?.totalProducts || 0}
          </div>
          <p className="text-[11px] text-gray-500">Live in catalogue &amp; Supabase</p>
        </Link>

        {/* Categories */}
        <Link
          href="/admin/categories"
          className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-navy-950">
            {loading ? '...' : metrics?.totalCategories || 0}
          </div>
          <p className="text-[11px] text-gray-500">Organized product taxonomy</p>
        </Link>

        {/* Deliveries / Orders */}
        <Link
          href="/admin/orders"
          className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Deliveries / Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-navy-950">
              {loading ? '...' : metrics?.totalOrders || 0}
            </span>
            {metrics?.pendingOrders > 0 && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {metrics.pendingOrders} pending
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500">Factory dispatches from Bawana</p>
        </Link>

        {/* Messages & Quotes */}
        <Link
          href="/admin/inquiries"
          className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Customer Quotes
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-navy-950">
              {loading ? '...' : metrics?.totalInquiries || 0}
            </span>
            {metrics?.unreadInquiries > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {metrics.unreadInquiries} unread
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500">School inquiries &amp; exchanges</p>
        </Link>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
          Quick Management Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/homepage"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-50 hover:bg-brand-100 transition border border-brand-200 font-bold text-xs text-brand-950"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <span>Homepage Order &amp; Prices</span>
          </Link>

          <Link
            href="/admin/hero"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition border border-indigo-200 font-bold text-xs text-indigo-950"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Hero Slides</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition border border-gray-200 font-bold text-xs text-navy-950"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <span>Products</span>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition border border-gray-200 font-bold text-xs text-navy-950"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <span>Categories</span>
          </Link>

          <Link
            href="/admin/banners"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition border border-gray-200 font-bold text-xs text-navy-950"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span>Promo Banners</span>
          </Link>

          <Link
            href="/admin/promo-codes"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 transition border border-gray-200 font-bold text-xs text-navy-950"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <TicketPercent className="w-4 h-4" />
            </div>
            <span>Promo Codes</span>
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Deliveries / Orders (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
                Recent Factory Deliveries
              </h2>
              <p className="text-[11px] text-gray-500">Live customer purchase and dispatch requests</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
              metrics.recentOrders.map((ord: Order) => (
                <div key={ord.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-navy-950">
                        {ord.order_number}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          ord.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'Shipped'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {ord.customer_name} • {ord.city}, {ord.state}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-navy-950 block">
                      ₹{ord.total_amount}
                    </span>
                    <span className="text-[10px] uppercase text-gray-500">
                      {ord.payment_method}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No orders yet.</p>
            )}
          </div>
        </div>

        {/* Recently Added Products (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
                Catalogue Highlights
              </h2>
              <p className="text-[11px] text-gray-500">Recently updated school uniform footwear</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {metrics?.recentProducts && metrics.recentProducts.length > 0 ? (
              metrics.recentProducts.map((p: Product) => (
                <div key={p.id} className="py-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100 shrink-0">
                    <Image
                      src={p.images[0] || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                      alt={p.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-navy-950 truncate">{p.name}</h4>
                    <p className="text-[10px] text-gray-500 capitalize">
                      {p.gender} • {p.productType.replace('-', ' ')}
                    </p>
                  </div>
                  <span className="text-xs font-black text-navy-950">₹{p.price}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No products found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
