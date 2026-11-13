'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';


import {
  getHeroSlides,
  HeroSlide,
  DEFAULT_HERO_SLIDES,
  getPromotionalBanners,
  PromotionalBanner,
} from '@/services/api';

// Combines the hard-coded static hero slides with active promotional board banners
function combineSlidesAndBanners(
  baseHeroSlides: HeroSlide[],
  promotionalBanners: PromotionalBanner[]
): HeroSlide[] {
  // Always ensure all 3 static hard-coded slides are active and present
  const base = (baseHeroSlides && baseHeroSlides.length > 0 ? baseHeroSlides : DEFAULT_HERO_SLIDES)
    .filter((s) => s.is_active !== false)
    .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

  const activePromos = (promotionalBanners || [])
    .filter((b) => b.is_active)
    .sort((a, b) => (Number(a.display_order) || 1) - (Number(b.display_order) || 1));

  if (activePromos.length === 0) {
    return base;
  }

  // Start with all static slides so they are NEVER lost or overwritten
  const combined: HeroSlide[] = [...base];

  // Insert each promotional banner at its exact requested 1-based position number
  for (const promo of activePromos) {
    const promoSlide: HeroSlide = {
      id: `promo-${promo.id}`,
      desktopImage: promo.image_url,
      mobileImage: promo.image_url,
      badge: promo.badge || 'SPECIAL PROMO',
      title: promo.title,
      subtitle: promo.subtitle,
      primaryCtaText: promo.primary_cta_text || 'Shop Now',
      primaryCtaLink: promo.primary_cta_link || '/collections/boys',
      secondaryCtaText: promo.secondary_cta_text || 'Explore Collection',
      secondaryCtaLink: promo.secondary_cta_link || '/collections/girls',
      tertiaryCtaText: 'Explore Accessories',
      tertiaryCtaLink: '/collections/accessories',
      display_order: Number(promo.display_order) || 1,
      is_active: true,
    };

    // 1-based position number -> 0-based insert index
    const targetIndex = Math.max(0, Math.min(combined.length, (Number(promo.display_order) || 1) - 1));
    combined.splice(targetIndex, 0, promoSlide);
  }

  return combined;
}

export default function HeroSlideshow() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicSlides() {
      try {
        const [loadedHero, loadedPromos] = await Promise.all([
          getHeroSlides().catch(() => DEFAULT_HERO_SLIDES),
          getPromotionalBanners().catch(() => []),
        ]);

        if (isMounted) {
          const merged = combineSlidesAndBanners(loadedHero, loadedPromos);
          if (merged.length > 0) {
            setSlides(merged);
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
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSlide, slides.length]);

  const activeIndex = currentSlide < slides.length ? currentSlide : 0;
  const active = slides[activeIndex] || DEFAULT_HERO_SLIDES[0];

  return (
    <div
      className="relative w-full bg-navy-950 select-none overflow-hidden"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Visual Banner Area - 100% clean, no text collision, subjects in forefront */}
      <div className="relative w-full aspect-[1000/1250] md:aspect-[5760/2345] max-h-[82vh] overflow-hidden group">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              idx === activeIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Link
              href={slide.primaryCtaLink}
              className="block w-full h-full relative"
              title={`View ${slide.title}`}
            >
              <picture className="w-full h-full block">
                <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
                <img
                  src={slide.desktopImage}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              </picture>
            </Link>
          </div>
        ))}

        {/* Carousel Edge Arrows (subtle on hover, never obstructs content) */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-navy-950/70 hover:bg-navy-900 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-105"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-navy-950/70 hover:bg-navy-900 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-105"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Foreground Context & Action Bar: Positioned cleanly beneath the banner */}
      <div className="relative z-20 bg-navy-950 border-t border-navy-900 text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left: Badge & Slide Heading with smooth key animation */}
          <div
            key={`info-${active.id}`}
            className="flex-1 text-center lg:text-left animate-fadeIn"
          >
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-[11px] font-black tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3 h-3" />
                {active.badge}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                {active.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 font-normal line-clamp-2 lg:line-clamp-1 max-w-2xl">
              {active.subtitle}
            </p>
          </div>

          {/* Right: 3 Quick Category CTAs + Slide Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <Link
              href={active.primaryCtaLink}
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {active.primaryCtaText}
            </Link>

            <Link
              href={active.secondaryCtaLink}
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-white hover:bg-gray-100 text-navy-950 font-extrabold text-xs sm:text-sm shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {active.secondaryCtaText}
            </Link>

            <Link
              href={active.tertiaryCtaLink}
              className="inline-flex items-center justify-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {active.tertiaryCtaText}
            </Link>

            {/* Slider Dots & Autoplay toggle */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/15">
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 transition-all duration-300 rounded-full ${
                      idx === activeIndex
                        ? 'w-7 bg-brand-500 shadow-sm'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition"
                title={isPlaying ? 'Pause Autoplay' : 'Play Slideshow'}
                aria-label={isPlaying ? 'Pause Autoplay' : 'Play Slideshow'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
