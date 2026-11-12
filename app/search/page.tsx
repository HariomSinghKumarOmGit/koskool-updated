'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS, Product } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import { Search, Sparkles } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(PRODUCTS);
      return;
    }
    const q = query.toLowerCase().trim();
    const filtered = PRODUCTS.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.schoolLevel.some((lvl) => lvl.toLowerCase().includes(q)) ||
        p.colours.some((c) => c.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    });
    setResults(filtered);
  }, [query]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            <Sparkles className="w-3.5 h-3.5" />
            School Catalog Search
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-950">
            Search KOSKOOL School Products
          </h1>

          <div className="relative max-w-xl">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search school shoes, sports sneakers, backpacks, water bottles..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <p className="text-xs text-gray-500">
            Showing {results.length} school results {query ? `for "${query}"` : ''}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
            <p className="text-sm font-bold text-navy-950">No products found matching your search</p>
            <p className="text-xs text-gray-500 mt-1">Try searching for &quot;black shoes&quot;, &quot;kindergarten&quot;, or &quot;backpack&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}

