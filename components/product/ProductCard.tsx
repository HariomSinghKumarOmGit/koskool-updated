'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const primaryImage =
    product.images[0] ||
    '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg';
  const secondaryImage = product.images[1] || primaryImage;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 w-full max-w-full">
      {/* Top Image Container with hover secondary flip */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square bg-gray-50 overflow-hidden product-card-img-container"
      >
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
          {product.discountPercent && (
            <span className="bg-brand-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isPopular && (
            <span className="bg-navy-950 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow">
              Popular Pick
            </span>
          )}
        </div>

        {/* Primary Image */}
        <div className="absolute inset-0 img-primary flex items-center justify-center p-4">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-3"
          />
        </div>

        {/* Secondary Image for Hover Flip */}
        <div className="absolute inset-0 img-hover flex items-center justify-center p-4">
          <Image
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-3"
          />
        </div>

        {/* Quick Action Overlay on hover for desktop */}
        <div className="hidden sm:flex absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 gap-2">
          <button
            onClick={handleQuickAdd}
            className={`flex-1 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 backdrop-blur-md ${
              added ? 'bg-emerald-600' : 'bg-navy-950 hover:bg-brand-600'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Wings & Category Tags */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-700">
              {product.gender}
            </span>
            {product.schoolLevel.slice(0, 1).map((lvl) => (
              <span
                key={lvl}
                className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 capitalize"
              >
                {lvl.replace('-', ' ')}
              </span>
            ))}
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-navy-950 line-clamp-2 min-h-[2.5rem] group-hover:text-brand-600 transition leading-snug break-words">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="space-y-2 pt-1 border-t border-gray-100">
          {/* Ratings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-500">
                <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-800">{product.rating}</span>
              <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
            </div>

            <span className="text-[10px] sm:text-[11px] font-medium text-gray-500">
              {product.sizes.length} {product.sizes.length === 1 ? 'Size' : 'Sizes'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-navy-950">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Mobile Always-Visible Add to Cart Button */}
          <div className="sm:hidden pt-1">
            <button
              onClick={handleQuickAdd}
              className={`w-full py-2 px-2.5 rounded-xl text-[11px] font-bold text-white transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                added ? 'bg-emerald-600' : 'bg-navy-950 hover:bg-brand-600'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
