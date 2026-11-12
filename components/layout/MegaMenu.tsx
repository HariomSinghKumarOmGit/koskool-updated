'use client';

import React from 'react';
import Link from 'next/link';
import { NavItem } from '@/data/navigation';
import { ChevronRight, ShieldCheck } from 'lucide-react';

interface MegaMenuProps {
  item: NavItem;
  onClose: () => void;
}

export default function MegaMenu({ item, onClose }: MegaMenuProps) {
  if (!item.columns || item.columns.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-2xl transition-all duration-200 z-50 w-full animate-fadeIn">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main columns */}
          <div className="col-span-8 lg:col-span-9 grid grid-cols-3 gap-8">
            {item.columns.map((col, idx) => (
              <div key={idx} className="space-y-3">
                {col.href ? (
                  <Link
                    href={col.href}
                    onClick={onClose}
                    className="group inline-flex items-center text-sm font-bold tracking-wider text-navy-900 uppercase border-b-2 border-brand-500 pb-1.5 hover:text-brand-600 transition"
                  >
                    <span>{col.heading}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1 text-gray-400 group-hover:translate-x-0.5 transition" />
                  </Link>
                ) : (
                  <h3 className="text-xs font-bold tracking-wider text-navy-900 uppercase border-b-2 border-brand-500 pb-1.5">
                    {col.heading}
                  </h3>
                )}

                <ul className="space-y-2 pt-1">
                  {col.items.map((sub, sIdx) => (
                    <li key={sIdx}>
                      <Link
                        href={sub.href}
                        onClick={onClose}
                        className="group flex items-center justify-between text-sm text-gray-600 hover:text-brand-600 hover:translate-x-1 transition duration-150 py-1"
                      >
                        <span className="group-hover:font-medium">{sub.title}</span>
                        {sub.badge && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              sub.badge === 'Popular'
                                ? 'bg-amber-100 text-amber-800'
                                : sub.badge === 'PT Approved'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-50 text-brand-600'
                            }`}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right Banner / School Uniform Highlight */}
          <div className="col-span-4 lg:col-span-3 bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-inner">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-brand-500/20 text-brand-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                CBSE / ICSE Ready
              </div>
              <h4 className="text-base font-bold text-white leading-tight">
                {item.title === 'BOYS' && "Boys' Heavy Duty School Soles"}
                {item.title === 'GIRLS' && "Girls' Elegant & Anti-Bite Shoes"}
                {item.title === 'ACCESSORIES' && "Complete School Gear Essentials"}
              </h4>
              <p className="text-xs text-gray-300 line-clamp-3">
                Tested for 1,000+ school hours. All-weather water resistance and orthopedic arch comfort.
              </p>
            </div>

            <div className="relative z-10 pt-4">
              <Link
                href={item.href}
                onClick={onClose}
                className="inline-flex items-center justify-center w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow transition"
              >
                View All {item.title}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Background Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-600/20 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
