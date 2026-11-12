'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Check, ChevronRight } from 'lucide-react';
import { Product, PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';

interface SectionConfig {
  id: string;
  bannerDesktop: string;
  bannerMobile: string;
  bannerAlt: string;
  bannerLink: string;
  productIds: string[];
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'bounceez',
    bannerDesktop: '/cdn/shop/files/Bounceez-Web-Banner-4_94081796-b190-48a0-a99c-0b229a04a5c0.v_1772773040_width_5760.jpg',
    bannerMobile: '/cdn/shop/files/Bounceez-Mobile-Banner-landscape_a1472114-8617-4595-ad17-ba9ae43b7635.v_1772773044_width_1000.jpg',
    bannerAlt: 'Bounceez - A Perfect Cushion For Your Foot',
    bannerLink: '/collections/walkaroo-bounceez',
    productIds: ['wgp53283-tan', 'wgr53350-olive', 'wgp53283-black', 'wgr53512-olive'],
  },
  {
    id: 'bloomsy',
    bannerDesktop: '/cdn/shop/files/Bloomsy-Web-Banner_47afcd51-e579-4b9f-a174-6a95c1fa1213.v_1781954684_width_5760.jpg',
    bannerMobile: '/cdn/shop/files/Bloomsy-Mobile-Banner-landscape_75038556-3611-48b3-8b03-a433059825ee.v_1781954947_width_1000.jpg',
    bannerAlt: 'Bloom-Ready Every Day - Walkaroo Bloomsy Collection',
    bannerLink: '/collections/bloomsy-collection',
    productIds: ['wle74035-mauve', 'wlr74019-green', 'wlr74019-plum', 'wle74035-black'],
  },
];

function BannerProductCard({ product }: { product: Product }) {
  const { addToCart, openCartDrawer } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0] || '7');
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCartDrawer();
    }, 600);
  };

  const imageSrc = product.images[0] || '/cdn/shop/files/WGP53410-TAN-GENTS_7608173e-b30c-4214-ad1d-02182418d1a2.v_1786511338_width_1600.jpg';

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Area with Floating Rating & Red Cart Button */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square bg-[#fbfbfb] p-4 overflow-hidden"
      >
        {/* Top-Right Star Rating Pill (Exact design from user screenshot) */}
        {product.rating && (
          <div className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm border border-gray-100 shadow-sm text-[11px] font-bold text-gray-800">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Product Photo */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Floating Red Circular Add to Cart Button (Exact design from user screenshot) */}
        <button
          onClick={handleQuickAdd}
          className={`absolute bottom-2.5 right-2.5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 ${
            added ? 'bg-emerald-600' : 'bg-brand-600 hover:bg-brand-500'
          }`}
          title={added ? 'Added to Cart' : 'Add to Cart'}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </Link>

      {/* Product Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          {/* Brand Header */}
          <span className="text-[10px] sm:text-[11px] font-black uppercase text-gray-400 tracking-wider">
            {product.brand}
          </span>

          {/* Product Name */}
          <Link
            href={`/products/${product.slug}`}
            className="block mt-0.5 text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        {/* Price */}
        <div className="pt-1 flex items-baseline gap-1">
          <span className="text-xs sm:text-sm font-extrabold text-gray-950">
            {product.price ? `From ₹ ${product.price.toFixed(2)}` : '₹ 479.00'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BannerSectionShowcase() {
  return (
    <div className="w-full space-y-12 sm:space-y-16 py-8">
      {SECTIONS.map((section) => {
        // Resolve products from PRODUCTS list
        const sectionProducts = section.productIds
          .map((id) => PRODUCTS.find((p) => p.id === id))
          .filter(Boolean) as Product[];

        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 1. Promotional Banner Card (Clean, Full Forefront, Zero Text Parallax) */}
            <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Link
                href={section.bannerLink}
                className="block relative aspect-[1000/500] sm:aspect-[5760/2345] w-full"
                title={section.bannerAlt}
              >
                <picture className="w-full h-full block">
                  <source media="(max-width: 640px)" srcSet={section.bannerMobile} />
                  <img
                    src={section.bannerDesktop}
                    alt={section.bannerAlt}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </picture>
              </Link>
            </div>

            {/* 2. Responsive Product Grid (4 items on Desktop, 2 on Mobile) */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {sectionProducts.map((product) => (
                <BannerProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
