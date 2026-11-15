'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Home, LayoutGrid, Search, ShoppingBag, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, removePromoCode } = useCart();
  const { user, isAdmin, openAuthModal } = useAuth();

  const handleOpenCategories = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('koskool_open_mobile_menu'));
  };

  const handleOpenSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('koskool_open_search'));
  };

  const handleOpenAccount = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
    }
  };

  const isHome = pathname === '/';
  const isCollections = pathname?.startsWith('/collections');
  const isCart = pathname === '/cart';
  const isAccount = pathname?.startsWith('/account') || pathname?.startsWith('/admin');

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-t border-white/50 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] md:hidden safe-area-bottom w-full max-w-full overflow-hidden"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors select-none ${
            isHome ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-navy-900 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* Categories / Menu */}
        <button
          type="button"
          onClick={handleOpenCategories}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors select-none ${
            isCollections ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-navy-900 font-medium'
          }`}
          aria-label="Browse Categories"
        >
          <LayoutGrid className={`w-5 h-5 ${isCollections ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight">Categories</span>
        </button>

        {/* Search */}
        <button
          type="button"
          onClick={handleOpenSearch}
          className="flex flex-col items-center justify-center gap-1 py-1 text-gray-500 hover:text-navy-900 transition-colors select-none font-medium"
          aria-label="Search Catalog"
        >
          <Search className="w-5 h-5 stroke-2" />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

        {/* Cart */}
        <Link
          href="/cart"
          onClick={() => {
            removePromoCode();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('reset_cart_promocode'));
            }
          }}
          className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-colors select-none ${
            isCart ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-navy-900 font-medium'
          }`}
          aria-label="View Shopping Cart"
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${isCart ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[17px] h-[17px] px-0.5 rounded-full bg-brand-600 text-white text-[9.5px] font-black flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </Link>

        {/* Account */}
        <Link
          href={isAdmin ? '/admin' : '/account'}
          className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors select-none ${
            isAccount ? 'text-brand-600 font-bold' : 'text-gray-500 hover:text-navy-900 font-medium'
          }`}
          aria-label="User Account"
        >
          <User className={`w-5 h-5 ${isAccount ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight truncate max-w-[60px]">
            {user ? (user.name ? user.name.split(' ')[0] : 'Account') : 'Account'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
