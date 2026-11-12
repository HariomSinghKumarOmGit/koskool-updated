'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { getPreviewProducts } from '@/services/api';
import {
  ShoppingBag,
  Check,
  ChevronLeft,
  ChevronRight,
  Tag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function QuickAddToCartSection() {
  const { addToCart, applyPromoCode, appliedPromo, removePromoCode, discountAmount, promoCodes } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick items to display with live Supabase integration
  const [quickItems, setQuickItems] = useState<Product[]>(() =>
    PRODUCTS.filter((p) => p.isPopular).slice(0, 6)
  );

  useEffect(() => {
    let isMounted = true;
    getPreviewProducts({ filter: 'popular', limit: 6 }).then((items) => {
      if (isMounted && items && items.length > 0) {
        setQuickItems(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Local state for selected size per product
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: string]: string }>({});
  const [addedItems, setAddedItems] = useState<{ [productId: string]: boolean }>({});
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ text: string; success: boolean } | null>(null);

  const getSelectedSize = (p: Product) => {
    return selectedSizes[p.id] || p.sizes[0] || 'Standard';
  };

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQuickAdd = (p: Product) => {
    const size = getSelectedSize(p);
    addToCart(p, size);
    setAddedItems((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [p.id]: false }));
    }, 2000);
  };

  const handleApplyPromo = (codeToApply?: string) => {
    const target = codeToApply || promoInput;
    const res = applyPromoCode(target);
    setPromoFeedback({ text: res.message, success: res.success });
    if (res.success) setPromoInput('');
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth < 640 ? 280 : 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  const activePromos = promoCodes.filter((p) => p.isActive);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title and Left/Right Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              <Zap className="w-3.5 h-3.5" />
              1-Click Express Cart
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
              Quick Add to Cart &amp; Instant Deals
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Select your child’s size directly and add essentials to your school cart in one tap with automatic promo code discounts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-gray-300 bg-white text-navy-950 hover:bg-navy-950 hover:text-white flex items-center justify-center transition shadow-sm"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-navy-950 bg-navy-950 text-white hover:bg-brand-600 hover:border-brand-600 flex items-center justify-center transition shadow-sm"
              aria-label="Next item"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Promo Code Banner / Discount Bar */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-navy-950 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black">
                  Admin Promo Discount Active
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Reduces Cart Price
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                {appliedPromo
                  ? `Applied: ${appliedPromo.code} (-₹${discountAmount} OFF)`
                  : 'Enter code or click any offer below to reduce checkout total!'}
              </p>
            </div>
          </div>

          {/* Quick Promo Input or Status */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            {appliedPromo ? (
              <div className="flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{appliedPromo.code} Applied</span>
                <button
                  onClick={removePromoCode}
                  className="text-gray-400 hover:text-white ml-2 text-sm"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-bold focus:outline-none focus:ring-1 focus:ring-brand-500 w-36 sm:w-44"
                />
                <button
                  onClick={() => handleApplyPromo()}
                  className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition"
                >
                  Apply Code
                </button>
              </div>
            )}

            <Link
              href="/admin"
              className="text-[11px] text-gray-400 hover:text-white underline decoration-dotted transition"
            >
              Manage in Admin
            </Link>
          </div>
        </div>

        {/* Promo feedback if any */}
        {promoFeedback && (
          <div
            className={`-mt-5 mb-6 text-xs font-semibold px-4 py-2 rounded-xl border ${
              promoFeedback.success
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {promoFeedback.text}
          </div>
        )}

        {/* Carousel of Quick-Add Items */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar gap-5 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
        >
          {quickItems.map((product) => {
            const currentSize = getSelectedSize(product);
            const isAdded = !!addedItems[product.id];

            return (
              <div
                key={product.id}
                className="w-[84vw] sm:w-[300px] md:w-[330px] flex-shrink-0 snap-start"
              >
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between h-full group">
                  {/* Image & Badges */}
                  <div>
                    <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center p-4">
                      {product.discountPercent && (
                        <span className="absolute top-2.5 left-2.5 bg-brand-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow z-10">
                          {product.discountPercent}% OFF
                        </span>
                      )}
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 80vw, 300px"
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Title & Brand */}
                    <span className="text-[10px] font-black uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {product.brand}
                    </span>
                    <h3 className="text-sm font-bold text-navy-950 mt-1 line-clamp-1 group-hover:text-brand-600 transition">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-lg font-black text-navy-950">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Size Selector in-place */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Select Size: <strong className="text-navy-950">{currentSize}</strong>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.slice(0, 6).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleSelectSize(product.id, sz)}
                            className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition ${
                              currentSize === sz
                                ? 'bg-navy-950 text-white border-navy-950 shadow-sm'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart CTA */}
                  <div className="pt-4 mt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-brand-600 hover:bg-brand-500 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart (₹{product.price})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
