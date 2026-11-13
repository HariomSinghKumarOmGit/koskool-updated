'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import {
  PackageCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  tag: string;
  badge: string;
  price: number;
  originalPrice: number;
  savings: number;
  items: {
    name: string;
    image: string;
    desc: string;
  }[];
  productIds: string[];
}

export default function SchoolBundlesSection() {
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [addedBundles, setAddedBundles] = useState<{ [id: string]: boolean }>({});

  const bundles: Bundle[] = [
    {
      id: 'bundle-uniform-essentials',
      name: 'Complete School Uniform Starter Kit',
      tag: 'Morning Assembly & Class',
      badge: 'Best Value • Save ₹350',
      price: 1399,
      originalPrice: 1749,
      savings: 350,
      items: [
        {
          name: 'Black Formal School Shoes',
          image: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
          desc: 'Scuff-resistant scuff leather with velcro',
        },
        {
          name: 'White PT Sports Trainers',
          image: '/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg',
          desc: 'High-rebound non-marking athletic sole',
        },
        {
          name: 'Combed Cotton School Socks (Pack of 3)',
          image: '/cdn/shop/files/WK473-PINK_KIDS_ea22c13b-148c-4214-8320-c907acb7d395.v_1786512672_width_1600.jpg',
          desc: 'Cushioned heel & arch compression band',
        },
      ],
      productIds: ['ks-b-sch-01', 'ks-b-spt-01', 'ks-g-acc-02'],
    },
    {
      id: 'bundle-classroom-pack',
      name: 'All-Day Classroom & Activity Pack',
      tag: 'Study & Hydration Kit',
      badge: 'Parent Favorite • Save ₹300',
      price: 1499,
      originalPrice: 1799,
      savings: 300,
      items: [
        {
          name: 'Ergonomic Spine-Relief School Bag',
          image: '/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg',
          desc: '32L capacity with heavy book compartments',
        },
        {
          name: 'Stainless Steel Insulated Bottle 750ml',
          image: '/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg',
          desc: 'BPA-free 24-hr temperature insulation',
        },
        {
          name: 'Precision Geometry Instrument Box',
          image: '/cdn/shop/files/WK388-BEIGEPINK-KIDS_b512b642-18fc-430d-b9bf-2420aabca356.v_1786511561_width_1600.jpg',
          desc: 'Non-rust mathematical tool kit',
        },
      ],
      productIds: ['ks-bag-01', 'ks-b-acc-02', 'ks-b-acc-01'],
    },
    {
      id: 'bundle-kindergarten-box',
      name: 'Kindergarten Tiny Steps Box',
      tag: 'Nursery to Prep',
      badge: 'Junior Special • Save ₹250',
      price: 1199,
      originalPrice: 1449,
      savings: 250,
      items: [
        {
          name: 'Junior Easy-Strap Velcro Shoes',
          image: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
          desc: 'Ultra lightweight under 200g with soft flex',
        },
        {
          name: 'Featherlight Junior School Backpack',
          image: '/cdn/shop/files/WK722-MAROON-KIDS.v_1786511451_width_1600.jpg',
          desc: 'Cute character print with padded straps',
        },
        {
          name: 'Anti-Spill Sipper Bottle & Soft Case',
          image: '/cdn/shop/files/WK473-PINK_KIDS_ea22c13b-148c-4214-8320-c907acb7d395.v_1786512672_width_1600.jpg',
          desc: 'Easy-hold grip handle for toddlers',
        },
      ],
      productIds: ['ks-k-sch-01', 'ks-bag-04', 'ks-k-acc-03'],
    },
  ];

  const handleAddBundle = (bundle: Bundle) => {
    // Add all constituent products to cart
    bundle.productIds.forEach((pid) => {
      const prod = PRODUCTS.find((p) => p.id === pid);
      if (prod) {
        addToCart(prod, prod.sizes[0]);
      }
    });

    setAddedBundles((prev) => ({ ...prev, [bundle.id]: true }));
    setTimeout(() => {
      setAddedBundles((prev) => ({ ...prev, [bundle.id]: false }));
    }, 2000);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth < 640 ? 300 : 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="scroll-mt-24 py-12 sm:py-16 bg-navy-950 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title & Left/Right Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-400 bg-brand-950/70 px-3 py-1 rounded-full border border-brand-800">
              <PackageCheck className="w-3.5 h-3.5" />
              Complete School Kits
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              School Bundles &amp; Save More
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Curated combinations that cover footwear, physical training, and classroom needs in one go with up to ₹350 instant discount.
            </p>
          </div>

          <div className="flex lg:hidden items-center gap-2 self-start sm:self-end shrink-0">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-navy-950 flex items-center justify-center transition shadow-sm"
              aria-label="Previous bundle"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-brand-600 bg-brand-600 text-white hover:bg-brand-500 flex items-center justify-center transition shadow-sm"
              aria-label="Next bundle"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Responsive slider on mobile/tablet, balanced 3-column grid on desktop */}
        <div
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible no-scrollbar gap-5 sm:gap-6 pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
        >
          {bundles.map((bundle) => {
            const isAdded = !!addedBundles[bundle.id];

            return (
              <div
                key={bundle.id}
                className="w-[86vw] sm:w-[360px] lg:w-auto flex-shrink-0 snap-start flex flex-col"
              >
                <div className="bg-white/5 border border-white/15 rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full backdrop-blur-md shadow-2xl hover:border-brand-500/50 transition duration-300">
                  <div className="space-y-4">
                    {/* Badge & Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-brand-400 bg-brand-950/80 px-2.5 py-1 rounded-full border border-brand-800">
                        {bundle.tag}
                      </span>
                      <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-full">
                        {bundle.badge}
                      </span>
                    </div>

                    {/* Bundle Title & Price */}
                    <div>
                      <h3 className="text-lg font-black text-white">{bundle.name}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-brand-400">₹{bundle.price}</span>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{bundle.originalPrice}
                        </span>
                        <span className="text-xs text-emerald-400 font-bold ml-1">
                          You save ₹{bundle.savings}
                        </span>
                      </div>
                    </div>

                    {/* Bundle Items Visual List */}
                    <div className="space-y-2.5 pt-2 border-t border-white/10">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Included in this kit (3 items):
                      </p>
                      {bundle.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10"
                        >
                          <div className="w-12 h-12 bg-white/10 rounded-lg relative overflow-hidden shrink-0 flex items-center justify-center">
                            <Image
                              src={it.image}
                              alt={it.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{it.name}</h4>
                            <p className="text-[10px] text-gray-300 truncate">{it.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Bundle Button */}
                  <div className="pt-5 mt-4 border-t border-white/10">
                    <button
                      onClick={() => handleAddBundle(bundle)}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-brand-600 hover:bg-brand-500 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Bundle Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add Entire Bundle (₹{bundle.price})</span>
                        </>
                      )}
                    </button>
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
