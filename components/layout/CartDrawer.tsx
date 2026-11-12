'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import {
  X,
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Tag,
  Check,
  ShieldCheck,
  Settings,
} from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    freeShippingThreshold,
    isCartDrawerOpen,
    closeCartDrawer,
    totalItems,
    promoCodes,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);

  if (!isCartDrawerOpen) return null;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyPromo = (codeToApply?: string) => {
    const target = codeToApply || inputCode;
    const res = applyPromoCode(target);
    setPromoMessage({ text: res.message, success: res.success });
    if (res.success) {
      setInputCode('');
    }
  };

  const activePromos = promoCodes.filter((p) => p.isActive);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity" onClick={closeCartDrawer} />

      {/* Slide-in Drawer */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl z-10 animate-slideLeft">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-navy-950 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-500" />
            <span className="font-bold text-base tracking-wide">School Cart ({totalItems})</span>
          </div>
          <button
            onClick={closeCartDrawer}
            className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Bar */}
        <div className="bg-brand-50/70 border-b border-brand-100 px-6 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-900 mb-1.5">
            <Truck className="w-4 h-4 text-brand-600 shrink-0" />
            {remainingForFreeShipping > 0 ? (
              <span>
                Add <span className="text-brand-600 font-bold">₹{remainingForFreeShipping}</span> more for Free Delivery!
              </span>
            ) : (
              <span className="text-emerald-700 font-bold">🎉 You qualify for Free Delivery!</span>
            )}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-brand-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-base">Your cart is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Add school shoes, PT sneakers, bags or accessories to begin checkout.
                </p>
              </div>
              <button
                onClick={closeCartDrawer}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="py-4 flex gap-4 group">
                <div className="w-20 h-20 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-200 shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-contain p-1.5"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-navy-900 leading-snug line-clamp-2">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-gray-400 hover:text-red-500 p-1 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                      <span>
                        Size: <strong className="text-gray-700">{item.selectedSize}</strong>
                      </span>
                      {item.selectedColour && (
                        <span>
                          • Color: <strong className="text-gray-700">{item.selectedColour}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 py-1 text-xs font-bold text-gray-800 min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-navy-950">
                        ₹{item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code & Drawer Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-5 bg-gray-50/90 space-y-3.5">
            {/* Promo Code Input & Badges */}
            <div className="bg-white p-3 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-navy-950 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-600" />
                  Apply Store Promo Code
                </span>
                <Link
                  href="/admin"
                  onClick={closeCartDrawer}
                  className="text-[10px] text-gray-400 hover:text-navy-950 flex items-center gap-1 transition"
                  title="Admin Promo Code Manager"
                >
                  <Settings className="w-3 h-3" />
                  <span>Admin</span>
                </Link>
              </div>

              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>
                      {appliedPromo.code}: -₹{discountAmount}
                    </span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-gray-400 hover:text-red-500 font-black text-sm px-1"
                    title="Remove coupon"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. WELCOME10)"
                    className="flex-1 px-3 py-1.5 text-xs font-bold uppercase rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-gray-50/50"
                  />
                  <button
                    onClick={() => handleApplyPromo()}
                    className="bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Status feedback message */}
              {promoMessage && (
                <p
                  className={`text-[10px] font-semibold ${
                    promoMessage.success ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}

              {/* Available active promo code pills */}
              {!appliedPromo && activePromos.length > 0 && (
                <div className="pt-1">
                  <p className="text-[10px] text-gray-400 font-medium mb-1">Available Coupons (Tap to apply):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activePromos.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleApplyPromo(p.code)}
                        className="text-[10px] font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md border border-brand-200 transition"
                      >
                        {p.code} ({p.discountType === 'percentage' ? `${p.discountValue}%` : `₹${p.discountValue}`})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">₹{subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Promo Discount ({appliedPromo?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingCost}`}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm">
                <span className="font-bold text-navy-950">Total</span>
                <span className="font-black text-lg text-navy-950">₹{finalTotal}</span>
              </div>
            </div>

            {/* Checkout & View Cart CTAs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                href="/cart"
                onClick={closeCartDrawer}
                className="w-full text-center py-2.5 px-4 rounded-xl border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white text-xs font-bold transition duration-150"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCartDrawer}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition duration-150"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
