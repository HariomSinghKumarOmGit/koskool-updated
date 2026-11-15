'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, removePromoCode } = useCart();
  const { user, isAdmin, openAuthModal } = useAuth();

  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenMenu = () => setIsMobileMenuOpen(true);
    const handleOpenSearch = () => setIsSearchOpen(true);

    window.addEventListener('koskool_open_mobile_menu', handleOpenMenu);
    window.addEventListener('koskool_open_search', handleOpenSearch);

    return () => {
      window.removeEventListener('koskool_open_mobile_menu', handleOpenMenu);
      window.removeEventListener('koskool_open_search', handleOpenSearch);
    };
  }, []);

  return (
    <>
      {/* Main Sticky Header */}
      <header
        className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl backdrop-saturate-150 border-b border-white/40 shadow-xs w-full max-w-full transition-colors duration-200"
        onMouseLeave={() => setActiveMega(null)}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-1 rounded-lg text-navy-950 hover:bg-gray-100 active:bg-gray-200 transition"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="group flex flex-col items-start select-none py-1">
                <div className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="KOSKOOL"
                    width={150}
                    height={46}
                    priority
                    className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <span className="text-[8px] sm:text-[9.5px] tracking-widest font-bold uppercase text-brand-600 group-hover:text-navy-900 transition mt-0.5 pl-0.5 select-none">
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
                  href={isAdmin ? '/admin' : '/account'}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-navy-950 text-xs font-bold transition"
                  aria-label="Account"
                >
                  <User className="w-3.5 h-3.5 text-brand-600" />
                  <span className="hidden md:inline max-w-[100px] truncate">
                    {user.name ? user.name.split(' ')[0] : 'Account'}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-navy-950 text-xs font-bold transition"
                  aria-label="Account"
                >
                  <User className="w-3.5 h-3.5 text-navy-600" />
                  <span className="hidden md:inline">Account</span>
                </Link>
              )}

              {/* Shopping Cart Trigger */}
              <Link
                href="/cart"
                onClick={() => {
                  removePromoCode();
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('reset_cart_promocode'));
                  }
                }}
                className="relative p-2 sm:p-2.5 rounded-full text-navy-900 hover:text-brand-600 hover:bg-gray-100 transition"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[10px] sm:text-[11px] font-black flex items-center justify-center shadow animate-scaleIn">
                    {totalItems}
                  </span>
                )}
              </Link>
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
