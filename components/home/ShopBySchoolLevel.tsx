'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, School, Baby, CheckCircle2 } from 'lucide-react';
import { getSchoolLevels, SchoolLevelItem, DEFAULT_SCHOOL_LEVELS } from '@/services/api';

const LEVEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  kindergarten: Baby,
  'middle-wing': School,
  'senior-wing': GraduationCap,
};

export default function ShopBySchoolLevel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [levels, setLevels] = useState<SchoolLevelItem[]>(DEFAULT_SCHOOL_LEVELS);

  useEffect(() => {
    let isMounted = true;
    async function loadLevels() {
      try {
        const loaded = await getSchoolLevels();
        const active = loaded.filter((l) => l.is_active !== false);
        if (isMounted && active.length > 0) {
          active.sort((a, b) => a.display_order - b.display_order);
          setLevels(active);
        }
      } catch (e) {
        console.error('Failed to load school levels:', e);
      }
    }

    loadLevels();

    const handleUpdate = () => {
      loadLevels();
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
    <section className="scroll-mt-24 py-12 sm:py-16 bg-white border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Left & Right Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="text-left space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
              Shop by School Level
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Tailored gear calibrated specifically for each growth phase of a child’s school journey.
            </p>
          </div>

          <div className="flex md:hidden items-center gap-2 self-start sm:self-end shrink-0">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition shadow-sm ${
                canScrollLeft
                  ? 'bg-white border-gray-300 text-navy-950 hover:bg-navy-950 hover:text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Previous level"
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
              aria-label="Next level"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Responsive slider on mobile, balanced 3-column grid on desktop */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible no-scrollbar gap-5 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
        >
          {levels.map((lvl, idx) => {
            const Icon = LEVEL_ICONS[lvl.id] || School;
            return (
              <div
                key={lvl.id || idx}
                className="w-[84vw] sm:w-[320px] md:w-auto flex-shrink-0 snap-start"
              >
                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between h-full group overflow-hidden">
                  {/* Top Colored Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${lvl.color || 'from-blue-600 to-navy-900'}`} />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-navy-950 group-hover:scale-110 transition">
                        <Icon className="w-6 h-6 text-brand-600" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {lvl.startingPrice && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            From {lvl.startingPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-navy-950 group-hover:text-brand-600 transition">
                        {lvl.title}
                      </h3>
                      <p className="text-xs font-semibold text-brand-600 mt-0.5">{lvl.subtitle}</p>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{lvl.description}</p>

                    <ul className="space-y-2 pt-2 border-t border-gray-100">
                      {lvl.points.map((pt, pIdx) => (
                        <li key={pIdx} className="text-xs text-gray-700 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={lvl.href}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-50 hover:bg-brand-600 text-navy-950 hover:text-white font-extrabold text-xs transition border border-gray-200 hover:border-brand-600 group shadow-sm"
                    >
                      <span>Explore {lvl.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </Link>
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
