'use client';

import React from 'react';
import { PRODUCTS } from '@/data/products';
import ProductDetailView from '@/components/product/ProductDetailView';
import { Sparkles } from 'lucide-react';

export default function FeaturedProductShowcase() {
  const product =
    PRODUCTS.find((p) => p.slug === 'mens-daily-wear-sandals-wgp53410-tan') ||
    PRODUCTS[0];

  return (
    <section className="py-12 bg-white border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            <Sparkles className="w-3.5 h-3.5" />
            Trending Product Spotlight
          </span>
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Scroll images on left &bull; Sticky order details on right
          </span>
        </div>
      </div>

      <ProductDetailView product={product} isHomePage={true} />
    </section>
  );
}
