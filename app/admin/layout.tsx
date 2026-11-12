'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  Lock,
  Truck,
  MessageSquare,
  TicketPercent,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const NAVIGATION: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Layers },
  { name: 'Promotional Board', href: '/admin/banners', icon: ImageIcon },
  { name: 'Hero Section (Locked)', href: '/admin/hero', icon: Lock },
  { name: 'Deliveries / Orders', href: '/admin/orders', icon: Truck },
  { name: 'Messages & Quotes', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Promo Codes', href: '/admin/promo-codes', icon: TicketPercent },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on admin/login, do not wrap with sidebar
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoading && !isAdmin && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-950 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Loading KOSKOOL Admin...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-navy-950 text-white px-4 py-3 flex items-center justify-between border-b border-navy-900 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-black flex items-center justify-center text-sm shadow">
            K
          </div>
          <div>
            <span className="font-black text-sm tracking-wider block">KOSKOOL</span>
            <span className="text-[9px] text-gray-400 block -mt-0.5">Admin Management</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-navy-900 transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-950 text-gray-300 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Store Header */}
          <div className="p-6 border-b border-navy-900">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black flex items-center justify-center text-lg shadow-lg shadow-brand-600/30 shrink-0">
                K
              </div>
              <div>
                <span className="font-black text-base text-white tracking-wider block">
                  KOSKOOL
                </span>
                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-widest block">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-500">
              Navigation
            </div>
            {NAVIGATION.map((item) => {
              const isActive =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-navy-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-navy-900 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-4 border-t border-navy-900 space-y-3">
          <div className="p-3 bg-navy-900/60 rounded-xl border border-navy-800/80 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-bold text-white block truncate">
                {user?.name || 'Vipul Singla'}
              </span>
              <span className="text-[10px] text-gray-400 block font-mono truncate">
                {user?.email || 'admin@gmail.com'}
              </span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" title="Online" />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-gray-300 hover:text-white text-xs font-bold transition border border-navy-800"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold transition border border-red-800/40"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
