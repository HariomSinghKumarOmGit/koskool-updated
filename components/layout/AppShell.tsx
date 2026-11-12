'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import AuthModal from '@/components/auth/AuthModal';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <AuthProvider>
      <CartProvider>
        {!isAdminRoute && <Navbar />}
        <main className={`flex-1 ${!isAdminRoute ? '' : 'min-h-screen'}`}>{children}</main>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <CartDrawer />}
        <AuthModal />
      </CartProvider>
    </AuthProvider>
  );
}
