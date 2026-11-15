'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFootwearCategories, getCategories, FootwearCategoryCard, DEFAULT_FOOTWEAR_CATEGORIES } from '@/services/api';

export default function ShopByFootwear() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [categories, setCategories] = useState<FootwearCategoryCard[]>([]);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

      // Determine active centered index for mobile pagination dots
      const children = scrollRef.current.children;
      if (children.length > 0) {
        const containerCenter = scrollLeft + clientWidth / 2;
        let minDiff = Infinity;
        let active = 0;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HTMLElement;
          const childCenter = child.offsetLeft + child.offsetWidth / 2;
          const diff = Math.abs(containerCenter - childCenter);
          if (diff < minDiff) {
            minDiff = diff;
            active = i;
          }
        }
        setActiveIndex(active);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadFootwear() {
      try {
        const [cats, loaded] = await Promise.all([getCategories(), getFootwearCategories()]);
        const homeCats = cats.filter(
          (c) =>
            c.is_active !== false &&
            c.show_on_homepage !== false &&
            (c.slug === 'school-shoes' ||
              c.slug === 'sports-shoes' ||
              c.slug === 'fabric-shoes' ||
              c.slug === 'girls' ||
              c.slug === 'girls-ballerinas' ||
              c.slug.includes('shoe') ||
              c.slug.includes('footwear'))
        );

        let cards: FootwearCategoryCard[] = [];
        if (homeCats.length > 0) {
          cards = homeCats.map((c) => {
            const fallback = loaded.find((f) => f.id === c.slug || f.href.endsWith(`/${c.slug}`));
            return {
              id: c.slug,
              title: c.name,
              subtitle: c.description || fallback?.subtitle || 'Engineered for comfort and uniform standards.',
              image: c.image_url || fallback?.image || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
              tag: c.badge || fallback?.tag || 'Uniform Approved',
              href: `/collections/${c.slug}`,
              features: fallback?.features || ['Cushioned Insole', 'Anti-Slip Sole'],
              startingPrice: c.starting_price || fallback?.startingPrice || '₹499',
              display_order: c.display_order ?? 1,
              is_active: true,
              show_on_homepage: true,
            };
          });
        }

        // If fewer than 3 footwear cards loaded, supplement with active footwear categories
        if (cards.length < 3) {
          const activeLoaded = loaded.filter((f) => f.is_active !== false && f.show_on_homepage !== false);
          for (const item of activeLoaded) {
            if (!cards.some((c) => c.id === item.id || c.href === item.href)) {
              cards.push(item);
            }
          }
        }

        // Final fallback if needed
        if (cards.length === 0) {
          const active = loaded.filter((c) => c.is_active !== false && c.show_on_homepage !== false);
          cards = active.length > 0 ? active : DEFAULT_FOOTWEAR_CATEGORIES.slice(0, 3);
        }

        cards.sort((a, b) => a.display_order - b.display_order);
        if (isMounted) {
          setCategories(cards);
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
    window.addEventListener('resize', checkScroll);

    return () => {
      isMounted = false;
      window.removeEventListener('koskool_homepage_config_updated', handleUpdate);
      window.removeEventListener('koskool_categories_updated', handleUpdate);
      window.removeEventListener('koskool_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  useEffect(() => {
    // Check initial scroll bounds once categories are rendered
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [categories, checkScroll]);

  const scrollToCard = (index: number) => {
    if (scrollRef.current && scrollRef.current.children[index]) {
      const container = scrollRef.current;
      const target = container.children[index] as HTMLElement;
      const targetLeft = target.offsetLeft - (container.clientWidth - target.offsetWidth) / 2;
      container.scrollTo({
        left: targetLeft,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        const nextIndex =
          direction === 'left'
            ? Math.max(0, activeIndex - 1)
            : Math.min(categories.length - 1, activeIndex + 1);
        scrollToCard(nextIndex);
      } else {
        const cardWidth = 380;
        scrollRef.current.scrollBy({
          left: direction === 'left' ? -cardWidth : cardWidth,
          behavior: 'smooth',
        });
      }
    }
  };

  if (categories.length === 0) return null;

  return (
    <section className="scroll-mt-24 py-12 sm:py-16 bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Left & Right Arrows */}
        <div className="flex items-center justify-between mb-6 sm:mb-10 gap-4">
          <div className="text-left space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
              Shop by Footwear
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 break-words leading-relaxed">
              Engineered to fulfill exact school uniform specifications while providing all-day orthopedic comfort.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 self-end shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition shadow-sm ${
                canScrollLeft
                  ? 'bg-white border-gray-300 text-navy-950 hover:bg-navy-950 hover:text-white active:scale-95'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
              }`}
              aria-label="Previous footwear"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition shadow-sm ${
                canScrollRight
                  ? 'bg-navy-950 border-navy-950 text-white hover:bg-brand-600 hover:border-brand-600 active:scale-95'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
              }`}
              aria-label="Next footwear"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Categories Display: One Centered Card with Left & Right Peek on Phone, Responsive Grid on Desktop */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 overflow-x-auto sm:overflow-visible no-scrollbar pb-5 pt-2 snap-x snap-mandatory scroll-smooth -mx-4 px-[12vw] sm:mx-0 sm:px-0"
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="w-[76vw] max-w-[340px] sm:w-auto sm:max-w-none flex-shrink-0 sm:shrink snap-center"
            >
              <Link
                href={cat.href || `/collections/${cat.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                <div className="relative h-48 sm:h-60 bg-slate-100 overflow-hidden flex items-center justify-center p-4 sm:p-6">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 76vw, (max-width: 1024px) 50vw, 33vw"
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

        {/* Mobile Pagination Dots */}
        {categories.length > 1 && (
          <div className="flex sm:hidden justify-center items-center gap-1.5 mt-2">
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => scrollToCard(idx)}
                aria-label={`Go to ${cat.title}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'w-6 bg-navy-950' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
