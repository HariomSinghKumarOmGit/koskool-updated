'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product } from '@/data/products';
import { PromoCode, INITIAL_PROMO_CODES } from '@/data/promocodes';

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
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // Helper to load promo codes from localStorage syncing with koskool_promos_cache
  const loadStoredPromos = (): PromoCode[] => {
    try {
      // Check primary cache first
      const apiCache = localStorage.getItem('koskool_promos_cache');
      const standardCache = localStorage.getItem('koskool_promocodes');

      if (apiCache) {
        const parsed = JSON.parse(apiCache);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            id: p.id || `pr-${Math.random()}`,
            code: (p.code || '').toUpperCase(),
            discountType: p.discount_type || p.discountType || 'percentage',
            discountValue: Number(p.discount_value || p.discountValue || 10),
            minOrderValue: Number(p.min_order_amount || p.minOrderValue || 0),
            maxDiscount: p.max_discount_amount || p.maxDiscount,
            description: p.description || '',
            isActive: p.is_active !== undefined ? p.is_active : p.isActive !== undefined ? p.isActive : true,
            usageCount: p.usage_count || p.usageCount || 0,
            createdAt: p.created_at || '2026-01-01',
          }));
        }
      }

      if (standardCache) {
        return JSON.parse(standardCache);
      }
    } catch {
      // ignore
    }
    return INITIAL_PROMO_CODES;
  };

  // Load cart and promo codes from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('koskool_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }

      const loadedPromos = loadStoredPromos();
      setPromoCodes(loadedPromos);

      const savedApplied = localStorage.getItem('koskool_applied_promo');
      if (savedApplied) {
        setAppliedPromo(JSON.parse(savedApplied));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('koskool_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Save promo codes to localStorage in both formats on changes
  useEffect(() => {
    try {
      localStorage.setItem('koskool_promocodes', JSON.stringify(promoCodes));

      // Also sync to koskool_promos_cache
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
      setIsCartDrawerOpen(true);
    }
  };

  const removeFromCart = (productId: string, size: string) => {
    setItems((prev) => prev.filter((item) => !(item.product.id === productId && item.selectedSize === size)));
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
  };

  const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items]
  );
  const freeShippingThreshold = 999;

  // Calculate discount dynamically based on applied promo code and subtotal
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (subtotal < appliedPromo.minOrderValue) return 0;

    if (appliedPromo.discountType === 'percentage') {
      const calculated = Math.round((subtotal * appliedPromo.discountValue) / 100);
      return appliedPromo.maxDiscount ? Math.min(calculated, appliedPromo.maxDiscount) : calculated;
    } else {
      return Math.min(appliedPromo.discountValue, subtotal);
    }
  }, [appliedPromo, subtotal]);

  const shippingCost = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= freeShippingThreshold ? 0 : 70;
  }, [subtotal, freeShippingThreshold]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shippingCost);
  }, [subtotal, discountAmount, shippingCost]);

  // Apply promo code action
  const applyPromoCode = (codeStr: string) => {
    // Refresh promo codes from storage in case newly added in another tab
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

    if (subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Min. order of ₹${found.minOrderValue} required for ${found.code}. Add ₹${
          found.minOrderValue - subtotal
        } more!`,
      };
    }

    setAppliedPromo(found);
    return {
      success: true,
      message: `Promo code "${found.code}" applied! You saved ${
        found.discountType === 'percentage' ? `${found.discountValue}% OFF` : `₹${found.discountValue} Flat OFF`
      }.`,
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
        isCartDrawerOpen,
        openCartDrawer: () => setIsCartDrawerOpen(true),
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
