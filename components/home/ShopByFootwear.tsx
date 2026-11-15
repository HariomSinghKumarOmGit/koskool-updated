'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFootwearCategories, FootwearCategoryCard, DEFAULT_FOOTWEAR_CATEGORIES } from '@/services/api';

export default function ShopByFootwear() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [categories, setCategories] = useState<FootwearCategoryCard[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadFootwear() {
      try {
        const loaded = await getFootwearCategories();
        const active = loaded.filter((c) => c.is_active !== false && c.show_on_homepage !== false);
        if (isMounted) {
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
    window.addEventListener('koskool_categories_updated', handleUpdate);
    window.addEventListener('koskool_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('koskool_homepage_config_updated', handleUpdate);
      window.removeEventListener('koskool_categories_updated', handleUpdate);
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

  if (categories.length === 0) return null;

  const isFew = categories.length <= 2;

  return (
    <section className="scroll-mt-24 py-12 sm:py-16 bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 sm:mb-10 max-w-2xl text-left space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
            Shop by Footwear
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 break-words leading-relaxed">
            Engineered to fulfill exact school uniform specifications while providing all-day orthopedic comfort.
          </p>
        </div>

        {/* Categories Display: Clean Responsive Grid - Zero Horizontal Scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="w-full">
              <Link
                href={cat.href || `/collections/${cat.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                <div className="relative h-48 sm:h-60 bg-slate-100 overflow-hidden flex items-center justify-center p-4 sm:p-6">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-white/90 backdrop-blur-md text-navy-950 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm border border-gray-200">
                    From {cat.startingPrice}
                  </span>
                </div>

                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-lg sm:text-xl font-black text-navy-950 group-hover:text-brand-600 transition">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {cat.subtitle}
                    </p>
                  </div>

                  <div className="pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-950 group-hover:text-brand-600 transition">
                      View Collection
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition shrink-0 ml-2 shadow-sm">
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
