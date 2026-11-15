'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { Product, PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import {
  getBannerShowcaseSections,
  BannerShowcaseSection,
  DEFAULT_BANNER_SHOWCASE_SECTIONS,
  getAllCatalogProducts,
} from '@/services/api';

function BannerProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes[0] || '7');
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  const imageSrc =
    product.images[0] ||
    '/cdn/shop/files/WGP53410-TAN-GENTS_7608173e-b30c-4214-ad1d-02182418d1a2.v_1786511338_width_1600.jpg';

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Area with Floating Rating & Red Cart Button */}
      <div className="relative aspect-square bg-[#fbfbfb] p-3 sm:p-4 overflow-hidden">
        {/* Top-Right Star Rating Pill */}
        {product.rating && (
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm border border-gray-100 shadow-sm text-[10px] sm:text-[11px] font-bold text-gray-800">
            <Star className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Product Photo Link */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-full h-full flex items-center justify-center block"
          title={`View ${product.name}`}
        >
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Floating Red Circular Add to Cart Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className={`absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 ${
            added ? 'bg-emerald-600' : 'bg-brand-600 hover:bg-brand-500'
          }`}
          title={added ? 'Added to Cart' : 'Add to Cart'}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? (
            <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          ) : (
            <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>

      {/* Product Details */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-1 sm:gap-1.5">
        <div>
          {/* Brand Header */}
          <span className="text-[9px] sm:text-[11px] font-black uppercase text-gray-400 tracking-wider">
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
  const [sections, setSections] = useState<BannerShowcaseSection[]>(DEFAULT_BANNER_SHOWCASE_SECTIONS);
  const [catalog, setCatalog] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    let isMounted = true;

    async function loadBannerSections() {
      try {
        const [loadedSections, prods] = await Promise.all([
          getBannerShowcaseSections(),
          getAllCatalogProducts(),
        ]);
        if (isMounted) {
          if (loadedSections && loadedSections.length > 0) {
            setSections(loadedSections);
          }
          if (prods && prods.length > 0) {
            setCatalog(prods);
          }
        }
      } catch (err) {
        console.error('Failed to load banner showcase sections:', err);
      }
    }

    loadBannerSections();

    const handleUpdate = () => {
      loadBannerSections();
    };

    window.addEventListener('koskool_banner_showcase_updated', handleUpdate);
    window.addEventListener('koskool_products_updated', handleUpdate);
    window.addEventListener('koskool_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('koskool_banner_showcase_updated', handleUpdate);
      window.removeEventListener('koskool_products_updated', handleUpdate);
      window.removeEventListener('koskool_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const activeSections = sections
    .filter((sec) => sec.is_active !== false)
    .sort((a, b) => a.display_order - b.display_order);

  if (activeSections.length === 0) return null;

  return (
    <div className="w-full space-y-12 sm:space-y-16 py-8">
      {activeSections.map((section) => {
        // Resolve products from catalog matching assigned productIds in order
        const sectionProducts = section.productIds
          .map((id) => catalog.find((p) => p.id === id || p.slug === id))
          .filter(Boolean) as Product[];

        // Honor gridRows setting (1 row = up to 4, 2 rows = up to 8, or all)
        const displayLimit =
          section.gridRows === 1 ? 4 : section.gridRows === 2 ? 8 : sectionProducts.length;
        const productsToRender = sectionProducts.slice(0, displayLimit);

        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 1. Promotional Banner Card (Clean, Full Forefront, Zero Text Parallax) */}
            <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Link
                href={section.bannerLink || '#'}
                className="block relative aspect-[1000/500] sm:aspect-[5760/2345] w-full"
                title={section.bannerAlt || section.title}
              >
                <picture className="w-full h-full block">
                  <source media="(max-width: 640px)" srcSet={section.bannerMobile || section.bannerDesktop} />
                  <img
                    src={section.bannerDesktop}
                    alt={section.bannerAlt || section.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </picture>
              </Link>
            </div>

            {/* 2. Responsive Product Grid (4 items per row on Desktop, 2 on Mobile - neatly forming 2 rows when 8 products) */}
            {productsToRender.length > 0 && (
              <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {productsToRender.map((product) => (
                  <BannerProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
