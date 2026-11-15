'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/data/products';
import {
  ChevronRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from 'lucide-react';

export interface CategoryTemplateProps {
  title: string;
  subtitle: string;
  category?: string;
  badge?: string;
  products: Product[];
  allCatalogProducts?: Product[];
  initialGender?: string;
  initialProductType?: string;
  initialSchoolLevel?: string;
  showBanner?: boolean;
}

export default function CategoryTemplate({
  title,
  subtitle,
  category = 'Collection',
  badge = 'Official Walkaroo & KOSKOOL',
  products: baseProducts,
  allCatalogProducts,
  initialGender,
  initialProductType,
  initialSchoolLevel,
  showBanner = true,
}: CategoryTemplateProps) {
  // Drawer open state (smooth left-to-right transition or static sidebar)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Active subcategory tab
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');

  // Master product pool (if allCatalogProducts is passed, use it so user can cross-filter)
  const masterProducts = useMemo(() => {
    return allCatalogProducts && allCatalogProducts.length > 0 ? allCatalogProducts : baseProducts;
  }, [allCatalogProducts, baseProducts]);

  // Filter states
  const [selectedGenders, setSelectedGenders] = useState<string[]>(() => {
    if (initialGender) return [initialGender];
    return [];
  });
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>(() => {
    if (initialProductType) return [initialProductType];
    return [];
  });
  const [selectedSchoolLevels, setSelectedSchoolLevels] = useState<string[]>(() => {
    if (initialSchoolLevel) return [initialSchoolLevel];
    return [];
  });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);

  // Accordion section states inside filter drawer
  const [accordionState, setAccordionState] = useState<{ [key: string]: boolean }>({
    gender: true,
    category: true,
    schoolLevel: true,
    size: true,
    colour: true,
    price: true,
  });

  const toggleAccordion = (key: string) => {
    setAccordionState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Determine dynamic collection min and max prices
  const { minCollectionPrice, maxCollectionPrice } = useMemo(() => {
    if (!masterProducts || masterProducts.length === 0) {
      return { minCollectionPrice: 0, maxCollectionPrice: 2500 };
    }
    const prices = masterProducts.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return {
      minCollectionPrice: Math.floor(min / 50) * 50,
      maxCollectionPrice: Math.ceil(max / 50) * 50,
    };
  }, [masterProducts]);

  const [priceMax, setPriceMax] = useState<number>(() => maxCollectionPrice || 2500);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Keep priceMax updated if collection changes and price hasn't been manually adjusted
  useEffect(() => {
    if (maxCollectionPrice > 0) {
      setPriceMax(maxCollectionPrice);
    }
  }, [maxCollectionPrice]);

  // Gender options with live counts
  const genderOptions = useMemo(() => {
    const counts: Record<string, number> = {
      boys: 0,
      girls: 0,
      kids: 0,
    };
    masterProducts.forEach((p) => {
      const g = p.gender?.toLowerCase();
      if (g === 'boys') counts.boys = (counts.boys || 0) + 1;
      else if (g === 'girls') counts.girls = (counts.girls || 0) + 1;
      else if (g === 'kids') counts.kids = (counts.kids || 0) + 1;
      else if (g === 'unisex') {
        counts.boys = (counts.boys || 0) + 1;
        counts.girls = (counts.girls || 0) + 1;
        counts.kids = (counts.kids || 0) + 1;
      } else if (g) {
        counts[g] = (counts[g] || 0) + 1;
      }
    });

    const list: { id: string; label: string; count: number }[] = [
      { id: 'boys', label: 'Boys', count: counts.boys || 0 },
      { id: 'girls', label: 'Girls', count: counts.girls || 0 },
      { id: 'kids', label: 'Kids / Unisex', count: counts.kids || 0 },
    ];
    if (counts.women) list.push({ id: 'women', label: 'Women', count: counts.women });
    if (counts.mens) list.push({ id: 'mens', label: 'Mens', count: counts.mens });
    return list;
  }, [masterProducts]);

  // Category filter options with counts
  const categoryFilterOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    masterProducts.forEach((p) => {
      if (selectedGenders.length > 0) {
        const matchesGender = selectedGenders.some((g) => {
          if (g === 'boys') return p.gender === 'boys' || p.gender === 'unisex';
          if (g === 'girls') return p.gender === 'girls' || p.gender === 'unisex';
          if (g === 'kids') return p.gender === 'kids' || p.gender === 'unisex';
          if (g === 'women') return p.gender === 'women';
          if (g === 'mens') return p.gender === 'mens';
          return p.gender === g;
        });
        if (!matchesGender) return;
      }
      counts[p.productType] = (counts[p.productType] || 0) + 1;
    });

    const standard: { id: string; label: string }[] = [
      { id: 'school-shoes', label: 'School Shoes' },
      { id: 'sports-shoes', label: 'Sports & PT Shoes' },
      { id: 'fabric-shoes', label: 'Canvas & Fabric (Fibre)' },
      { id: 'bags', label: 'School Backpacks' },
      { id: 'accessories', label: 'Accessories' },
    ];

    return standard
      .map((item) => ({
        ...item,
        count: counts[item.id] || 0,
      }))
      .filter((item) => item.count > 0 || selectedProductTypes.includes(item.id));
  }, [masterProducts, selectedGenders, selectedProductTypes]);

  // School Wing options with counts
  const schoolWingOptions = useMemo(() => {
    const counts: Record<string, number> = {
      kindergarten: 0,
      'middle-wing': 0,
      'senior-wing': 0,
    };

    masterProducts.forEach((p) => {
      if (selectedGenders.length > 0) {
        const matchesGender = selectedGenders.some((g) => {
          if (g === 'boys') return p.gender === 'boys' || p.gender === 'unisex';
          if (g === 'girls') return p.gender === 'girls' || p.gender === 'unisex';
          if (g === 'kids') return p.gender === 'kids' || p.gender === 'unisex';
          return p.gender === g;
        });
        if (!matchesGender) return;
      }

      if (p.schoolLevel) {
        p.schoolLevel.forEach((lvl) => {
          counts[lvl] = (counts[lvl] || 0) + 1;
        });
      }
    });

    return [
      { id: 'kindergarten', label: 'Kindergarten', count: counts['kindergarten'] || 0 },
      { id: 'middle-wing', label: 'Middle Wing', count: counts['middle-wing'] || 0 },
      { id: 'senior-wing', label: 'Senior Wing', count: counts['senior-wing'] || 0 },
    ].filter((item) => item.count > 0 || selectedSchoolLevels.includes(item.id));
  }, [masterProducts, selectedGenders, selectedSchoolLevels]);

  // Dynamically compute subcategories with accurate live counts
  const subcategories = useMemo(() => {
    const relevantPool = masterProducts.filter((p) => {
      if (selectedGenders.length > 0) {
        const matchGender = selectedGenders.some((g) => {
          if (g === 'boys') return p.gender === 'boys' || p.gender === 'unisex';
          if (g === 'girls') return p.gender === 'girls' || p.gender === 'unisex';
          if (g === 'kids') return p.gender === 'kids' || p.gender === 'unisex';
          return p.gender === g;
        });
        if (!matchGender) return false;
      }
      return true;
    });

    const counts: Record<string, number> = {};

    relevantPool.forEach((p) => {
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
      { id: 'all', label: 'All Items', count: relevantPool.length },
    ];

    Object.entries(counts).forEach(([label, count]) => {
      list.push({ id: label, label, count });
    });

    // If only 1 category exists, sub-divide by school wing if available
    if (list.length <= 2) {
      const wingCounts: Record<string, number> = {};
      relevantPool.forEach((p) => {
        p.schoolLevel?.forEach((lvl) => {
          const formatted = lvl.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          wingCounts[formatted] = (wingCounts[formatted] || 0) + 1;
        });
      });
      if (Object.keys(wingCounts).length > 1) {
        const wingList = [{ id: 'all', label: 'All Items', count: relevantPool.length }];
        Object.entries(wingCounts).forEach(([label, count]) => {
          wingList.push({ id: label, label, count });
        });
        return wingList;
      }
    }

    return list;
  }, [masterProducts, selectedGenders]);

  // Extract available sizes with live counts from this collection (curated to top 4-5 sizes)
  const sizeCounts = useMemo(() => {
    const relevantPool = masterProducts.filter((p) => {
      if (selectedGenders.length > 0) {
        const matchGender = selectedGenders.some((g) => {
          if (g === 'boys') return p.gender === 'boys' || p.gender === 'unisex';
          if (g === 'girls') return p.gender === 'girls' || p.gender === 'unisex';
          if (g === 'kids') return p.gender === 'kids' || p.gender === 'unisex';
          return p.gender === g;
        });
        if (!matchGender) return false;
      }
      return true;
    });

    const counts: Record<string, number> = {};
    relevantPool.forEach((p) => {
      p.sizes?.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });

    // Standard popular footwear sizes (4 to 5 sizes: 6, 7, 8, 9, 10)
    const preferredSizes = ['6', '7', '8', '9', '10'];
    const presentSizes = Object.keys(counts);

    let topSizes: string[] = [];
    const availablePreferred = preferredSizes.filter((s) => counts[s] && counts[s] > 0);

    if (availablePreferred.length >= 4) {
      topSizes = availablePreferred.slice(0, 5);
    } else {
      // Fallback: Pick top 5 most common sizes for specialized collections (e.g. kids)
      const sortedByCount = [...presentSizes].sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
      topSizes = sortedByCount.slice(0, 5);
    }

    // Always include any currently selected sizes so they remain toggleable
    selectedSizes.forEach((sz) => {
      if (!topSizes.includes(sz) && counts[sz] !== undefined) {
        topSizes.push(sz);
      }
    });

    return topSizes.map((sz) => ({
      size: sz,
      count: counts[sz] || 0,
    }));
  }, [masterProducts, selectedGenders, selectedSizes]);

  // Extract available specific colours (curated to top 4-5 core colors)
  const colourPalette = useMemo(() => {
    const COLOR_HEX_MAP: Record<string, string> = {
      black: '#111827',
      'deep black': '#0a0a0a',
      'solid black': '#000000',
      white: '#FFFFFF',
      tan: '#D29054',
      brown: '#633B18',
      navy: '#1E3A8A',
      'navy blue': '#1E3A8A',
      blue: '#2563EB',
      'sky blue': '#38BDF8',
      teal: '#0D9488',
      olive: '#556B2F',
      grey: '#6B7280',
      'slate grey': '#64748B',
      'charcoal grey': '#374151',
      maroon: '#800000',
      pink: '#EC4899',
      'pastel pink': '#F9A8D4',
      'dusty rose': '#FDA4AF',
      mauve: '#C084FC',
      plum: '#581C87',
      purple: '#7E22CE',
      lilac: '#C4B5FD',
      lavender: '#E9D5FF',
      red: '#DC2626',
      'red & navy': '#B91C1C',
      'yellow & blue': '#FBBF24',
      'fluorescent yellow': '#EAB308',
      camel: '#C19A6B',
      coffee: '#4A2E18',
      peach: '#FDBA74',
      rust: '#B45309',
      silver: '#D1D5DB',
      green: '#16A34A',
    };

    // 5 core footwear colors
    const coreColors = [
      { name: 'Black', hex: '#111827' },
      { name: 'Brown', hex: '#633B18' },
      { name: 'Tan', hex: '#D29054' },
      { name: 'Navy Blue', hex: '#1E3A8A' },
      { name: 'White', hex: '#FFFFFF' },
    ];

    const presentMap = new Map<string, string>();
    const colorCounts: Record<string, number> = {};

    masterProducts.forEach((p) => {
      const pColours = [...(p.colours || []), ...(p.primaryColour ? [p.primaryColour] : [])];
      pColours.forEach((c) => {
        const clean = c.trim();
        if (clean) {
          const lk = clean.toLowerCase();
          if (!presentMap.has(lk)) {
            presentMap.set(lk, clean);
          }
          colorCounts[lk] = (colorCounts[lk] || 0) + 1;
        }
      });
    });

    // Check if the core colors have presence in this collection
    const availableCore = coreColors.filter((core) => {
      const lk = core.name.toLowerCase();
      return (
        presentMap.has(lk) ||
        (lk === 'black' && (presentMap.has('deep black') || presentMap.has('solid black'))) ||
        (lk === 'navy blue' && (presentMap.has('navy') || presentMap.has('blue'))) ||
        (lk === 'brown' && (presentMap.has('coffee') || presentMap.has('rust'))) ||
        (lk === 'tan' && presentMap.has('camel'))
      );
    });

    let resultPalette: { name: string; hex: string }[] = [];
    if (availableCore.length >= 4) {
      resultPalette = availableCore.slice(0, 5);
    } else {
      // Fallback: pick top 5 most common colors in this collection
      const sorted = Array.from(presentMap.entries())
        .sort((a, b) => (colorCounts[b[0]] || 0) - (colorCounts[a[0]] || 0))
        .slice(0, 5);

      resultPalette = sorted.map(([lowerKey, displayName]) => ({
        name: displayName,
        hex: COLOR_HEX_MAP[lowerKey] || '#4B5563',
      }));
    }

    // Always keep any selected colours visible so user can unselect them
    selectedColours.forEach((sc) => {
      if (!resultPalette.some((p) => p.name.toLowerCase() === sc.toLowerCase())) {
        const lk = sc.toLowerCase();
        resultPalette.push({
          name: sc,
          hex: COLOR_HEX_MAP[lk] || '#4B5563',
        });
      }
    });

    return resultPalette;
  }, [masterProducts, selectedColours]);

  // Filter application
  const filteredProducts = useMemo(() => {
    return masterProducts
      .filter((p) => {
        // Gender filter
        if (selectedGenders.length > 0) {
          const matchGender = selectedGenders.some((g) => {
            if (g === 'boys') return p.gender === 'boys' || p.gender === 'unisex';
            if (g === 'girls') return p.gender === 'girls' || p.gender === 'unisex';
            if (g === 'kids') return p.gender === 'kids' || p.gender === 'unisex';
            if (g === 'women') return p.gender === 'women' || (p.gender as string) === 'womens';
            if (g === 'mens') return p.gender === 'mens';
            return p.gender === g;
          });
          if (!matchGender) return false;
        }

        // Product type filter
        if (selectedProductTypes.length > 0) {
          const matchType = selectedProductTypes.includes(p.productType);
          if (!matchType) return false;
        }

        // School level / wing filter
        if (selectedSchoolLevels.length > 0) {
          const matchLevel = p.schoolLevel?.some((lvl) => selectedSchoolLevels.includes(lvl));
          if (!matchLevel) return false;
        }

        // Subcategory tab filter
        if (activeSubcategory !== 'all') {
          const typeMatch =
            (activeSubcategory === 'School Shoes' && p.productType === 'school-shoes') ||
            (activeSubcategory === 'Sports & PT' && p.productType === 'sports-shoes') ||
            (activeSubcategory === 'Canvas & Fabric' && p.productType === 'fabric-shoes') ||
            (activeSubcategory === 'School Bags' && p.productType === 'bags') ||
            (activeSubcategory === 'Accessories' && p.productType === 'accessories') ||
            (p.subcategory === activeSubcategory);

          const wingMatch = p.schoolLevel?.some((lvl) => {
            const formatted = lvl.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            return formatted.toLowerCase() === activeSubcategory.toLowerCase();
          });

          if (!typeMatch && !wingMatch) {
            return false;
          }
        }

        // Size filter
        if (selectedSizes.length > 0) {
          const hasSize = p.sizes?.some((s) => selectedSizes.includes(s));
          if (!hasSize) return false;
        }

        // Colour filter
        if (selectedColours.length > 0) {
          const productColours = [
            ...(p.colours || []),
            ...(p.primaryColour ? [p.primaryColour] : []),
          ];
          const hasColour = productColours.some((c) => {
            const cl = c.trim().toLowerCase();
            return selectedColours.some((sc) => {
              const scl = sc.trim().toLowerCase();
              if (cl === scl) return true;
              if (scl === 'black' && cl.includes('black')) return true;
              if (scl === 'navy blue' && (cl.includes('navy') || cl === 'blue')) return true;
              if (scl === 'brown' && (cl.includes('brown') || cl.includes('coffee') || cl.includes('rust'))) return true;
              if (scl === 'tan' && (cl.includes('tan') || cl.includes('camel'))) return true;
              if (scl === 'white' && cl.includes('white')) return true;
              return false;
            });
          });
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
  }, [
    masterProducts,
    selectedGenders,
    selectedProductTypes,
    selectedSchoolLevels,
    activeSubcategory,
    selectedSizes,
    selectedColours,
    priceMin,
    priceMax,
    sortBy,
  ]);

  const activeFiltersCount =
    selectedGenders.length +
    selectedProductTypes.length +
    selectedSchoolLevels.length +
    selectedSizes.length +
    selectedColours.length +
    (priceMax < maxCollectionPrice || priceMin > minCollectionPrice ? 1 : 0) +
    (activeSubcategory !== 'all' ? 1 : 0);

  const toggleGender = (gId: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gId) ? prev.filter((g) => g !== gId) : [...prev, gId]
    );
  };

  const toggleProductType = (ptId: string) => {
    setSelectedProductTypes((prev) =>
      prev.includes(ptId) ? prev.filter((pt) => pt !== ptId) : [...prev, ptId]
    );
  };

  const toggleSchoolLevel = (lvlId: string) => {
    setSelectedSchoolLevels((prev) =>
      prev.includes(lvlId) ? prev.filter((lvl) => lvl !== lvlId) : [...prev, lvlId]
    );
  };

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
    setSelectedGenders([]);
    setSelectedProductTypes([]);
    setSelectedSchoolLevels([]);
    setSelectedSizes([]);
    setSelectedColours([]);
    setPriceMin(minCollectionPrice);
    setPriceMax(maxCollectionPrice);
    setSortBy('featured');
    setActiveSubcategory('all');
  };

  return (
    <div className="bg-white min-h-screen overflow-x-hidden w-full max-w-full">
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
              {badge && (
                <span className="inline-block text-[11px] font-black uppercase tracking-widest text-[#f07167] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                  {badge}
                </span>
              )}
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

        {/* 3. Filter Action Bar (Responsive Mobile & Desktop) */}
        <div className="space-y-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3">
            {/* "Show filters" Pill Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-4 sm:px-5 py-2 text-xs font-bold transition shadow-sm ${
                isFilterDrawerOpen
                  ? 'bg-[#f05a50] text-white border-[#f05a50]'
                  : 'border-[#f05a50] text-[#f05a50] hover:bg-[#fff5f5]'
              }`}
              aria-label={isFilterDrawerOpen ? 'Hide Filters' : 'Show Filters'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isFilterDrawerOpen ? 'Hide filters' : 'Filters'}</span>
              {activeFiltersCount > 0 && (
                <span
                  className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isFilterDrawerOpen ? 'bg-white text-[#f05a50]' : 'bg-[#f05a50] text-white'
                  }`}
                >
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort by Dropdown Pill */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#f05a50] text-gray-800 text-xs font-semibold rounded-full pl-3.5 sm:pl-5 pr-7 sm:pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#f05a50] cursor-pointer shadow-sm"
                >
                  <option value="featured">Featured •</option>
                  <option value="popular">Best selling</option>
                  <option value="price-low">Price: Low to high</option>
                  <option value="price-high">Price: High to low</option>
                  <option value="rating">Top rated</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 text-[#f05a50]">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Sub-category filter pills - Wrapping cleanly, zero horizontal scroll */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 py-1">
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
        </div>

        {/* 4. Filter Sidebar (When Open) & Product Cards Grid */}
        <div className="flex items-start gap-8 pt-4">
          {/* Side Filter Column (Visible inline when open on desktop, staying in place without dimming products) */}
          {isFilterDrawerOpen && (
            <aside className="hidden lg:block w-72 shrink-0 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-950">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <span className="text-[11px] font-bold bg-[#f05a50] text-white px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs text-[#f05a50] hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Section 0: Department / Gender */}
              {genderOptions.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => toggleAccordion('gender')}
                    className="w-full flex items-center justify-between text-left font-bold text-sm text-gray-900"
                  >
                    <span>Department</span>
                    {accordionState.gender ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {accordionState.gender && (
                    <div className="space-y-2 pt-1">
                      {genderOptions.map((g) => {
                        const isChecked = selectedGenders.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => toggleGender(g.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                              isChecked
                                ? 'bg-black text-white border-black shadow-sm'
                                : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                  isChecked ? 'bg-white text-black border-white' : 'border-gray-400 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span>{g.label}</span>
                            </div>
                            <span
                              className={`text-[10px] ${
                                isChecked ? 'text-gray-300' : 'text-gray-400'
                              }`}
                            >
                              ({g.count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Section 1: Category / Product Type */}
              {categoryFilterOptions.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <button
                    onClick={() => toggleAccordion('category')}
                    className="w-full flex items-center justify-between text-left font-bold text-sm text-gray-900"
                  >
                    <span>Category</span>
                    {accordionState.category ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {accordionState.category && (
                    <div className="space-y-2 pt-1">
                      {categoryFilterOptions.map((cat) => {
                        const isChecked = selectedProductTypes.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleProductType(cat.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                              isChecked
                                ? 'bg-black text-white border-black shadow-sm'
                                : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                  isChecked ? 'bg-white text-black border-white' : 'border-gray-400 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span>{cat.label}</span>
                            </div>
                            <span
                              className={`text-[10px] ${
                                isChecked ? 'text-gray-300' : 'text-gray-400'
                              }`}
                            >
                              ({cat.count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Section 2: School Wing / Level */}
              {schoolWingOptions.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <button
                    onClick={() => toggleAccordion('schoolLevel')}
                    className="w-full flex items-center justify-between text-left font-bold text-sm text-gray-900"
                  >
                    <span>School Wing</span>
                    {accordionState.schoolLevel ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {accordionState.schoolLevel && (
                    <div className="space-y-2 pt-1">
                      {schoolWingOptions.map((wing) => {
                        const isChecked = selectedSchoolLevels.includes(wing.id);
                        return (
                          <button
                            key={wing.id}
                            type="button"
                            onClick={() => toggleSchoolLevel(wing.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                              isChecked
                                ? 'bg-black text-white border-black shadow-sm'
                                : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                  isChecked ? 'bg-white text-black border-white' : 'border-gray-400 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span>{wing.label}</span>
                            </div>
                            <span
                              className={`text-[10px] ${
                                isChecked ? 'text-gray-300' : 'text-gray-400'
                              }`}
                            >
                              ({wing.count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Section 3: Size */}
              {sizeCounts.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <button
                    onClick={() => toggleAccordion('size')}
                    className="w-full flex items-center justify-between text-left font-bold text-sm text-gray-900"
                  >
                    <span>Size</span>
                    {accordionState.size ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {accordionState.size && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {sizeCounts.map((item) => {
                        const isChecked = selectedSizes.includes(item.size);
                        return (
                          <button
                            key={item.size}
                            type="button"
                            onClick={() => toggleSize(item.size)}
                            className={`min-w-9 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                              isChecked
                                ? 'bg-black text-white border-black shadow-sm'
                                : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <span>{item.size}</span>
                            <span className={`text-[10px] ml-1 ${isChecked ? 'text-gray-300' : 'text-gray-400'}`}>
                              ({item.count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Section 4: Colour */}
              {colourPalette.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <button
                    onClick={() => toggleAccordion('colour')}
                    className="w-full flex items-center justify-between text-left font-bold text-sm text-gray-900"
                  >
                    <span>Colour</span>
                    {accordionState.colour ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {accordionState.colour && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {colourPalette.map((col) => {
                        const isSelected = selectedColours.includes(col.name);
                        return (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => toggleColour(col.name)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                              isSelected
                                ? 'border-black bg-gray-50 font-bold shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
                            }`}
                            title={col.name}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0 shadow-xs"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Section 5: Price */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <button
                  onClick={() => toggleAccordion('price')}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-gray-900"
                >
                  <span>Price Range</span>
                  {accordionState.price ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {accordionState.price && (
                  <div className="space-y-3 pt-1">
                    <input
                      type="range"
                      min={minCollectionPrice}
                      max={maxCollectionPrice}
                      step="50"
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full accent-[#f05a50] cursor-pointer"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                      <span>₹ {priceMin}</span>
                      <span className="font-bold text-[#f05a50]">Up to ₹ {priceMax}</span>
                      <span>₹ {maxCollectionPrice}</span>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}

          {/* Product Cards Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm space-y-4 my-4">
                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                  <SlidersHorizontal className="w-8 h-8" />
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
              <div
                className={`grid gap-4 sm:gap-6 ${
                  isFilterDrawerOpen
                    ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                }`}
              >
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
        </div>

      </div>

      {/* =================================================================== */}
      {/* 5. SLIDE-OVER FILTERS DRAWER (For Mobile / Small screens only) */}
      {/* =================================================================== */}
      {/* Dark overlay backdrop on mobile */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isFilterDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsFilterDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel for mobile */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 max-w-sm sm:max-w-md w-full bg-white z-50 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
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

          {/* Section 0: Department / Gender */}
          {genderOptions.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleAccordion('gender')}
                className="w-full flex items-center justify-between text-left font-bold text-base text-gray-900 pb-3"
              >
                <span>Department</span>
                {accordionState.gender ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {accordionState.gender && (
                <div className="space-y-2 pt-1">
                  {genderOptions.map((g) => {
                    const isChecked = selectedGenders.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGender(g.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition ${
                          isChecked
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? 'bg-white text-black border-white' : 'border-gray-400 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{g.label}</span>
                        </div>
                        <span className={`text-[11px] ${isChecked ? 'text-gray-300' : 'text-gray-400'}`}>
                          ({g.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 1: Category / Product Type */}
          {categoryFilterOptions.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleAccordion('category')}
                className="w-full flex items-center justify-between text-left font-bold text-base text-gray-900 pb-3"
              >
                <span>Category</span>
                {accordionState.category ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {accordionState.category && (
                <div className="space-y-2 pt-1">
                  {categoryFilterOptions.map((cat) => {
                    const isChecked = selectedProductTypes.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleProductType(cat.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition ${
                          isChecked
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? 'bg-white text-black border-white' : 'border-gray-400 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{cat.label}</span>
                        </div>
                        <span className={`text-[11px] ${isChecked ? 'text-gray-300' : 'text-gray-400'}`}>
                          ({cat.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 2: School Wing / Level */}
          {schoolWingOptions.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => toggleAccordion('schoolLevel')}
                className="w-full flex items-center justify-between text-left font-bold text-base text-gray-900 pb-3"
              >
                <span>School Wing</span>
                {accordionState.schoolLevel ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {accordionState.schoolLevel && (
                <div className="space-y-2 pt-1">
                  {schoolWingOptions.map((wing) => {
                    const isChecked = selectedSchoolLevels.includes(wing.id);
                    return (
                      <button
                        key={wing.id}
                        type="button"
                        onClick={() => toggleSchoolLevel(wing.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition ${
                          isChecked
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? 'bg-white text-black border-white' : 'border-gray-400 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{wing.label}</span>
                        </div>
                        <span className={`text-[11px] ${isChecked ? 'text-gray-300' : 'text-gray-400'}`}>
                          ({wing.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Size */}
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
                <div className="flex flex-wrap gap-2 pt-1">
                  {sizeCounts.map((item) => {
                    const isChecked = selectedSizes.includes(item.size);
                    return (
                      <button
                        key={item.size}
                        type="button"
                        onClick={() => toggleSize(item.size)}
                        className={`min-w-9 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                          isChecked
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <span>{item.size}</span>
                        <span className={`text-[10px] ml-1 ${isChecked ? 'text-gray-300' : 'text-gray-400'}`}>
                          ({item.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 4: Colour */}
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
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                          isSelected
                            ? 'border-black bg-gray-50 font-bold shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
                        }`}
                        title={col.name}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0 shadow-xs"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
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
                  min={minCollectionPrice}
                  max={maxCollectionPrice}
                  step="50"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#f05a50] cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span>₹ {priceMin}</span>
                  <span className="font-bold text-[#f05a50]">Up to ₹ {priceMax}</span>
                  <span>₹ {maxCollectionPrice}</span>
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
