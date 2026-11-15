'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MAIN_NAVIGATION } from '@/data/navigation';
import {
  X,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  User,
  Truck,
  Search,
  Sparkles,
  GraduationCap,
  Backpack,
  Package,
  Info,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { user, isAdmin, openAuthModal } = useAuth();

  // Animation states for smooth app-like entrance and exit
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Accordion state: which main category is open (BOYS, GIRLS, etc.)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  // Nested subcategory accordion (for Accessories sub-groups)
  const [nestedExpanded, setNestedExpanded] = useState<string | null>(null);

  // Handle drawer mount/unmount and smooth slide transition
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Small tick for CSS transition to trigger after mount
      const animTimer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(animTimer);
    } else {
      setIsVisible(false);
      const unmountTimer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(unmountTimer);
    }
  }, [isOpen]);

  // Lock background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Open search modal from inside drawer
  const handleOpenSearch = () => {
    onClose();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('koskool_open_search'));
    }, 150);
  };

  const toggleMain = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
    setNestedExpanded(null);
  };

  const toggleSub = (key: string) => {
    setNestedExpanded((prev) => (prev === key ? null : key));
  };

  // Helper to get category icon
  const getCategoryIcon = (title: string) => {
    switch (title.toUpperCase()) {
      case 'BOYS':
        return <GraduationCap className="w-5 h-5 text-brand-600" />;
      case 'GIRLS':
        return <Sparkles className="w-5 h-5 text-rose-500" />;
      case 'ACCESSORIES':
        return <Package className="w-5 h-5 text-amber-500" />;
      case 'BAGS':
        return <Backpack className="w-5 h-5 text-blue-600" />;
      case 'ABOUT':
        return <Info className="w-5 h-5 text-teal-600" />;
      default:
        return null;
    }
  };

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
        isVisible ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop with smooth blur and fade */}
      <div
        className={`fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className={`relative w-[86vw] max-w-sm bg-white h-full flex flex-col shadow-2xl z-10 overflow-hidden transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white border-b border-navy-800 shrink-0">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5 active:opacity-80 transition"
          >
            <div className="relative w-9 h-9 rounded-full bg-white/10 p-0.5 border border-white/20 shadow-sm overflow-hidden shrink-0">
              <Image
                src="/logo-circle.png"
                alt="KOSKOOL"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">KOSKOOL</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-brand-600 text-white tracking-widest">
                  APP
                </span>
              </div>
              <p className="text-[10px] text-gray-300 tracking-wide">Aaao School Chale Hum</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 transition"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={handleOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white border border-gray-200/80 text-gray-400 hover:text-gray-600 hover:border-gray-300 shadow-2xs active:bg-gray-50 transition text-left"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span>Search shoes, bags, PT kit...</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
              Search
            </span>
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-gray-100">
          {/* Main Navigation Accordion List */}
          <div className="py-2">
            {MAIN_NAVIGATION.map((item, idx) => {
              const hasSub = !!item.columns && item.columns.length > 0;
              const isExpanded = expandedIndex === idx;
              const isActive = pathname.startsWith(item.href) && item.href !== '/';
              const isBags = item.title.toUpperCase() === 'BAGS';
              const isAccessories = item.title.toUpperCase() === 'ACCESSORIES';
              const isFootwear = item.title.toUpperCase() === 'BOYS' || item.title.toUpperCase() === 'GIRLS';

              return (
                <div key={idx} className="transition-colors">
                  {/* Category Row */}
                  {hasSub ? (
                    <button
                      type="button"
                      onClick={() => toggleMain(idx)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition select-none active:bg-gray-100 ${
                        isExpanded
                          ? 'bg-red-50/40 text-brand-700'
                          : isActive
                          ? 'text-brand-600 bg-gray-50/70 font-bold'
                          : 'text-navy-950 hover:bg-gray-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isExpanded
                              ? 'bg-brand-100/70 text-brand-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {getCategoryIcon(item.title)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                            {item.title}
                          </span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.title === 'BOYS' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-200/50">
                            Popular
                          </span>
                        )}
                        {item.title === 'BAGS' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/50">
                            Session 2026
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-brand-600' : ''
                          }`}
                        />
                      </div>
                    </button>
                  ) : (
                    /* Simple Link for items without subcategories (e.g. ABOUT) */
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`w-full flex items-center justify-between px-4 py-3.5 transition select-none active:bg-gray-100 ${
                        isActive ? 'text-brand-600 bg-brand-50/50 font-bold' : 'text-navy-950 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                          {getCategoryIcon(item.title)}
                        </div>
                        <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                          {item.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  )}

                  {/* Submenu Accordion Body */}
                  {hasSub && isExpanded && (
                    <div className="px-3 pb-3 pt-1 space-y-3 bg-gray-50/80 border-y border-gray-100 animate-fadeIn">
                      {/* Top Action: View All in this Category */}
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs hover:border-brand-300 text-brand-600 hover:text-brand-700 font-bold text-xs transition group"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Explore All {item.title}</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            (Full Collection)
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      {/* Case 1: FOOTWEAR (BOYS & GIRLS) - Clean grouped categories */}
                      {isFootwear && (
                        <div className="space-y-2.5">
                          {item.columns!.map((col, cIdx) => (
                            <div
                              key={cIdx}
                              className="bg-white rounded-xl p-3 border border-gray-100 shadow-2xs space-y-2"
                            >
                              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                                <span className="text-xs font-black uppercase tracking-wider text-navy-950">
                                  {col.heading}
                                </span>
                                {col.href && (
                                  <Link
                                    href={col.href}
                                    onClick={onClose}
                                    className="text-[10px] font-bold text-brand-600 hover:underline"
                                  >
                                    View All →
                                  </Link>
                                )}
                              </div>

                              {/* Wings chips: Kindergarten, Middle Wing, Senior Wing */}
                              <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                                {col.items.map((sub, sIdx) => (
                                  <Link
                                    key={sIdx}
                                    href={sub.href}
                                    onClick={onClose}
                                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50/50 active:bg-brand-100/50 transition border border-transparent hover:border-brand-100"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                      <span>{sub.title}</span>
                                    </div>
                                    {sub.badge && (
                                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200/40">
                                        {sub.badge}
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Case 2: BAGS - Direct list without nested accordion maze */}
                      {isBags && (
                        <div className="bg-white rounded-xl p-2 border border-gray-100 shadow-2xs divide-y divide-gray-100">
                          {item.columns![0]?.items.map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              href={sub.href}
                              onClick={onClose}
                              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-800 hover:text-brand-600 hover:bg-gray-50 active:bg-gray-100 transition"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span>{sub.title}</span>
                              </div>
                              {sub.badge && (
                                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/50">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Case 3: ACCESSORIES - Grouped by Boys, Girls, Kids */}
                      {isAccessories && (
                        <div className="space-y-2">
                          {item.columns!.map((col, cIdx) => {
                            const nestedKey = `${idx}-${cIdx}`;
                            const isNestedOpen = nestedExpanded === nestedKey;

                            return (
                              <div
                                key={cIdx}
                                className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-2xs"
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleSub(nestedKey)}
                                  className="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-navy-950 hover:bg-gray-50 active:bg-gray-100 transition"
                                >
                                  <span>{col.heading}</span>
                                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <span>{col.items.length} items</span>
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                        isNestedOpen ? 'rotate-180 text-brand-600' : ''
                                      }`}
                                    />
                                  </div>
                                </button>

                                {isNestedOpen && (
                                  <div className="px-3 pb-2.5 pt-1 border-t border-gray-100 bg-gray-50/50 space-y-1 animate-fadeIn">
                                    {col.items.map((sub, sIdx) => (
                                      <Link
                                        key={sIdx}
                                        href={sub.href}
                                        onClick={onClose}
                                        className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs text-gray-700 hover:text-brand-600 hover:bg-white transition"
                                      >
                                        <span>{sub.title}</span>
                                        {sub.badge && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-600">
                                            {sub.badge}
                                          </span>
                                        )}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Shop By School Wing Section */}
          <div className="px-4 py-3 bg-gray-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Shop By School Wing
              </span>
              <span className="text-[10px] text-brand-600 font-semibold">Classes Nursery - 12</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Link
                href="/collections/kindergarten"
                onClick={onClose}
                className="py-2 px-1.5 rounded-xl bg-white border border-gray-200/80 text-center hover:border-orange-300 active:scale-95 transition shadow-2xs"
              >
                <span className="block text-[11px] font-extrabold text-navy-950">Kindergarten</span>
                <span className="text-[9px] text-gray-500">Nursery &amp; KG</span>
              </Link>
              <Link
                href="/collections/middle-wing"
                onClick={onClose}
                className="py-2 px-1.5 rounded-xl bg-white border border-gray-200/80 text-center hover:border-blue-300 active:scale-95 transition shadow-2xs"
              >
                <span className="block text-[11px] font-extrabold text-navy-950">Middle Wing</span>
                <span className="text-[9px] text-gray-500">Classes 1 - 8</span>
              </Link>
              <Link
                href="/collections/senior-wing"
                onClick={onClose}
                className="py-2 px-1.5 rounded-xl bg-white border border-gray-200/80 text-center hover:border-emerald-300 active:scale-95 transition shadow-2xs"
              >
                <span className="block text-[11px] font-extrabold text-navy-950">Senior Wing</span>
                <span className="text-[9px] text-gray-500">Classes 9 - 12</span>
              </Link>
            </div>
          </div>

          {/* School Uniform Compliance Trust Card */}
          <div className="px-4 py-3">
            <div className="p-3 rounded-xl bg-brand-50/50 border border-brand-100 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-navy-950 block">100% School Uniform Compliant</span>
                <p className="text-[10.5px] text-gray-600 mt-0.5 leading-snug">
                  Manufactured to strict school dress codes: PT white, uniform black, durable non-marking soles.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Account & Quick Actions Footer Bar */}
        <div className="p-3 bg-gray-50 border-t border-gray-200/80 shrink-0 grid grid-cols-2 gap-2 text-xs">
          {user ? (
            <Link
              href={isAdmin ? '/admin' : '/account'}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-navy-950 hover:bg-navy-900 active:scale-98 text-white font-bold transition shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-brand-400" />
              <span className="truncate">{isAdmin ? 'Admin Panel' : 'My Account'}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-navy-950 hover:bg-navy-900 active:scale-98 text-white font-bold transition shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Login</span>
            </Link>
          )}

          <Link
            href="/track-order"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 active:scale-98 text-navy-950 font-bold transition shadow-2xs"
          >
            <Truck className="w-3.5 h-3.5 text-brand-600" />
            <span>Track Order</span>
          </Link>
        </div>

        {/* Customer Help & WhatsApp Contact (App-style bottom dock) */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0 space-y-2 safe-area-bottom">
          {/* Direct WhatsApp Assistance Button */}
          <a
            href="https://wa.me/918130458265?text=Hello%20Koskool%2C%20I%20need%20help%20with%20school%20shoes%20sizing%20or%20bulk%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold transition shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp Support (9 AM - 7 PM)</span>
          </a>

          {/* Quick factory location & call info */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 px-1">
            <a
              href="tel:+918130458265"
              className="flex items-center gap-1 hover:text-brand-600 font-medium transition"
            >
              <Phone className="w-3 h-3 text-brand-600" />
              <span>+91 8130458265</span>
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-brand-600 font-medium transition"
            >
              <MapPin className="w-3 h-3 text-brand-600" />
              <span>Bawana Factory</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
