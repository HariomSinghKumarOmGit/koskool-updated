'use client';

import React, { useRef } from 'react';
import {
  Star,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function SchoolTrustReviews() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const reviews = [
    {
      id: 'rev-1',
      name: 'Sunita Mehra',
      location: 'Rohini, New Delhi',
      school: "St. Xavier's Senior Secondary School",
      student: 'Mother of Aarav (Class 5)',
      rating: 5,
      review:
        'The scuff-resistant black shoes have lasted an entire school term without peeling at the toe. The velcro grip is strong and saves morning assembly hassle.',
      verified: 'Verified School Buyer',
    },
    {
      id: 'rev-2',
      name: 'Rajesh Kulkarni',
      location: 'Pune, Maharashtra',
      school: 'Delhi Public School (DPS)',
      student: 'Father of Ananya (Class 2)',
      rating: 5,
      review:
        'Ordered the PT white trainers and water bottle bundle. The honeycomb sole has incredible grip on the basketball court and drill grounds.',
      verified: 'Verified School Buyer',
    },
    {
      id: 'rev-3',
      name: 'Dr. Neha Verma',
      location: 'Bengaluru, Karnataka',
      school: 'National Public School (NPS)',
      student: 'Mother of Kabir (Kindergarten)',
      rating: 5,
      review:
        'Finding genuine orthopedic lightweight shoes for nursery was tough until we found Koskool. The cushion support prevents heel pain after long school days.',
      verified: 'Verified School Buyer',
    },
    {
      id: 'rev-4',
      name: 'Vikram Singhal',
      location: 'Jaipur, Rajasthan',
      school: "St. Anselm's Pink City School",
      student: 'Father of Dev (Class 9)',
      rating: 5,
      review:
        'Prompt factory dispatch directly from Delhi. Applied the coupon code in cart and got 15% discount. Quality is far superior to local retail stores.',
      verified: 'Verified School Buyer',
    },
  ];

  const pillars = [
    {
      icon: Award,
      title: 'CBSE & ICSE Compliant',
      desc: 'Formulated to meet strict all-India school dress codes and uniform color standards.',
    },
    {
      icon: ShieldCheck,
      title: 'Orthopedic Spine & Arch Support',
      desc: 'EVA shock-absorbing soles and ergonomic back padding designed for growing children.',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Size Exchange',
      desc: 'Free door-to-door shoe size exchange guarantee if the fit is not 100% perfect.',
    },
    {
      icon: Truck,
      title: 'Delhi Factory Direct Dispatch',
      desc: 'Dispatched directly from Bawana Industrial Area with verified WhatsApp tracking.',
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth < 640 ? 280 : 360;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 flex flex-col justify-between space-y-2 hover:border-brand-300 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center border border-gray-200 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-navy-950">{pillar.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Parent & School Reviews with Left/Right Arrows */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
                Trusted by 50,000+ Indian Parents &amp; Schools
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Hear from families across Delhi NCR, Mumbai, Bengaluru, and Pune who rely on Koskool every morning.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-gray-300 bg-white text-navy-950 hover:bg-navy-950 hover:text-white flex items-center justify-center transition shadow-sm"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-navy-950 bg-navy-950 text-white hover:bg-brand-600 hover:border-brand-600 flex items-center justify-center transition shadow-sm"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar gap-5 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
          >
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="w-[84vw] sm:w-[320px] md:w-[360px] flex-shrink-0 snap-start"
              >
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition space-y-4">
                  <div className="space-y-3">
                    {/* Stars */}
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-500 gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {rev.verified}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed italic">
                      &ldquo;{rev.review}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200/80">
                    <h4 className="text-xs font-black text-navy-950">{rev.name}</h4>
                    <p className="text-[11px] text-brand-600 font-semibold">{rev.student}</p>
                    <p className="text-[10px] text-gray-500">{rev.school} • {rev.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
