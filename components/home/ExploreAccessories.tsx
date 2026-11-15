'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function ExploreAccessories() {
  const cards = [
    {
      title: 'Boys Accessories',
      subtitle: 'Geometry instrument boxes, steel bottles, rain covers, and heavy shoe care kits.',
      image: '/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg',
      badge: 'Practical & Sturdy',
      href: '/collections/boys-accessories',
      items: ['Mathematical Geometry Box', 'Insulated Stainless Steel Bottle', 'Shoe Polish & Care Kit'],
    },
    {
      title: 'Girls Accessories',
      subtitle: 'Uniform-matched satin ribbons, cotton cushion socks, multi-tier hardtop pencil cases.',
      image: '/cdn/shop/files/WK473-PINK_KIDS_ea22c13b-148c-4214-8320-c907acb7d395.v_1786512672_width_1600.jpg',
      badge: 'Uniform Approved',
      href: '/collections/girls-accessories',
      items: ['Satin Hair Ribbons & Bands', 'Combed Cotton School Socks', 'Hardtop Pencil Cases'],
    },
    {
      title: 'Kids Accessories',
      subtitle: 'Sun-protective uniform caps, dust masks, easy-grip sippers, and soft pencil pouches.',
      image: '/cdn/shop/files/WK388-BEIGEPINK-KIDS_b512b642-18fc-430d-b9bf-2420aabca356.v_1786511561_width_1600.jpg',
      badge: 'Junior Learners',
      href: '/collections/kids-accessories',
      items: ['Sun-Shield Sports Cap', 'Breathable Protective Mask', 'Drop-Proof Pencil Case'],
    },
  ];

  return (
    <section className="scroll-mt-24 py-12 sm:py-16 bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="text-left space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
              Explore Accessories
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Carefully curated, school-appropriate essentials that keep students prepared, organized, and confident.
            </p>
          </div>
        </div>

        {/* Clean Responsive Grid - Zero Horizontal Scroll on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((card, idx) => (
            <div key={idx} className="w-full">
              <Link
                href={card.href}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                <div className="relative h-48 sm:h-56 bg-slate-100 overflow-hidden flex items-center justify-center p-4">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-base sm:text-xl font-black text-navy-950 group-hover:text-brand-600 transition">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-950 group-hover:text-brand-600 transition">
                      View Accessories
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
