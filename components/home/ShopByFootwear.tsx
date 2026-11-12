'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function ShopByFootwear() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const categories = [
    {
      id: 'school-shoes',
      title: 'School Shoes',
      subtitle: 'Uniform-ready black & white formal shoes engineered with scuff-resistant leather and anti-skid grip.',
      image: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
      tag: 'Morning Assembly Ready',
      href: '/collections/school-shoes',
      features: ['Velcro & Lace-Up', 'Cushioned Insoles', 'Scuff Resistant'],
      startingPrice: '₹499',
    },
    {
      id: 'sports-shoes',
      title: 'PT & Sports Shoes',
      subtitle: 'All-white PT & athletic sneakers designed for playground speed, drill days, and physical training.',
      image: '/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg',
      tag: 'PT & Games Approved',
      href: '/collections/sports-shoes',
      features: ['Honeycomb Air-Mesh', 'Non-Marking Soles', 'EVA Cushioning'],
      startingPrice: '₹549',
    },
    {
      id: 'fabric-shoes',
      title: 'Fabric & Canvas Shoes',
      subtitle: 'Pure cotton vulcanized canvas shoes built for drill exercises, march pasts, and summer breathability.',
      image: '/cdn/shop/files/WE1356-Black_3dd08639-1ba0-4c08-86fb-b5ddf6184a12.v_1781172079_width_1600.jpg',
      tag: 'Drill & Summer Comfort',
      href: '/collections/fabric-shoes',
      features: ['Washable Canvas', 'Flexible Gum Sole', 'Cool Airflow'],
      startingPrice: '₹399',
    },
    {
      id: 'girls-ballerinas',
      title: 'Girls Uniform Ballerinas',
      subtitle: 'Classic Mary Jane slip-ons with secure buckle/velcro straps and memory foam footbed for all-day comfort.',
      image: '/cdn/shop/files/WG328-Black_2_c10bf7d3-ff4d-45f8-8bb3-4ca2fb62bc12.v_1781172151_width_1600.jpg',
      tag: 'Girls Daily Assembly',
      href: '/collections/girls',
      features: ['Padded Collar', 'Arch Support', 'Non-Slip Sole'],
      startingPrice: '₹449',
    },
    {
      id: 'kindergarten-velcro',
      title: 'Junior Easy-Strap Shoes',
      subtitle: 'Super lightweight self-fastening velcro shoes designed specifically for nursery and kindergarten students.',
      image: '/cdn/shop/files/WV501-White_0ff19875-a8fa-4a33-8a3d-4c312759e697.v_1786513303_width_1600.jpg',
      tag: 'Early Steps Special',
      href: '/collections/kindergarten',
      features: ['Dual Velcro', 'Under 200g Weight', 'Toe Protection'],
      startingPrice: '₹429',
    },
  ];

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
    <section className="py-12 sm:py-16 bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Left & Right Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="text-left space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              <Sparkles className="w-3.5 h-3.5" />
              Footwear Essentials
            </div>
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
                  <span className="absolute top-4 left-4 bg-navy-950/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                    {cat.tag}
                  </span>

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
                    <div className="flex flex-wrap gap-1.5 max-w-[75%]">
                      {cat.features.slice(0, 2).map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
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
