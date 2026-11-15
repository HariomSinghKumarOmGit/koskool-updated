'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';


import {
  getHeroSlides,
  HeroSlide,
  DEFAULT_HERO_SLIDES,
} from '@/services/api';

export default function HeroSlideshow() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile touch swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPlaying(false);
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchStartXRef.current - touchEndXRef.current;
      if (diff > 45) {
        nextSlide();
      } else if (diff < -45) {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    setIsPlaying(true);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicSlides() {
      try {
        const loadedHero = await getHeroSlides().catch(() => DEFAULT_HERO_SLIDES);

        if (isMounted) {
          const activeSlides = (loadedHero && loadedHero.length > 0 ? loadedHero : DEFAULT_HERO_SLIDES)
            .filter((s) => s.is_active !== false)
            .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

          if (activeSlides.length > 0) {
            setSlides(activeSlides);
            setCurrentSlide((prev) => (prev >= activeSlides.length ? 0 : prev));
          }
        }
      } catch (err) {
        console.error('Failed to load hero slides:', err);
      }
    }

    loadDynamicSlides();

    const handleUpdate = () => {
      loadDynamicSlides();
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

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSlide, slides.length]);

  const activeIndex = currentSlide < slides.length ? currentSlide : 0;

  return (
    <div
      className="relative w-full bg-navy-950 select-none overflow-hidden"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Visual Banner Area - 100% clean, no text collision, subjects in forefront */}
      <div
        className="relative w-full aspect-[1000/1250] sm:aspect-[16/9] md:aspect-[5760/2345] max-h-[75vh] sm:max-h-[82vh] overflow-hidden group touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              idx === activeIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Link
              href={slide.primaryCtaLink || '/collections/boys'}
              className="block w-full h-full relative"
              title={`View ${slide.title || 'Collection'}`}
            >
              <picture className="w-full h-full block">
                <source media="(max-width: 767px)" srcSet={slide.mobileImage || slide.desktopImage} />
                <img
                  src={slide.desktopImage}
                  alt={slide.title || 'Hero Banner'}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </picture>
            </Link>
          </div>
        ))}

        {/* Carousel Edge Arrows (hidden on mobile, subtle hover on desktop) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-navy-950/70 hover:bg-navy-900 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-navy-950/70 hover:bg-navy-900 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Indicator Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-1 sm:py-1.5 rounded-full">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 transition-all duration-300 rounded-full p-0.5 ${
                  idx === activeIndex
                    ? 'w-6 bg-brand-500 shadow-sm'
                    : 'w-2 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
