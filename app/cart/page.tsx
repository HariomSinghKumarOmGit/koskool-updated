'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Tag,
  Check,
  Settings,
  Lock,
} from 'lucide-react';
import { getPromoCodes } from '@/services/api';

export default function CartPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    totalItems,
    promoCodes,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    addPromoCode,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ text: string; success: boolean } | null>(null);

  // Sync latest promo codes from Supabase
  useEffect(() => {
    getPromoCodes().then((dbPromos) => {
      dbPromos.forEach((p) => {
        if (!promoCodes.some((existing) => existing.code === p.code)) {
          addPromoCode({
            code: p.code,
            description: p.description,
            discountType: p.discount_type,
            discountValue: p.discount_value,
            minOrderValue: p.min_order_amount,
            maxDiscount: p.max_discount_amount,
            isActive: p.is_active,
          });
        }
      });
    });
  }, []);

  const executeApply = (targetCode: string) => {
    const res = applyPromoCode(targetCode);
    setCouponStatus({ text: res.message, success: res.success });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleApply = (codeToApply?: string) => {
    const target = (codeToApply || couponInput).trim();
    if (!target) {
      setCouponStatus({ text: 'Please enter a promo code.', success: false });
      return;
    }

    // Require Login for applying promo code as explicitly requested by user
    if (!user) {
      openAuthModal(() => executeApply(target));
      return;
    }

    executeApply(target);
  };

  const handleProceedToCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal(() => router.push('/checkout'));
    } else {
      router.push('/checkout');
    }
  };

  const activePromos = promoCodes.filter((p) => p.isActive);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-navy-950">Your School Cart is Empty</h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Explore our range of boys and girls school footwear, sports sneakers, backpacks, and accessories.
        </p>
        <Link
          href="/collections/boys"
          className="inline-flex bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950">
              Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-xs text-gray-500">
              Direct dispatch from Sector 2, Bawana Industrial Area, Delhi
            </p>
          </div>
          <Link
            href="/admin/promo-codes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-navy-950 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Admin Promo Manager</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Item List (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedSize}`}
                className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-2xl relative overflow-hidden border border-gray-100 shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[10px] font-black uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    {item.product.brand}
                  </span>
                  <h3 className="text-sm font-bold text-navy-950 line-clamp-1">{item.product.name}</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span>
                      Size: <strong className="text-gray-800">{item.selectedSize}</strong>
                    </span>
                    {item.selectedColour && (
                      <span>
                        Color: <strong className="text-gray-800">{item.selectedColour}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-navy-950 pt-1">
                    ₹{item.product.price}
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 py-1 text-xs font-black text-gray-800 min-w-[36px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-200 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="text-base font-black text-navy-950">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base font-black text-navy-950 border-b border-gray-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-gray-400 font-normal">All taxes included</span>
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-gray-900">
                    {shippingCost === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-navy-950 pt-3 border-t border-gray-100">
                  <span>Estimated Total</span>
                  <span className="text-xl">₹{finalTotal}</span>
                </div>
              </div>

              {/* Promo Code Form */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-navy-950 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-600" />
                    Apply Store Promo Code
                  </label>
                  {!user && (
                    <span className="text-[10px] text-amber-600 font-bold">
                      Login required to apply
                    </span>
                  )}
                </div>

                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2.5 rounded-xl text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {appliedPromo.code}: ₹{discountAmount} OFF Applied!
                      </span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-gray-400 hover:text-red-500 font-black text-base px-1.5"
                      title="Remove coupon"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. KOSKOOL10, FIRSTSTEP"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs uppercase font-bold text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      onClick={() => handleApply()}
                      className="bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {couponStatus && (
                  <p
                    className={`text-[11px] font-semibold ${
                      couponStatus.success ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {couponStatus.text}
                  </p>
                )}

                {/* Available Promo Chips */}
                {!appliedPromo && activePromos.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[10px] text-gray-400 font-medium mb-1">
                      Available Coupons (Click to apply):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activePromos.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleApply(p.code)}
                          className="text-[10px] font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md border border-brand-200 transition"
                        >
                          {p.code} (
                          {p.discountType === 'percentage'
                            ? `${p.discountValue}%`
                            : `₹${p.discountValue}`}
                          )
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-lg hover:shadow-brand-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
