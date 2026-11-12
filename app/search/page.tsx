'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS, Product } from '@/data/products';
import CategoryTemplate from '@/components/product/CategoryTemplate';
import { Search } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    if (!query.trim()) {
      return PRODUCTS;
    }
    const q = query.toLowerCase().trim();
    return PRODUCTS.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.schoolLevel.some((lvl) => lvl.toLowerCase().includes(q)) ||
        p.colours.some((c) => c.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative max-w-xl mx-auto mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search school shoes, sports trainers, backpacks, bottles..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full pl-12 pr-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f05a50]"
          />
        </div>
      </div>

      <CategoryTemplate
        title={query ? `Search results for "${query}"` : 'All Products Catalog'}
        subtitle={`Showing ${results.length} verified products available for direct school delivery`}
        category="Catalog Search"
        badge="Catalog Search"
        products={results}
        showBanner={false}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading catalog...</div>}>
      <SearchContent />
    </Suspense>
  );
}
