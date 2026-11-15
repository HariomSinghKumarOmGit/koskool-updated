'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Product, PRODUCTS } from '@/data/products';
import { PromoCode, INITIAL_PROMO_CODES } from '@/data/promocodes';
import { getPromoCodes } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColour?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, colour?: string, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  finalTotal: number;
  freeShippingThreshold: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  // Promo code system (admin-controlled)
  promoCodes: PromoCode[];
  appliedPromo: PromoCode | null;
  applyPromoCode: (codeStr: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usageCount' | 'createdAt'>) => void;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
  deletePromoCode: (id: string) => void;
  togglePromoCodeStatus: (id: string) => void;
  resetPromoCodesToDefaults: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  // Cart is initially empty when opening the web for the first time
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const isInitializedRef = useRef(false);
  const lastSyncedUserRef = useRef<string | null>(null);

  // Helper to load promo codes from localStorage syncing with koskool_promos_cache
  const loadStoredPromos = (): PromoCode[] => {
    try {
      // Check primary cache first
      const apiCache = localStorage.getItem('koskool_promos_cache');
      const standardCache = localStorage.getItem('koskool_promocodes');

      if (apiCache) {
        const parsed = JSON.parse(apiCache);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => {
            const maxCap = p.max_discount_amount !== undefined && p.max_discount_amount !== null
              ? (Number(p.max_discount_amount) > 0 ? Number(p.max_discount_amount) : undefined)
              : (p.maxDiscount !== undefined && p.maxDiscount !== null && Number(p.maxDiscount) > 0 ? Number(p.maxDiscount) : undefined);

            const minVal = p.min_order_amount !== undefined && p.min_order_amount !== null
              ? Number(p.min_order_amount)
              : Number(p.minOrderValue || 0);

            return {
              id: p.id || `pr-${Math.random()}`,
              code: (p.code || '').toUpperCase().trim(),
              discountType: (p.discount_type || p.discountType || 'percentage') as 'percentage' | 'fixed',
              discountValue: Number(p.discount_value !== undefined ? p.discount_value : p.discountValue || 10),
              minOrderValue: minVal,
              maxDiscount: maxCap,
              description: p.description || '',
              isActive: p.is_active !== undefined ? Boolean(p.is_active) : (p.isActive !== undefined ? Boolean(p.isActive) : true),
              usageCount: Number(p.usage_count || p.usageCount || 0),
              createdAt: p.created_at || '2026-01-01',
            };
          });
        }
      }

      if (standardCache) {
        const parsed = JSON.parse(standardCache);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            code: (p.code || '').toUpperCase().trim(),
            minOrderValue: Number(p.minOrderValue || p.min_order_amount || 0),
            maxDiscount: p.maxDiscount && Number(p.maxDiscount) > 0 ? Number(p.maxDiscount) : undefined,
          }));
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_PROMO_CODES;
  };

  // Load cart and promo codes from localStorage on mount (cart is empty if not stored)
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('koskool_cart');
      const hasCleared = localStorage.getItem('koskool_cart_cleared') === 'true';
      let loadedItems: CartItem[] = [];

      if (savedCart && !hasCleared) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          loadedItems = parsed;
        }
      }

      // Empty by default for first-time visitors
      setItems(loadedItems);

      const loadedPromos = loadStoredPromos();
      setPromoCodes(loadedPromos);

      // If opening directly on /cart, reset promo code section
      if (typeof window !== 'undefined' && window.location.pathname === '/cart') {
        localStorage.removeItem('koskool_applied_promo');
        setAppliedPromo(null);
      } else {
        const savedApplied = localStorage.getItem('koskool_applied_promo');
        if (savedApplied) {
          setAppliedPromo(JSON.parse(savedApplied));
        }
      }
    } catch {
      // ignore
    }

    // Also fetch latest promo codes directly from API / Supabase
    getPromoCodes().then((dbPromos) => {
      if (dbPromos && dbPromos.length > 0) {
        const mapped: PromoCode[] = dbPromos.map((p) => ({
          id: p.id,
          code: p.code.toUpperCase().trim(),
          discountType: p.discount_type,
          discountValue: Number(p.discount_value),
          minOrderValue: Number(p.min_order_amount || 0),
          maxDiscount: p.max_discount_amount && Number(p.max_discount_amount) > 0 ? Number(p.max_discount_amount) : undefined,
          description: p.description || '',
          isActive: Boolean(p.is_active),
          usageCount: Number(p.usage_count || 0),
          createdAt: (p as any).created_at || '2026-01-01',
        }));
        setPromoCodes(mapped);
      }
      isInitializedRef.current = true;
    }).catch(() => {
      isInitializedRef.current = true;
    });

    const handlePromosSync = () => {
      const fresh = loadStoredPromos();
      setPromoCodes(fresh);
    };

    window.addEventListener('koskool_promos_updated', handlePromosSync);
    window.addEventListener('koskool_data_updated', handlePromosSync);
    window.addEventListener('storage', handlePromosSync);

    return () => {
      window.removeEventListener('koskool_promos_updated', handlePromosSync);
      window.removeEventListener('koskool_data_updated', handlePromosSync);
      window.removeEventListener('storage', handlePromosSync);
    };
  }, []);

  // Sync Supabase cart when user logs in
  useEffect(() => {
    if (user?.id && user.id !== lastSyncedUserRef.current) {
      lastSyncedUserRef.current = user.id;

      // 1. Check if user has remote cart stored in Supabase
      supabase.auth.getUser().then(({ data: { user: authUser } }) => {
        const remoteCart = authUser?.user_metadata?.cart;
        if (Array.isArray(remoteCart) && remoteCart.length > 0) {
          setItems((currentItems) => {
            if (currentItems.length === 0) {
              return remoteCart;
            }
            // Merge local guest items with remote cart
            const merged = [...currentItems];
            for (const r of remoteCart) {
              const exists = merged.some(
                (m) => m.product.id === r.product?.id && m.selectedSize === r.selectedSize
              );
              if (!exists) merged.push(r);
            }
            return merged;
          });
        }
      }).catch(() => {});
    }
  }, [user]);

  // Save cart to localStorage on changes (locally for guest and cache for all)
  // If user is logged in, also save cart to Supabase
  useEffect(() => {
    if (!isInitializedRef.current) return;
    try {
      localStorage.setItem('koskool_cart', JSON.stringify(items));
      if (items.length > 0) {
        localStorage.removeItem('koskool_cart_cleared');
      }
    } catch {
      // ignore
    }

    // If logged in: save cart data to Supabase
    if (user?.id) {
      supabase.auth.updateUser({
        data: { cart: items },
      }).then(() => {}, () => {});

      supabase.from('profiles').update({
        cart: items,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id).then(() => {}, () => {});
    }
  }, [items, user]);

  // Save promo codes to localStorage on changes once initialized
  useEffect(() => {
    if (!isInitializedRef.current) return;
    try {
      localStorage.setItem('koskool_promocodes', JSON.stringify(promoCodes));

      const forApi = promoCodes.map((p) => ({
        id: p.id,
        code: p.code,
        description: p.description,
        discount_type: p.discountType,
        discount_value: p.discountValue,
        min_order_amount: p.minOrderValue,
        max_discount_amount: p.maxDiscount,
        is_active: p.isActive,
        usage_count: p.usageCount,
      }));
      localStorage.setItem('koskool_promos_cache', JSON.stringify(forApi));
    } catch {
      // ignore
    }
  }, [promoCodes]);

  // Save applied promo to localStorage on changes
  useEffect(() => {
    try {
      if (appliedPromo) {
        localStorage.setItem('koskool_applied_promo', JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem('koskool_applied_promo');
      }
    } catch {
      // ignore
    }
  }, [appliedPromo]);

  const addToCart = (product: Product, size?: string, colour?: string, quantity = 1, openDrawer = false) => {
    const itemSize = size || product.sizes[0] || 'Standard';
    const itemColour = colour || product.primaryColour;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === itemSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            selectedSize: itemSize,
            selectedColour: itemColour,
            quantity,
          },
        ];
      }
    });

    if (openDrawer) {
      setAppliedPromo(null);
      try {
        localStorage.removeItem('koskool_applied_promo');
      } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reset_cart_promocode'));
      }
      router.push('/cart');
    }

    try {
      localStorage.removeItem('koskool_cart_cleared');
    } catch {}
  };

  const removeFromCart = (productId: string, size: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => !(item.product.id === productId && item.selectedSize === size));
      if (next.length === 0) {
        try {
          localStorage.setItem('koskool_cart_cleared', 'true');
        } catch {}
      }
      return next;
    });
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedSize === size) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
    try {
      localStorage.setItem('koskool_cart_cleared', 'true');
    } catch {}
  };

  const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items]
  );
  const freeShippingThreshold = 500;

  // Calculate discount dynamically based on applied promo code and subtotal
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    const minVal = appliedPromo.minOrderValue ?? (appliedPromo as any).min_order_amount ?? 0;
    if (minVal > 0 && subtotal < minVal) return 0;

    const discType = appliedPromo.discountType || (appliedPromo as any).discount_type;
    const discVal = Number(appliedPromo.discountValue ?? (appliedPromo as any).discount_value ?? 0);
    const maxCap = appliedPromo.maxDiscount ?? (appliedPromo as any).max_discount_amount;

    let discount = 0;
    if (discType === 'percentage') {
      discount = Math.round((subtotal * discVal) / 100);
    } else {
      discount = Math.min(discVal, subtotal);
    }

    if (maxCap !== undefined && maxCap !== null && Number(maxCap) > 0) {
      discount = Math.min(discount, Number(maxCap));
    }

    return Math.max(0, Math.min(discount, subtotal));
  }, [appliedPromo, subtotal]);

  const shippingCost = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= freeShippingThreshold ? 0 : 100;
  }, [subtotal, freeShippingThreshold]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shippingCost);
  }, [subtotal, discountAmount, shippingCost]);

  // Apply promo code action
  const applyPromoCode = (codeStr: string) => {
    // Refresh promo codes from storage in case newly added in admin or another tab
    const freshPromos = loadStoredPromos();
    setPromoCodes(freshPromos);

    const cleanCode = codeStr.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a promo code.' };
    }

    const found = freshPromos.find((p) => p.code.toUpperCase() === cleanCode);
    if (!found) {
      return { success: false, message: `Promo code "${cleanCode}" is invalid.` };
    }

    if (!found.isActive) {
      return { success: false, message: `Promo code "${cleanCode}" has expired or is inactive.` };
    }

    const minVal = found.minOrderValue ?? (found as any).min_order_amount ?? 0;
    if (minVal > 0 && subtotal < minVal) {
      return {
        success: false,
        message: `Min. order of ₹${minVal} required for ${found.code}. Add ₹${minVal - subtotal} more!`,
      };
    }

    setAppliedPromo(found);

    const discType = found.discountType || (found as any).discount_type;
    const discVal = Number(found.discountValue ?? (found as any).discount_value ?? 0);
    const maxCap = found.maxDiscount ?? (found as any).max_discount_amount;

    let sampleDiscount = 0;
    if (discType === 'percentage') {
      sampleDiscount = Math.round((subtotal * discVal) / 100);
    } else {
      sampleDiscount = Math.min(discVal, subtotal);
    }
    if (maxCap !== undefined && maxCap !== null && Number(maxCap) > 0) {
      sampleDiscount = Math.min(sampleDiscount, Number(maxCap));
    }

    const maxCapInfo = maxCap && Number(maxCap) > 0 ? ` (Max Cap: ₹${maxCap})` : '';

    return {
      success: true,
      message: `Promo code "${found.code}" applied! You saved ₹${sampleDiscount} (${
        discType === 'percentage' ? `${discVal}% OFF` : `₹${discVal} Flat OFF`
      }${maxCapInfo}).`,
    };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Admin Actions for Promo Codes
  const addPromoCode = (promo: Omit<PromoCode, 'id' | 'usageCount' | 'createdAt'>) => {
    const newPromo: PromoCode = {
      ...promo,
      id: `promo-${Date.now()}`,
      code: promo.code.trim().toUpperCase(),
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPromoCodes((prev) => [newPromo, ...prev]);
  };

  const updatePromoCode = (id: string, updates: Partial<PromoCode>) => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, code: (updates.code || p.code).toUpperCase() } : p))
    );
    if (appliedPromo && appliedPromo.id === id) {
      setAppliedPromo((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deletePromoCode = (id: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
    if (appliedPromo && appliedPromo.id === id) {
      setAppliedPromo(null);
    }
  };

  const togglePromoCodeStatus = (id: string) => {
    setPromoCodes((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedActive = !p.isActive;
          if (appliedPromo && appliedPromo.id === id && !updatedActive) {
            setAppliedPromo(null);
          }
          return { ...p, isActive: updatedActive };
        }
        return p;
      })
    );
  };

  const resetPromoCodesToDefaults = () => {
    setPromoCodes(INITIAL_PROMO_CODES);
    localStorage.setItem('koskool_promocodes', JSON.stringify(INITIAL_PROMO_CODES));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        shippingCost,
        finalTotal,
        freeShippingThreshold,
        isCartDrawerOpen: false,
        openCartDrawer: () => {
          setAppliedPromo(null);
          try {
            localStorage.removeItem('koskool_applied_promo');
          } catch {}
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('reset_cart_promocode'));
          }
          router.push('/cart');
        },
        closeCartDrawer: () => setIsCartDrawerOpen(false),
        promoCodes,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        addPromoCode,
        updatePromoCode,
        deletePromoCode,
        togglePromoCodeStatus,
        resetPromoCodesToDefaults,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
