'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PRODUCTS, Product } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPreviewProducts } from '@/services/api';

export default function PopularSchoolPicks() {
  const [activeTab, setActiveTab] = useState<
    'all' | 'school-shoes' | 'sports-shoes' | 'fabric-shoes' | 'accessories' | 'bags'
  >('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const tabs = [
    { id: 'all', label: 'All Picks' },
    { id: 'school-shoes', label: 'School Shoes' },
    { id: 'sports-shoes', label: 'Sports & PT' },
    { id: 'fabric-shoes', label: 'Canvas & Fabric' },
    { id: 'bags', label: 'School Bags' },
    { id: 'accessories', label: 'Accessories' },
  ];

  // Load preview products with minimal images to save Supabase egress & client memory
  const [products, setProducts] = useState<Product[]>(() => {
    return PRODUCTS.filter((p) => p.isPopular).slice(0, 10);
  });

  useEffect(() => {
    let isMounted = true;
    const fetchItems = () => {
      getPreviewProducts({
        filter: 'all',
        category: activeTab === 'all' ? 'all' : activeTab,
        limit: 12,
      }).then((items) => {
        if (isMounted && items && items.length > 0) {
          setProducts(items);
        }
      });
    };

    fetchItems();

    window.addEventListener('koskool_products_updated', fetchItems);
    window.addEventListener('storage', fetchItems);

    return () => {
      isMounted = false;
      window.removeEventListener('koskool_products_updated', fetchItems);
      window.removeEventListener('storage', fetchItems);
    };
  }, [activeTab]);

  const filteredProducts = products;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth < 640 ? 260 : 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="scroll-mt-24 py-12 sm:py-16 bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 space-y-2 max-w-2xl text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-950 tracking-tight">
            Popular School Picks
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            The most sought-after school shoes, drill canvas, sports trainers, and classroom essentials across India.
          </p>
        </div>

        {/* Interactive Filtering Tabs - Wrapping naturally, zero horizontal scroll */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl transition ${
                activeTab === tab.id
                  ? 'bg-navy-950 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Clean 2-Column Responsive Grid on Mobile - Zero Horizontal Scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <div key={product.id} className="w-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
