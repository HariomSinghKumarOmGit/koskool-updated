'use client';

import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { getColorStyle } from '@/data/colors';

export interface FilterState {
  gender: string[];
  schoolLevel: string[];
  productType: string[];
  sizes: string[];
  colours: string[];
  priceRange: string;
  sortBy: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  availableSizes: string[];
  availableColours: string[];
  mode?: 'footwear' | 'accessories' | 'bags' | 'all';
}

export default function ProductFilters({
  filters,
  onChange,
  onReset,
  availableSizes,
  availableColours,
  mode = 'all',
}: ProductFiltersProps) {
  const toggleArrayItem = (key: keyof FilterState, val: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(val)
      ? current.filter((item) => item !== val)
      : [...current, val];
    onChange({ ...filters, [key]: updated });
  };

  const handlePriceChange = (val: string) => {
    onChange({ ...filters, priceRange: filters.priceRange === val ? '' : val });
  };

  const isFootwear = mode === 'footwear' || mode === 'all';
  const isAccessories = mode === 'accessories' || mode === 'all';
  const isBags = mode === 'bags' || mode === 'all';

  const hasActiveFilters =
    filters.gender.length > 0 ||
    filters.schoolLevel.length > 0 ||
    filters.productType.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colours.length > 0 ||
    !!filters.priceRange;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-sm text-navy-950 uppercase tracking-wider">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Gender Filter */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Gender</h4>
        <div className="space-y-1.5">
          {[
            { id: 'boys', label: 'Boys' },
            { id: 'girls', label: 'Girls' },
            { id: 'kids', label: 'Kids / Unisex' },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.gender.includes(item.id)}
                onChange={() => toggleArrayItem('gender', item.id)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* School Level Filter */}
      <div className="space-y-2.5 pt-3 border-t border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">School Level</h4>
        <div className="space-y-1.5">
          {[
            { id: 'kindergarten', label: 'Kindergarten (Ages 3-6)' },
            { id: 'middle-wing', label: 'Middle Wing (Classes 1-8)' },
            { id: 'senior-wing', label: 'Senior Wing (Classes 9-12)' },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.schoolLevel.includes(item.id)}
                onChange={() => toggleArrayItem('schoolLevel', item.id)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Footwear Category Filter (if applicable) */}
      {isFootwear && (
        <div className="space-y-2.5 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Footwear Type</h4>
          <div className="space-y-1.5">
            {[
              { id: 'school-shoes', label: 'School Uniform Shoes' },
              { id: 'sports-shoes', label: 'Sports & PT Shoes' },
              { id: 'fabric-shoes', label: 'Canvas & Fabric Shoes' },
            ].map((item) => (
              <label key={item.id} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.productType.includes(item.id)}
                  onChange={() => toggleArrayItem('productType', item.id)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sizes Filter */}
      {availableSizes.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Size (UK/India)</h4>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.slice(0, 5).map((sz) => {
              const selected = filters.sizes.includes(sz);
              return (
                <button
                  key={sz}
                  onClick={() => toggleArrayItem('sizes', sz)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition ${
                    selected
                      ? 'bg-navy-950 text-white border-navy-950 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colours Filter */}
      {availableColours.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Colour</h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {availableColours.slice(0, 8).map((c) => {
              const isSelected = filters.colours.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleArrayItem('colours', c)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                    isSelected
                      ? 'border-black bg-gray-50 font-bold shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
                  }`}
                  title={c}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0 shadow-xs"
                    style={getColorStyle(c)}
                  />
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="space-y-2.5 pt-3 border-t border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Price</h4>
        <div className="space-y-1.5">
          {[
            { id: 'under-500', label: 'Under ₹500' },
            { id: '500-800', label: '₹500 - ₹800' },
            { id: '800-1200', label: '₹800 - ₹1200' },
            { id: 'above-1200', label: '₹1200 & Above' },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer select-none">
              <input
                type="radio"
                name="priceRange"
                checked={filters.priceRange === item.id}
                onChange={() => handlePriceChange(item.id)}
                className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
