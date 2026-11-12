'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_NAVIGATION, NavItem } from '@/data/navigation';
import MegaMenu from './MegaMenu';
import MobileNav from './MobileNav';
import SearchModal from './SearchModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  ChevronDown,
  Phone,
  Sparkles,
  Award,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, openCartDrawer } = useCart();
  const { user, isAdmin, openAuthModal } = useAuth();

  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-navy-950 text-white text-[11px] sm:text-xs py-2 px-4 border-b border-navy-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center">
            <span className="inline-block bg-brand-600 text-white font-extrabold text-[10px] uppercase px-1.5 py-0.5 rounded tracking-wide">
              KOSKOOL
            </span>
            <span className="font-semibold text-gray-200">
              Aaao School Chale Hum &nbsp;|&nbsp; Quality School &amp; Daily Footwear
            </span>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-amber-300 font-bold transition"
            >
              <span>Admin Panel</span>
            </Link>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px]">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              CBSE &amp; ICSE Uniform Approved
            </span>
            <a
              href="https://wa.me/918130458265"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-300 hover:text-white transition font-medium"
            >
              <Phone className="w-3 h-3 text-brand-400" />
              <span>Bulk &amp; Factory: +91 8130458265</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
        onMouseLeave={() => setActiveMega(null)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-lg text-navy-950 hover:bg-gray-100 transition"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="group flex flex-col items-start select-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-navy-950 group-hover:text-brand-600 transition duration-150">
                    KOSKOOL
                  </span>
                  <span className="w-2 h-2 rounded-full bg-brand-600 inline-block mb-1 group-hover:scale-125 transition"></span>
                </div>
                <span className="text-[10px] tracking-widest font-semibold uppercase text-brand-600 -mt-1 group-hover:text-navy-900 transition">
                  Aaao School Chale Hum
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 h-full">
              {MAIN_NAVIGATION.map((item) => {
                const hasColumns = item.columns && item.columns.length > 0;
                const isActive = pathname.startsWith(item.href) && item.href !== '/';
                const isOpen = activeMega === item.title;

                return (
                  <div
                    key={item.title}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setActiveMega(hasColumns ? item.title : null)}
                  >
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-bold tracking-wider rounded-lg transition duration-150 ${
                        isActive
                          ? 'text-brand-600 bg-brand-50/50'
                          : isOpen
                          ? 'text-brand-600 bg-gray-50'
                          : 'text-navy-950 hover:text-brand-600 hover:bg-gray-50'
                      }`}
                      onClick={() => !hasColumns && setActiveMega(null)}
                    >
                      <span>{item.title}</span>
                      {hasColumns && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-brand-600' : ''
                          }`}
                        />
                      )}
                    </Link>

                    {/* Anchored Dropdown for non-mega menus (e.g. BAGS) */}
                    {!item.isMega && hasColumns && isOpen && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-b-2xl shadow-2xl border border-gray-100 p-6 z-50 animate-fadeIn"
                        style={{ left: '50%', transform: 'translateX(-50%)' }}
                        onMouseEnter={() => setActiveMega(item.title)}
                      >
                        {item.columns!.map((col, idx) => (
                          <div key={idx}>
                            <div className="border-b-2 border-brand-500 pb-2 mb-4">
                              <Link
                                href={col.href || item.href}
                                onClick={() => setActiveMega(null)}
                                className="block text-xs font-black tracking-wider text-navy-950 uppercase hover:text-brand-600 transition"
                              >
                                {col.heading}
                              </Link>
                            </div>

                            <ul className="space-y-3.5 pt-1">
                              {col.items.map((sub, sIdx) => (
                                <li key={sIdx}>
                                  <Link
                                    href={sub.href}
                                    onClick={() => setActiveMega(null)}
                                    className="group flex items-center justify-between text-sm text-gray-700 hover:text-brand-600 transition duration-150 py-0.5"
                                  >
                                    <span className="font-normal group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all">
                                      {sub.title}
                                    </span>
                                    {sub.badge && (
                                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-brand-600">
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
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Action Icons (Search, Account, Cart) */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-full text-navy-900 hover:text-brand-600 hover:bg-gray-100 transition"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Login / Profile */}
              {user ? (
                <Link
                  href={isAdmin ? '/admin' : '/account/login'}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-navy-950 text-xs font-bold transition"
                  aria-label="Account"
                >
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <span className="hidden md:inline max-w-[100px] truncate">
                    {isAdmin ? 'Admin' : user.name.split(' ')[0]}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="p-2.5 rounded-full text-navy-900 hover:text-brand-600 hover:bg-gray-100 transition hidden sm:inline-flex"
                  aria-label="Sign In"
                >
                  <User className="w-5 h-5" />
                </button>
              )}

              {/* Shopping Cart Drawer Trigger */}
              <button
                onClick={openCartDrawer}
                className="relative p-2.5 rounded-full text-navy-900 hover:text-brand-600 hover:bg-gray-100 transition"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-[11px] font-black flex items-center justify-center shadow animate-scaleIn">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menus (Full Width for BOYS, GIRLS, ACCESSORIES) */}
        {MAIN_NAVIGATION.map((item) => {
          if (activeMega === item.title && item.isMega && item.columns) {
            return (
              <MegaMenu
                key={item.title}
                item={item}
                onClose={() => setActiveMega(null)}
              />
            );
          }
          return null;
        })}
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
