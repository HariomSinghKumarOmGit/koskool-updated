'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';

interface Slide {
  id: number;
  desktopImage: string;
  mobileImage: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  tertiaryCtaText: string;
  tertiaryCtaLink: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    desktopImage: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',
    mobileImage: '/cdn/shop/files/School-Mobile-Banner_fbefffb6-4e80-496e-83b5-bf4a835d0fad.v_1767783342_width_1000.jpg',
    badge: 'KOSKOOL OFFICIAL 2026',
    title: 'Every Step Begins with KOSKOOL.',
    subtitle: 'Discover school-ready footwear and everyday essentials for every stage of their school journey.',
    primaryCtaText: 'Shop Boys',
    primaryCtaLink: '/collections/boys',
    secondaryCtaText: 'Shop Girls',
    secondaryCtaLink: '/collections/girls',
    tertiaryCtaText: 'Explore Accessories',
    tertiaryCtaLink: '/collections/accessories',
  },
  {
    id: 2,
    desktopImage: '/cdn/shop/files/Sports-Shoe-Web-Banner_934e3fd0-00bd-4c35-a071-b8943d6e32a6.v_1778128141_width_5760.jpg',
    mobileImage: '/cdn/shop/files/Sports-Shoe-Mobile-Web-Banner_69c9e92b-1fbd-4f10-b3ec-b73554dfe45c.v_1778128140_width_1000.jpg',
    badge: 'PT & SPORTS UNIFORM',
    title: 'Built for High-Speed Drills & PT Days.',
    subtitle: 'Non-marking white sports soles with honeycomb shock-absorption for all sports grounds.',
    primaryCtaText: "Boys' Sports",
    primaryCtaLink: '/collections/boys-sports-shoes-middle-wing',
    secondaryCtaText: "Girls' Sports",
    secondaryCtaLink: '/collections/girls-sports-shoes-middle-wing',
    tertiaryCtaText: 'Explore Bags',
    tertiaryCtaLink: '/collections/bags',
  },
  {
    id: 3,
    desktopImage: '/cdn/shop/files/Kids-Banner.v_1768369268_width_5760.jpg',
    mobileImage: '/cdn/shop/files/Kids-Mobile-Banner.v_1768369268_width_1000.jpg',
    badge: 'KINDERGARTEN SPECIAL',
    title: 'Tiny Steps, Sturdy Foundations.',
    subtitle: 'Easy-strap velcro shoes and lightweight bags engineered for nursery & junior students.',
    primaryCtaText: 'Kindergarten Footwear',
    primaryCtaLink: '/collections/kindergarten',
    secondaryCtaText: 'Kids Accessories',
    secondaryCtaLink: '/collections/kids-accessories',
    tertiaryCtaText: 'Junior Bags',
    tertiaryCtaLink: '/collections/kids-school-bags',
  },
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSlide]);

  const active = SLIDES[currentSlide];

  return (
    <div
      className="relative w-full bg-navy-950 select-none overflow-hidden"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Visual Banner Area - 100% clean, no text collision, subjects in forefront */}
      <div className="relative w-full aspect-[1000/1250] md:aspect-[5760/2345] max-h-[82vh] overflow-hidden group">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
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
                  className="w-full h-full object-cover md:object-contain object-center"
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
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 transition-all duration-300 rounded-full ${
                      idx === currentSlide
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
