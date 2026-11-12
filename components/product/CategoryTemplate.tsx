'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/data/products';
import {
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Check,
} from 'lucide-react';

export interface CategoryTemplateProps {
  title: string;
  subtitle: string;
  category?: string;
  badge?: string;
  products: Product[];
  showBanner?: boolean;
}

export default function CategoryTemplate({
  title,
  subtitle,
  category = 'Collection',
  badge = 'Official Walkaroo & KOSKOOL',
  products: baseProducts,
  showBanner = true,
}: CategoryTemplateProps) {
  // Drawer open state (smooth left-to-right transition)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Active subcategory tab
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');

  // Accordion section states inside filter drawer
  const [accordionState, setAccordionState] = useState<{ [key: string]: boolean }>({
    size: true,
    colour: true,
    price: true,
  });

  const toggleAccordion = (key: string) => {
    setAccordionState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter states
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(2500);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Dynamically compute subcategories with accurate live counts
  const subcategories = useMemo(() => {
    const counts: Record<string, number> = {};

    baseProducts.forEach((p) => {
      // Group by productType or schoolLevel or category
      if (p.productType === 'school-shoes') counts['School Shoes'] = (counts['School Shoes'] || 0) + 1;
      else if (p.productType === 'sports-shoes') counts['Sports & PT'] = (counts['Sports & PT'] || 0) + 1;
      else if (p.productType === 'fabric-shoes') counts['Canvas & Fabric'] = (counts['Canvas & Fabric'] || 0) + 1;
      else if (p.productType === 'bags') counts['School Bags'] = (counts['School Bags'] || 0) + 1;
      else if (p.productType === 'accessories') counts['Accessories'] = (counts['Accessories'] || 0) + 1;
      else {
        const sub = p.subcategory || 'Footwear';
        counts[sub] = (counts[sub] || 0) + 1;
      }
    });

    const list = [
      { id: 'all', label: 'All Items', count: baseProducts.length },
    ];

    Object.entries(counts).forEach(([label, count]) => {
      list.push({ id: label, label, count });
    });

    // If only 1 category exists, sub-divide by school wing if available
    if (list.length <= 2) {
      const wingCounts: Record<string, number> = {};
      baseProducts.forEach((p) => {
        p.schoolLevel.forEach((lvl) => {
          const formatted = lvl.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          wingCounts[formatted] = (wingCounts[formatted] || 0) + 1;
        });
      });
      if (Object.keys(wingCounts).length > 1) {
        const wingList = [{ id: 'all', label: 'All Items', count: baseProducts.length }];
        Object.entries(wingCounts).forEach(([label, count]) => {
          wingList.push({ id: label, label, count });
        });
        return wingList;
      }
    }

    return list;
  }, [baseProducts]);

  // Extract available sizes with live counts from this collection
  const sizeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    baseProducts.forEach((p) => {
      p.sizes.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });

    // Order logically
    const allKnown = ['9C', '10C', '11C', '12C', '13C', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Standard'];
    const present = Object.keys(counts);
    const sorted = allKnown.filter((s) => present.includes(s));
    present.forEach((s) => {
      if (!sorted.includes(s)) sorted.push(s);
    });

    return sorted.map((sz) => ({
      size: sz,
      count: counts[sz] || 0,
    }));
  }, [baseProducts]);

  // Extract available colours present in this collection
  const colourPalette = useMemo(() => {
    const defaultPalette = [
      { name: 'Black', hex: '#111827' },
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Tan', hex: '#D29054' },
      { name: 'Brown', hex: '#633B18' },
      { name: 'Navy', hex: '#1E3A8A' },
      { name: 'Blue', hex: '#3B82F6' },
      { name: 'Olive', hex: '#556B2F' },
      { name: 'Grey', hex: '#9CA3AF' },
      { name: 'Maroon', hex: '#800000' },
      { name: 'Pink', hex: '#F472B6' },
    ];

    // Filter to colours that exist in baseProducts if possible
    const presentColours = new Set<string>();
    baseProducts.forEach((p) => {
      p.colours.forEach((c) => presentColours.add(c.toLowerCase()));
      if (p.primaryColour) presentColours.add(p.primaryColour.toLowerCase());
    });

    const matched = defaultPalette.filter((c) => presentColours.has(c.name.toLowerCase()));
    return matched.length >= 3 ? matched : defaultPalette;
  }, [baseProducts]);

  // Filter application
  const filteredProducts = useMemo(() => {
    return baseProducts
      .filter((p) => {
        // Subcategory tab filter
        if (activeSubcategory !== 'all') {
          const typeMatch =
            (activeSubcategory === 'School Shoes' && p.productType === 'school-shoes') ||
            (activeSubcategory === 'Sports & PT' && p.productType === 'sports-shoes') ||
            (activeSubcategory === 'Canvas & Fabric' && p.productType === 'fabric-shoes') ||
            (activeSubcategory === 'School Bags' && p.productType === 'bags') ||
            (activeSubcategory === 'Accessories' && p.productType === 'accessories') ||
            (p.subcategory === activeSubcategory);

          const wingMatch = p.schoolLevel.some((lvl) => {
            const formatted = lvl.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            return formatted.toLowerCase() === activeSubcategory.toLowerCase();
          });

          if (!typeMatch && !wingMatch) {
            return false;
          }
        }

        // Size filter
        if (selectedSizes.length > 0) {
          const hasSize = p.sizes.some((s) => selectedSizes.includes(s));
          if (!hasSize) return false;
        }

        // Colour filter
        if (selectedColours.length > 0) {
          const hasColour = p.colours.some((c) =>
            selectedColours.some((sc) => sc.toLowerCase() === c.toLowerCase())
          );
          if (!hasColour) return false;
        }

        // Price filter
        if (p.price < priceMin || p.price > priceMax) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      });
  }, [baseProducts, activeSubcategory, selectedSizes, selectedColours, priceMin, priceMax, sortBy]);

  const activeFiltersCount =
    selectedSizes.length + selectedColours.length + (priceMax < 2500 || priceMin > 0 ? 1 : 0);

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const toggleColour = (col: string) => {
    setSelectedColours((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const resetAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColours([]);
    setPriceMin(0);
    setPriceMax(2500);
    setSortBy('featured');
    setActiveSubcategory('all');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-600 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-gray-400 capitalize">{category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="font-semibold text-gray-800">{title}</span>
        </nav>

        {/* 1. Category Hero Banner Above */}
        {showBanner && (
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-8 sm:p-12 shadow-sm">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#f07167] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                <Sparkles className="w-3 h-3 text-[#f07167]" />
                {badge}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
                {subtitle}
              </p>
            </div>
            <div className="absolute -right-12 -bottom-12 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
          </div>
        )}

        {/* 2. Category Title Heading */}
        <div className="pt-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
        </div>

        {/* 3. Filter Action Bar (Matching Image 1) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-gray-100">
          
          {/* Left: "Show filters" Pill Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#f05a50] text-[#f05a50] hover:bg-[#fff5f5] px-5 py-2 text-xs font-bold transition shadow-sm"
              aria-label="Open Filters Drawer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Show filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#f05a50] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Middle: Sub-category filter pills / links with item counts in superscript */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1">
            {subcategories.map((sub, idx) => {
              const isActive = activeSubcategory === sub.id;
              return (
                <React.Fragment key={sub.id}>
                  <button
                    onClick={() => setActiveSubcategory(sub.id)}
                    className={`text-xs sm:text-sm whitespace-nowrap transition-all ${
                      isActive
                        ? 'font-bold text-gray-950 border-b-2 border-gray-950 pb-0.5'
                        : 'font-medium text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>{sub.label}</span>
                    <sup className="text-[10px] font-bold ml-0.5 text-gray-500">
                      {sub.count}
                    </sup>
                  </button>
                  {idx < subcategories.length - 1 && (
                    <span className="text-gray-300 font-light select-none">/</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Right: Sort by Dropdown Pill */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-[#f05a50] text-gray-800 text-xs font-semibold rounded-full pl-5 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#f05a50] cursor-pointer shadow-sm"
              >
                <option value="featured">Featured •</option>
                <option value="popular">Best selling</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="rating">Top rated</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#f05a50]">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>

        {/* 4. Product Cards Grid (Matching Image 1: 4 columns on desktop) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">No products match your filters</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Try selecting different sizes or colors, or reset your filters to see all available products.
              </p>
            </div>
            <button
              onClick={resetAllFilters}
              className="bg-gray-950 hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-full shadow transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="block relative aspect-square bg-[#fbfbfb] rounded-2xl overflow-hidden border border-gray-100 p-4 transition-transform group-hover:scale-[1.02]"
                >
                  <Image
                    src={product.images[0] || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.discountPercent && (
                    <span className="absolute top-3 left-3 bg-[#e86b62] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </Link>

                <div className="pt-3 pb-1 space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-gray-600 font-bold block">
                    {product.brand}
                  </span>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition line-clamp-1 block"
                  >
                    {product.name}
                  </Link>
                  <div className="text-xs sm:text-sm font-bold text-gray-950 pt-0.5">
                    ₹ {product.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* 5. SLIDE-OVER FILTERS DRAWER (Matching Image 2: Slides Left to Right) */}
      {/* =================================================================== */}
      {/* Dark overlay backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isFilterDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsFilterDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel: Moving smoothly from Left to Right */}
      <div
        className={`fixed inset-y-0 left-0 max-w-sm sm:max-w-md w-full bg-white z-50 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isFilterDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter Options"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-950">Filters</h2>
          <button
            onClick={() => setIsFilterDrawerOpen(false)}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:border-gray-400 transition"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Sort By Container */}
          <div className="bg-[#f9fafb] p-3 rounded-2xl border border-gray-100">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-gray-900 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="popular">Best selling</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {/* Section 1: Size */}
          {sizeCounts.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleAccordion('size')}
                className="w-full flex items-center justify-between text-left font-bold text-base text-gray-900 pb-3"
              >
                <span>Size</span>
                {accordionState.size ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {accordionState.size && (
                <div className="space-y-2.5 pt-1 pl-1">
                  {sizeCounts.map((item) => {
                    const isChecked = selectedSizes.includes(item.size);
                    return (
                      <label
                        key={item.size}
                        className="flex items-center gap-3 cursor-pointer group text-sm text-gray-800"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSize(item.size)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-950 focus:ring-0 cursor-pointer"
                        />
                        <span className="group-hover:text-black">
                          {item.size} <span className="text-gray-400">({item.count})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Colour */}
          {colourPalette.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleAccordion('colour')}
                className="w-full flex items-center justify-between text-left font-bold text-base text-gray-900 pb-3"
              >
                <span>Colour</span>
                {accordionState.colour ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {accordionState.colour && (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {colourPalette.map((col) => {
                    const isSelected = selectedColours.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => toggleColour(col.name)}
                        className={`w-9 h-9 rounded-md transition-all relative flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-black ring-offset-2' : 'hover:scale-105 border border-gray-200'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                        aria-label={`Filter by ${col.name}`}
                      >
                        {isSelected && (
                          <Check
                            className={`w-4 h-4 ${
                              ['Black', 'Brown', 'Navy', 'Olive', 'Maroon'].includes(col.name)
                                ? 'text-white'
                                : 'text-black'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Price */}
          <div className="border-t border-gray-100 pt-4 pb-4">
            <button
              onClick={() => toggleAccordion('price')}
              className="w-full flex items-center justify-between text-left font-bold text-base text-gray-900 pb-3"
            >
              <span>Price</span>
              {accordionState.price ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {accordionState.price && (
              <div className="space-y-4 pt-2">
                <input
                  type="range"
                  min="0"
                  max="2500"
                  step="50"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>₹ {priceMin}</span>
                  <span className="font-bold text-black">Up to ₹ {priceMax}</span>
                  <span>₹ 2500</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Drawer Sticky Bottom Footer */}
        <div className="p-6 pt-3 border-t border-gray-100 bg-white space-y-2">
          <button
            onClick={() => setIsFilterDrawerOpen(false)}
            className="w-full bg-[#111827] hover:bg-black text-white font-bold py-3.5 px-6 rounded-full shadow-lg transition text-center tracking-wide text-sm"
          >
            Apply
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="w-full text-center text-xs text-gray-500 hover:text-black font-semibold py-1 transition"
            >
              Clear All Filters
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
