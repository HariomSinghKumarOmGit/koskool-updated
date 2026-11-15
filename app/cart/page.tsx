'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS, Product } from '@/data/products';
import {
  RotateCcw,
  Star,
  Check,
  Tag,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  ChevronUp,
  ChevronDown,
  X,
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
    freeShippingThreshold,
    promoCodes,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    addPromoCode,
    addToCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ text: string; success: boolean } | null>(null);
  const [addedIds, setAddedIds] = useState<{ [id: string]: boolean }>({});

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

  const handleAddRecommendation = (p: Product) => {
    addToCart(p, p.sizes[0], p.primaryColour, 1, false);
    setAddedIds((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [p.id]: false }));
    }, 1500);
  };

  // Recommended products for "You may also like" - matching screenshot 3 exactly
  const recommendedList = [
    PRODUCTS.find((p) => p.id === 'wgp53410-tan'),
    PRODUCTS.find((p) => p.id === 'wgp53283-black'),
    PRODUCTS.find((p) => p.id === 'wgp53283-tan'),
    PRODUCTS.find((p) => p.id === 'wgr53350-olive'),
  ].filter(Boolean) as Product[];

  // Free shipping calculation
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);
  const isEligibleFreeShipping = subtotal >= freeShippingThreshold;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-navy-950">Your cart is empty</h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Explore our collection of sandals, school footwear, backpacks, and accessories.
        </p>
        <Link
          href="/collections/boys"
          className="inline-flex items-center gap-2 bg-[#d72c1e] hover:bg-[#b82216] text-white font-bold text-sm px-6 py-3 rounded-full shadow-md transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Continue shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Top Header: "Your cart" + "Continue shopping" */}
        <div className="flex items-center justify-between pb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black font-sans">
            Your cart
          </h1>
          <Link
            href="/collections/boys"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#d72c1e] text-[#d72c1e] hover:bg-[#fff5f5] text-xs sm:text-sm font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Continue shopping</span>
          </Link>
        </div>

        {/* Main Grid: Products (left) & Floating Sticky Price Summary (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          {/* Left Column: List of items */}
          <div className="lg:col-span-8 divide-y divide-gray-200">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedSize}`}
                className="py-4 sm:py-8 first:pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6"
              >
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-28 sm:h-28 relative shrink-0 overflow-hidden rounded-xl bg-[#fbfbfb] border border-gray-100 flex items-center justify-center">
                    <Image
                      src={item.product.images[0] || '/cdn/shop/files/WGP53410-TAN-GENTS_7608173e-b30c-4214-ad1d-02182418d1a2.v_1786511338_width_1600.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1.5"
                      sizes="120px"
                    />
                  </div>

                  {/* Product Info: Name, Size, Unit Price */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-xs sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                      {item.product.name}
                    </h3>
                    {item.selectedSize && item.selectedSize !== 'Free Size' && (
                      <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                        Size: <strong className="text-gray-700">{item.selectedSize}</strong>
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-900 font-bold pt-0.5">
                      ₹ {item.product.price.toLocaleString('en-IN')}.00
                    </p>
                  </div>
                </div>

                {/* Right controls: Stepper, Remove link, Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:ml-auto">
                  {/* Touch-friendly Horizontal Stepper */}
                  <div className="flex items-center bg-[#f3f4f6] rounded-xl overflow-hidden border border-gray-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition text-sm font-bold"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="text-xs font-bold text-gray-900 px-2 min-w-[24px] text-center select-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition text-sm font-bold"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove text link */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                    className="text-xs text-gray-500 hover:text-red-600 underline underline-offset-2 transition"
                  >
                    Remove
                  </button>

                  {/* Line Item Total */}
                  <div className="text-right min-w-[70px] sm:min-w-[80px]">
                    <span className="text-sm sm:text-base font-bold text-gray-950">
                      ₹ {(item.product.price * item.quantity).toLocaleString('en-IN')}.00
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Sticky Floating Price Summary Card */}
          <div className="lg:col-span-4 sticky top-24 self-start z-20">
            <div className="bg-[#f9fafb] rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100/80 space-y-6">
              {/* Free shipping card pill */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-700 font-medium mb-2.5">
                  {isEligibleFreeShipping ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <span>✓ You are eligible for free shipping!</span>
                    </span>
                  ) : (
                    <span>Add ₹ {remainingForFree.toLocaleString('en-IN')} more for free shipping (₹100 flat shipping below ₹500).</span>
                  )}
                </p>
                {/* Horizontal progress bar */}
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isEligibleFreeShipping ? 'bg-emerald-600' : 'bg-black'
                    }`}
                    style={{
                      width: isEligibleFreeShipping
                        ? '100%'
                        : `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Subtotal & Price Breakdown */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm sm:text-base font-normal text-gray-800">Subtotal</span>
                  <span className="text-base sm:text-lg font-semibold text-gray-900">
                    ₹ {subtotal.toLocaleString('en-IN')}.00
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>- ₹ {discountAmount.toLocaleString('en-IN')}.00</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-700">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <strong className="text-emerald-600 font-bold uppercase tracking-wide">FREE</strong>
                    ) : (
                      <span className="font-bold text-gray-900">₹ {shippingCost}.00</span>
                    )}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-gray-200/80">
                  <span className="text-base sm:text-lg font-bold text-gray-950">Total</span>
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
                    ₹ {finalTotal.toLocaleString('en-IN')}.00
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 font-normal">
                  {shippingCost === 0 ? 'Free standard delivery applied.' : '₹100 shipping fee applied on orders under ₹500.'}
                </p>
              </div>

              {/* Promo Code Section to reduce price */}
              <div className="pt-3 border-t border-gray-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#d72c1e]" />
                    <span>Promo code / Coupon</span>
                  </label>
                  <span className="text-[10px] text-gray-500">
                    Apply to save more
                  </span>
                </div>

                {appliedPromo ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-medium space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong className="font-bold">{appliedPromo.code}</strong> applied{' '}
                          {discountAmount > 0 ? (
                            <span className="font-bold text-emerald-700">(-₹{discountAmount})</span>
                          ) : (
                            <span className="text-amber-700 font-bold">(₹0 discount)</span>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-gray-400 hover:text-red-600 font-bold text-base px-1"
                        title="Remove promo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Min Spend Notice */}
                    {appliedPromo.minOrderValue > 0 && subtotal < appliedPromo.minOrderValue ? (
                      <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                        ⚠️ Min. spend of ₹{appliedPromo.minOrderValue} required for {appliedPromo.code}. Add ₹{appliedPromo.minOrderValue - subtotal} more to receive discount!
                      </p>
                    ) : appliedPromo.minOrderValue > 0 ? (
                      <p className="text-[10px] text-emerald-700">
                        Min. order of ₹{appliedPromo.minOrderValue} qualified.
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-700">
                        No minimum order cap (applied on any cart total).
                      </p>
                    )}

                    {/* Max Discount Notice */}
                    {appliedPromo.maxDiscount && appliedPromo.maxDiscount > 0 ? (
                      <p className="text-[10px] text-gray-600">
                        Max discount cap: ₹{appliedPromo.maxDiscount}
                        {discountAmount === appliedPromo.maxDiscount ? ' (Capped)' : ''}
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-600">
                        Max discount cap: No Cap (Unlimited)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10"
                      className="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs uppercase font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-black placeholder:font-normal placeholder:normal-case placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleApply()}
                      className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs hover:shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {couponStatus && (
                  <p
                    className={`text-[11px] font-medium ${
                      couponStatus.success ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {couponStatus.text}
                  </p>
                )}
              </div>

              {/* Red Checkout Pill Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full bg-[#d72c1e] hover:bg-[#b82216] active:scale-[0.99] text-white font-bold text-sm py-4 px-6 rounded-full shadow-md hover:shadow-lg transition text-center tracking-wide"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>

        {/* "You may also like" Section */}
        {recommendedList.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-200">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black mb-8 font-sans">
              You may also like
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendedList.map((product) => {
                const isAdded = !!addedIds[product.id];
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl flex flex-col justify-between"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="block relative aspect-square bg-[#f8f9fa] rounded-2xl overflow-hidden mb-3 p-4 flex items-center justify-center"
                    >
                      {/* Rating pill top-right if available */}
                      {product.rating && (
                        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-800 shadow-2xs">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>{product.rating}</span>
                        </div>
                      )}

                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </Link>

                    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#d72c1e] transition">
                          <Link href={`/products/${product.slug}`}>
                            {product.name}
                          </Link>
                        </h4>
                        <p className="text-xs sm:text-sm font-bold text-gray-950 mt-0.5">
                          ₹ {product.price.toLocaleString('en-IN')}.00
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddRecommendation(product)}
                        className={`mt-2 w-full text-xs font-bold py-2 px-3 rounded-full border transition flex items-center justify-center gap-1.5 ${
                          isAdded
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-gray-300 hover:border-black text-gray-900 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <span>+ Add to Cart</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
