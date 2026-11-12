'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS, Product } from '@/data/products';
import { Search, X, ChevronRight, ArrowUpRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
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
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
      );
    });
    setResults(filtered.slice(0, 8));
  }, [query]);

  if (!isOpen) return null;

  const quickSearches = [
    'Boys School Shoes',
    'White PT Shoes',
    'Mary Jane Girls',
    'Kindergarten Velcro',
    'Water Bottles',
    'Multi-Compartment Bag',
    'Fabric Drill Shoes',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-100 animate-slideUp">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200 gap-3 bg-gray-50/50">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search school shoes, sports shoes, bags, water bottles..."
            className="flex-1 bg-transparent text-base text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-600 hover:text-brand-600 px-2 py-1 rounded-md bg-gray-200/60 transition"
          >
            ESC
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {!query && (
            <div className="space-y-4 py-2">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
                Popular School Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-600 text-xs text-gray-700 transition"
                  >
                    <span>{term}</span>
                    <ArrowUpRight className="w-3 h-3 text-gray-400" />
                  </button>
                ))}
              </div>

              {/* Quick links to wings */}
              <div className="pt-4 border-t border-gray-100">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1 mb-2">
                  Shop by School Wing
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href="/collections/kindergarten"
                    onClick={onClose}
                    className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-center hover:border-orange-300 transition"
                  >
                    <span className="block font-bold text-xs text-navy-900">Kindergarten</span>
                    <span className="text-[10px] text-gray-500">Nursery &amp; KG</span>
                  </Link>
                  <Link
                    href="/collections/middle-wing"
                    onClick={onClose}
                    className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-center hover:border-blue-300 transition"
                  >
                    <span className="block font-bold text-xs text-navy-900">Middle Wing</span>
                    <span className="text-[10px] text-gray-500">Classes 1 - 8</span>
                  </Link>
                  <Link
                    href="/collections/senior-wing"
                    onClick={onClose}
                    className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center hover:border-emerald-300 transition"
                  >
                    <span className="block font-bold text-xs text-navy-900">Senior Wing</span>
                    <span className="text-[10px] text-gray-500">Classes 9 - 12</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-semibold text-gray-700">No matching school products found for &quot;{query}&quot;</p>
              <p className="text-xs text-gray-400">
                Try searching for &quot;Black Shoes&quot;, &quot;Sports Shoes&quot;, or &quot;Backpack&quot;.
              </p>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1 mb-2">
                Found {results.length} Products
              </div>
              <div className="divide-y divide-gray-100">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 py-2.5 px-2 hover:bg-gray-50 rounded-xl transition group"
                  >
                    <div className="w-14 h-14 relative bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-1 group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy-100 text-navy-800">
                          {product.gender}
                        </span>
                        <span className="text-[10px] text-gray-500 capitalize">{product.productType.replace('-', ' ')}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-navy-900 truncate group-hover:text-brand-600 transition">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-gray-900">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-gray-400 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-brand-600 transition" />
                  </Link>
                ))}
              </div>

              <div className="pt-3 text-center border-t border-gray-100">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View all results for &quot;{query}&quot; →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
