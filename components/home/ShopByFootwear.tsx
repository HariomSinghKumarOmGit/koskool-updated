'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { getFootwearCategories, FootwearCategoryCard, DEFAULT_FOOTWEAR_CATEGORIES } from '@/services/api';

export default function ShopByFootwear() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [categories, setCategories] = useState<FootwearCategoryCard[]>(DEFAULT_FOOTWEAR_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    async function loadFootwear() {
      try {
        const loaded = await getFootwearCategories();
        const active = loaded.filter((c) => c.is_active !== false);
        if (isMounted && active.length > 0) {
          active.sort((a, b) => a.display_order - b.display_order);
          setCategories(active);
        }
      } catch (e) {
        console.error('Failed to load footwear categories:', e);
      }
    }

    loadFootwear();

    const handleUpdate = () => {
      loadFootwear();
    };

    window.addEventListener('koskool_homepage_config_updated', handleUpdate);
    window.addEventListener('koskool_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('koskool_homepage_config_updated', handleUpdate);
      window.removeEventListener('koskool_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
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
      const cardWidth = scrollRef.current.clientWidth < 640 ? 300 : 380;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="scroll-mt-24 py-12 sm:py-16 bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Left & Right Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="text-left space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
              Shop by Footwear
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 break-words leading-relaxed">
              Engineered to fulfill exact school uniform specifications while providing all-day orthopedic comfort.
            </p>
          </div>

          {/* Navigation Arrows for Section */}
          <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition shadow-sm ${
                canScrollLeft
                  ? 'bg-white border-gray-300 text-navy-950 hover:bg-navy-950 hover:text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Previous footwear"
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
              aria-label="Next footwear"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider with Left & Right Arrow browsing */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto no-scrollbar gap-5 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="w-[84vw] sm:w-[320px] md:w-[360px] flex-shrink-0 snap-start"
            >
              <Link
                href={cat.href}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                {/* Image Container */}
                <div className="relative h-60 sm:h-64 bg-slate-100 overflow-hidden flex items-center justify-center p-6">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 85vw, 360px"
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />

                  <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-navy-950 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm border border-gray-200">
                    From {cat.startingPrice}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-black text-navy-950 group-hover:text-brand-600 transition">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-950 group-hover:text-brand-600 transition">
                      View Collection
                    </span>
                    <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition shrink-0 ml-2 shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
