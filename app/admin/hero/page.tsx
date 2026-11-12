'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Lock,
  ShieldAlert,
  Code2,
  ExternalLink,
  Info,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const HARDCODED_HERO_SLIDES = [
  {
    id: 1,
    badge: 'KOSKOOL OFFICIAL 2026',
    title: 'Every Step Begins with KOSKOOL.',
    subtitle: 'Discover school-ready footwear and everyday essentials for every stage of their school journey.',
    image: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',
    sourceFile: 'components/home/HeroSlideshow.tsx',
    primaryCtaText: 'Shop Boys',
    primaryCtaLink: '/collections/boys',
    secondaryCtaText: 'Shop Girls',
    secondaryCtaLink: '/collections/girls',
    tertiaryCtaText: 'Explore Accessories',
    tertiaryCtaLink: '/collections/accessories',
  },
  {
    id: 2,
    badge: 'PT & SPORTS UNIFORM',
    title: 'Built for High-Speed Drills & PT Days.',
    subtitle: 'Non-marking white sports soles with honeycomb shock-absorption for all sports grounds.',
    image: '/cdn/shop/files/Sports-Shoe-Web-Banner_934e3fd0-00bd-4c35-a071-b8943d6e32a6.v_1778128141_width_5760.jpg',
    sourceFile: 'components/home/HeroSlideshow.tsx',
    primaryCtaText: "Boys' Sports",
    primaryCtaLink: '/collections/boys-sports-shoes-middle-wing',
    secondaryCtaText: "Girls' Sports",
    secondaryCtaLink: '/collections/girls-sports-shoes-middle-wing',
    tertiaryCtaText: 'Explore Bags',
    tertiaryCtaLink: '/collections/bags',
  },
  {
    id: 3,
    badge: 'KINDERGARTEN SPECIAL',
    title: 'Tiny Steps, Sturdy Foundations.',
    subtitle: 'Easy-strap velcro shoes and lightweight bags engineered for nursery & junior students.',
    image: '/cdn/shop/files/Kids-Banner.v_1768369268_width_5760.jpg',
    sourceFile: 'components/home/HeroSlideshow.tsx',
    primaryCtaText: 'Kindergarten Footwear',
    primaryCtaLink: '/collections/kindergarten',
    secondaryCtaText: 'Kids Accessories',
    secondaryCtaLink: '/collections/kids-accessories',
    tertiaryCtaText: 'Junior Bags',
    tertiaryCtaLink: '/collections/kids-school-bags',
  },
];

export default function AdminHeroSectionPage() {
  return (
    <div className="space-y-6">
      {/* Page Title & Explanation Alert */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-black text-navy-950">Hero Section — Locked Products</h1>
        </div>
        <p className="text-xs text-gray-500">
          Inspection view for homepage hero slides and primary uniform showcase assets.
        </p>
      </div>

      {/* Security / Architecture Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 space-y-3 shadow-sm">
        <div className="flex items-center gap-2.5 text-sm font-black text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <span>STATUS: HARD-CODED / SOURCE-CODE LOCKED ASSETS</span>
        </div>

        <p className="text-xs text-amber-800 leading-relaxed">
          These hero slideshow banners and product collections are intentionally hard-coded inside{' '}
          <code className="bg-amber-100 px-2 py-0.5 rounded font-mono font-bold text-amber-950">
            components/home/HeroSlideshow.tsx
          </code>{' '}
          to guarantee high-speed homepage hydration, zero Cumulative Layout Shift (CLS), and protection of the primary KOSKOOL official 2026 uniform branding.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>Admin Modification Disabled</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              Admins cannot accidentally delete, edit, replace, or reorder these assets through this panel.
            </p>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Want Dynamic Promotional Banners?</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              To add and publish editable promotional banners without touching code, use the{' '}
              <Link href="/admin/banners" className="underline font-bold text-brand-600">
                Promotional Board Section →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Locked Slides Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
          Currently Active Hero Slides (Read-Only)
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {HARDCODED_HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row"
            >
              {/* Image Preview with Locked Badge */}
              <div className="lg:w-96 relative bg-navy-950 min-h-[220px] shrink-0 overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover opacity-80"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  <span>Hard-Coded Slide #{slide.id}</span>
                </div>
              </div>

              {/* Slide Meta */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded">
                      {slide.badge}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      File: {slide.sourceFile}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-navy-950">{slide.title}</h3>
                  <p className="text-xs text-gray-600">{slide.subtitle}</p>
                </div>

                {/* Call-to-action buttons configured in code */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-gray-500 mr-1">Code CTA Links:</span>
                  <span className="bg-gray-100 text-navy-950 font-bold px-3 py-1 rounded-lg">
                    {slide.primaryCtaText} ({slide.primaryCtaLink})
                  </span>
                  <span className="bg-gray-100 text-navy-950 font-bold px-3 py-1 rounded-lg">
                    {slide.secondaryCtaText} ({slide.secondaryCtaLink})
                  </span>
                  <span className="bg-gray-100 text-navy-950 font-bold px-3 py-1 rounded-lg">
                    {slide.tertiaryCtaText} ({slide.tertiaryCtaLink})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
