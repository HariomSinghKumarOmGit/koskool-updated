'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProductsByCollection, getCollectionTitle, PRODUCTS, Product } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import ProductFilters, { FilterState } from '@/components/product/ProductFilters';
import { ChevronRight, SlidersHorizontal, ArrowUpDown, X, Sparkles } from 'lucide-react';

export default function CollectionPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'all';

  const collectionInfo = getCollectionTitle(slug);
  const baseProducts = useMemo(() => getProductsByCollection(slug), [slug]);

  // Determine mode
  const mode = useMemo(() => {
    if (slug.includes('accessories')) return 'accessories';
    if (slug.includes('bag')) return 'bags';
    if (slug.includes('shoes') || slug.includes('boys') || slug.includes('girls') || slug.includes('wing') || slug.includes('kindergarten')) {
      return 'footwear';
    }
    return 'all';
  }, [slug]);

  // Extract unique available sizes and colours from base collection
  const availableSizes = useMemo(() => {
    const s = new Set<string>();
    baseProducts.forEach((p) => p.sizes.forEach((sz) => s.add(sz)));
    return Array.from(s);
  }, [baseProducts]);

  const availableColours = useMemo(() => {
    const c = new Set<string>();
    baseProducts.forEach((p) => p.colours.forEach((col) => c.add(col)));
    return Array.from(c);
  }, [baseProducts]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    schoolLevel: [],
    productType: [],
    sizes: [],
    colours: [],
    priceRange: '',
    sortBy: 'popular',
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Apply filters
  const filteredProducts = useMemo(() => {
    return baseProducts.filter((product) => {
      // Gender filter
      if (filters.gender.length > 0) {
        if (!filters.gender.includes(product.gender) && product.gender !== 'unisex') {
          return false;
        }
      }

      // School level filter
      if (filters.schoolLevel.length > 0) {
        const matchesLevel = product.schoolLevel.some((lvl) => filters.schoolLevel.includes(lvl));
        if (!matchesLevel) return false;
      }

      // Product type filter
      if (filters.productType.length > 0) {
        if (!filters.productType.includes(product.productType)) return false;
      }

      // Sizes filter
      if (filters.sizes.length > 0) {
        const matchesSize = product.sizes.some((sz) => filters.sizes.includes(sz));
        if (!matchesSize) return false;
      }

      // Colours filter
      if (filters.colours.length > 0) {
        const matchesColour = product.colours.some((col) => filters.colours.includes(col));
        if (!matchesColour) return false;
      }

      // Price range filter
      if (filters.priceRange) {
        if (filters.priceRange === 'under-500' && product.price >= 500) return false;
        if (filters.priceRange === '500-800' && (product.price < 500 || product.price > 800)) return false;
        if (filters.priceRange === '800-1200' && (product.price < 800 || product.price > 1200)) return false;
        if (filters.priceRange === 'above-1200' && product.price < 1200) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.price - b.price;
      if (filters.sortBy === 'price-high') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      return b.reviewCount - a.reviewCount; // default popular
    });
  }, [baseProducts, filters]);

  const handleResetFilters = () => {
    setFilters({
      gender: [],
      schoolLevel: [],
      productType: [],
      sizes: [],
      colours: [],
      priceRange: '',
      sortBy: 'popular',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-600 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-400">{collectionInfo.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-navy-950">{collectionInfo.title}</span>
        </nav>

        {/* Collection Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 inline-block">
              {collectionInfo.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight">
              {collectionInfo.title}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              {collectionInfo.subtitle}
            </p>
          </div>

          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-brand-50 to-transparent pointer-events-none hidden sm:block" />
        </div>

        {/* Action Bar (Total Count, Mobile Filter Trigger, Sort Dropdown) */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-950 text-white text-xs font-bold shadow transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
            <span className="text-xs font-bold text-gray-700">
              Showing <strong className="text-navy-950">{filteredProducts.length}</strong> items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-gray-500 hidden sm:inline-block font-medium">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-navy-950 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="popular">Popular School Picks</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Main Grid: Filters Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-28">
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              availableSizes={availableSizes}
              availableColours={availableColours}
              mode={mode}
            />
          </div>

          {/* Product Cards Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-950">No products match the selected filters</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                    Try adjusting size, school level or price range filters to view more school options.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-in Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative w-full max-w-xs bg-white h-full overflow-y-auto p-5 z-10 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-base text-navy-950">Filter Products</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProductFilters
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
                availableSizes={availableSizes}
                availableColours={availableColours}
                mode={mode}
              />
            </div>

            <div className="pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-brand-600 text-white text-xs font-bold py-3 rounded-xl shadow"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
