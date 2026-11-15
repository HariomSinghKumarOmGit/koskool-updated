'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MAIN_NAVIGATION } from '@/data/navigation';
import { X, ChevronDown, ChevronRight, Phone, Mail, MapPin, ExternalLink, User, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { user, isAdmin, openAuthModal } = useAuth();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [nestedExpanded, setNestedExpanded] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleMain = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
    setNestedExpanded(null);
  };

  const toggleSub = (key: string) => {
    setNestedExpanded(nestedExpanded === key ? null : key);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-[85vw] sm:max-w-sm bg-white h-full flex flex-col shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-navy-950 text-white">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-circle.png"
              alt="KOSKOOL"
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-contain shadow shrink-0"
            />
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">KOSKOOL</span>
              <p className="text-[10px] text-gray-300 -mt-1">Aaao School Chale Hum</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-gray-100">
          {MAIN_NAVIGATION.map((item, idx) => {
            const hasSub = !!item.columns && item.columns.length > 0;
            const isExpanded = expandedIndex === idx;

            return (
              <div key={idx} className="px-4 py-2">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (!hasSub) onClose();
                    }}
                    className="font-bold text-base text-navy-950 py-2 hover:text-brand-600 transition tracking-wide flex-1"
                  >
                    {item.title}
                  </Link>

                  {hasSub && (
                    <button
                      onClick={() => toggleMain(idx)}
                      className="p-2 text-gray-500 hover:text-brand-600 rounded-lg hover:bg-gray-100 transition"
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-brand-600' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Submenu Accordion */}
                {hasSub && isExpanded && (
                  <div className="pl-3 pr-1 py-2 space-y-3 bg-gray-50 rounded-xl my-1 border border-gray-100 animate-fadeIn">
                    {item.columns!.map((col, cIdx) => {
                      const nestedKey = `${idx}-${cIdx}`;
                      const isNestedOpen = nestedExpanded === nestedKey;

                      return (
                        <div key={cIdx} className="space-y-1">
                          <button
                            onClick={() => toggleSub(nestedKey)}
                            className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-navy-900 py-1.5 px-2 rounded-md hover:bg-gray-200/60 transition"
                          >
                            <span>{col.heading}</span>
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                                isNestedOpen ? 'rotate-90 text-brand-600' : ''
                              }`}
                            />
                          </button>

                          {isNestedOpen && (
                            <ul className="pl-4 pr-1 py-1 space-y-1.5 border-l-2 border-brand-500 ml-2 animate-fadeIn">
                              {col.items.map((sub, sIdx) => (
                                <li key={sIdx}>
                                  <Link
                                    href={sub.href}
                                    onClick={onClose}
                                    className="flex items-center justify-between text-sm text-gray-700 py-1.5 hover:text-brand-600 transition"
                                  >
                                    <span>{sub.title}</span>
                                    {sub.badge && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">
                                        {sub.badge}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Account & Quick Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
          {user ? (
            <Link
              href={isAdmin ? '/admin' : '/account'}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-navy-950 text-white font-bold transition"
            >
              <User className="w-3.5 h-3.5 text-brand-500" />
              <span className="truncate">{isAdmin ? 'Control Panel' : 'My Account'}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-navy-950 text-white font-bold transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <Link
            href="/track-order"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-navy-950 font-bold transition"
          >
            <Truck className="w-3.5 h-3.5 text-brand-600" />
            <span>Track Order</span>
          </Link>
        </div>

        {/* Footer info in drawer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2 text-xs text-gray-600">
          <div className="flex items-start gap-2 text-navy-900 font-semibold">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <a
              href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-600 transition inline-flex items-center gap-1"
            >
              <span>Factory: Sector 2, Bawana Ind. Area, Delhi</span>
              <ExternalLink className="w-3 h-3 text-brand-600" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-brand-600 shrink-0" />
            <a href="tel:+918130458265" className="hover:underline text-navy-900 font-medium">
              +91 8130458265 (Vipul Singla)
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-600 shrink-0" />
            <a href="mailto:Koskoolshoes@gmail.com" className="hover:underline">
              Koskoolshoes@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
