'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCTS, Product } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import { ArrowRight, Backpack, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPreviewProducts } from '@/services/api';

export default function PopularBags() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [bagProducts, setBagProducts] = useState<Product[]>(() =>
    PRODUCTS.filter((p) => p.productType === 'bags')
  );

  useEffect(() => {
    let isMounted = true;
    getPreviewProducts({ category: 'bags', limit: 8 }).then((items) => {
      if (isMounted && items && items.length > 0) {
        setBagProducts(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
    <section className="py-12 sm:py-16 bg-white border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-navy-900 bg-navy-50 px-3 py-1 rounded-full border border-navy-200">
              <Backpack className="w-3.5 h-3.5 text-brand-600" />
              Heavy Duty &amp; Ergonomic
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
              Popular School Bags
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Orthopedic spine-relief padding, multi-compartment organizers, and waterproof materials designed to carry heavy school loads with ease.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-end shrink-0">
            <Link
              href="/collections/bags"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition group mr-2"
            >
              <span>View All Bags ({bagProducts.length})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition shadow-sm ${
                canScrollLeft
                  ? 'bg-white border-gray-300 text-navy-950 hover:bg-navy-950 hover:text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Previous bags"
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
              aria-label="Next bags"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto no-scrollbar gap-4 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
        >
          {bagProducts.map((product) => (
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
