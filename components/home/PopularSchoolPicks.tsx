'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PRODUCTS, Product } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPreviewProducts } from '@/services/api';

export default function PopularSchoolPicks() {
  const [activeTab, setActiveTab] = useState<
    'all' | 'school-shoes' | 'sports-shoes' | 'fabric-shoes' | 'accessories' | 'bags'
  >('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const tabs = [
    { id: 'all', label: 'All Picks' },
    { id: 'school-shoes', label: 'School Shoes' },
    { id: 'sports-shoes', label: 'Sports & PT' },
    { id: 'fabric-shoes', label: 'Canvas & Fabric' },
    { id: 'bags', label: 'School Bags' },
    { id: 'accessories', label: 'Accessories' },
  ];

  // Load preview products with minimal images to save Supabase egress & client memory
  const [products, setProducts] = useState<Product[]>(() => {
    return PRODUCTS.filter((p) => p.isPopular).slice(0, 10);
  });

  useEffect(() => {
    let isMounted = true;
    getPreviewProducts({
      filter: activeTab === 'all' ? 'popular' : 'all',
      category: activeTab === 'all' ? 'all' : activeTab,
      limit: 10,
    }).then((items) => {
      if (isMounted && items && items.length > 0) {
        setProducts(items);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const filteredProducts = products;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth < 640 ? 260 : 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              <Sparkles className="w-3.5 h-3.5" />
              Top Rated by Parents &amp; Schools
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
              Popular School Picks
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              The most sought-after school shoes, drill canvas, sports trainers, and classroom essentials across India.
            </p>
          </div>

          {/* Left and Right navigation arrows */}
          <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition shadow-sm ${
                canScrollLeft
                  ? 'bg-white border-gray-300 text-navy-950 hover:bg-navy-950 hover:text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition shadow-sm ${
                canScrollRight
                  ? 'bg-navy-950 border-navy-950 text-white hover:bg-brand-600 hover:border-brand-600'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Filtering Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (scrollRef.current) scrollRef.current.scrollLeft = 0;
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-navy-950 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Horizontal Smooth Carousel with Snap */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto no-scrollbar gap-4 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="w-[72vw] sm:w-[260px] md:w-[280px] lg:w-[290px] flex-shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
