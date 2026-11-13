'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  SlidersHorizontal,
  MoveUp,
  MoveDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Tag,
  DollarSign,
  Edit,
  X,
  Plus,
  Compass,
  ShoppingBag,
} from 'lucide-react';
import {
  getHomepageSections,
  saveHomepageSections,
  reorderHomepageSections,
  updateHomepageSection,
  HomepageSection,
  DEFAULT_HOMEPAGE_SECTIONS,
  getFootwearCategories,
  saveFootwearCategories,
  reorderFootwearCategories,
  updateFootwearCategory,
  FootwearCategoryCard,
  DEFAULT_FOOTWEAR_CATEGORIES,
  getSchoolLevels,
  updateSchoolLevel,
  reorderSchoolLevels,
  SchoolLevelItem,
  getFeaturedSpotlightConfig,
  saveFeaturedSpotlightConfig,
  FeaturedSpotlightConfig,
  getAllCatalogProducts,
} from '@/services/api';
import { Product } from '@/data/products';

export default function AdminHomepageLayoutPage() {
  const [activeTab, setActiveTab] = useState<'sections' | 'footwear' | 'levels' | 'spotlight'>('sections');
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [footwearCats, setFootwearCats] = useState<FootwearCategoryCard[]>([]);
  const [schoolLevels, setSchoolLevels] = useState<SchoolLevelItem[]>([]);
  const [spotlightCfg, setSpotlightCfg] = useState<FeaturedSpotlightConfig>({
    productSlug: 'mens-daily-wear-sandals-wgp53410-tan',
    badge: 'Trending Product Spotlight',
    subtitle: 'Scroll images on left • Sticky order details on right',
  });
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit Footwear Modal
  const [editingCat, setEditingCat] = useState<FootwearCategoryCard | null>(null);
  const [catFormData, setCatFormData] = useState<Partial<FootwearCategoryCard>>({});

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [secs, fCats, sLevels, spot, prods] = await Promise.all([
        getHomepageSections(),
        getFootwearCategories(),
        getSchoolLevels(),
        getFeaturedSpotlightConfig(),
        getAllCatalogProducts(),
      ]);
      setSections(secs);
      setFootwearCats(fCats);
      setSchoolLevels(sLevels);
      setSpotlightCfg(spot);
      setCatalogProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Section Ordering handlers
  const handleShiftSection = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const list = [...sections];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reordered = list.map((s, idx) => ({ id: s.id, display_order: idx + 1 }));
    setSections(list.map((s, idx) => ({ ...s, display_order: idx + 1 })));
    await reorderHomepageSections(reordered);
    showToast(`"${moved.name}" shifted to position #${targetIndex + 1}!`);
  };

  const handleSetSectionPosition = async (index: number, newPosition: number) => {
    const targetIdx = newPosition - 1;
    if (targetIdx === index || targetIdx < 0 || targetIdx >= sections.length) return;

    const list = [...sections];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const reordered = list.map((s, idx) => ({ id: s.id, display_order: idx + 1 }));
    setSections(list.map((s, idx) => ({ ...s, display_order: idx + 1 })));
    await reorderHomepageSections(reordered);
    showToast(`"${moved.name}" placed at position #${newPosition}!`);
  };

  const handleToggleSectionActive = async (sec: HomepageSection) => {
    const nextStatus = !sec.is_active;
    await updateHomepageSection(sec.id, { is_active: nextStatus });
    setSections(sections.map((s) => (s.id === sec.id ? { ...s, is_active: nextStatus } : s)));
    showToast(`"${sec.name}" is now ${nextStatus ? 'Visible' : 'Hidden'} on Homepage!`);
  };

  const handleResetSections = async () => {
    if (!confirm('Reset homepage sections to default order?')) return;
    await saveHomepageSections(DEFAULT_HOMEPAGE_SECTIONS);
    setSections(DEFAULT_HOMEPAGE_SECTIONS);
    showToast('Homepage sections restored to default layout.');
  };

  // Footwear Carousel Handlers
  const handleShiftFootwear = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= footwearCats.length) return;

    const list = [...footwearCats];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reordered = list.map((item, idx) => ({ id: item.id, display_order: idx + 1 }));
    setFootwearCats(list.map((item, idx) => ({ ...item, display_order: idx + 1 })));
    await reorderFootwearCategories(reordered);
    showToast(`Category "${moved.title}" shifted to position #${targetIndex + 1}!`);
  };

  const handleSetFootwearPosition = async (index: number, newPosition: number) => {
    const targetIdx = newPosition - 1;
    if (targetIdx === index || targetIdx < 0 || targetIdx >= footwearCats.length) return;

    const list = [...footwearCats];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const reordered = list.map((item, idx) => ({ id: item.id, display_order: idx + 1 }));
    setFootwearCats(list.map((item, idx) => ({ ...item, display_order: idx + 1 })));
    await reorderFootwearCategories(reordered);
    showToast(`"${moved.title}" placed at position #${newPosition}!`);
  };

  const handleToggleFootwearActive = async (cat: FootwearCategoryCard) => {
    const nextStatus = !cat.is_active;
    await updateFootwearCategory(cat.id, { is_active: nextStatus });
    setFootwearCats(footwearCats.map((c) => (c.id === cat.id ? { ...c, is_active: nextStatus } : c)));
    showToast(`"${cat.title}" ${nextStatus ? 'enabled' : 'hidden'} on Footwear carousel.`);
  };

  const handleOpenEditFootwear = (cat: FootwearCategoryCard) => {
    setEditingCat(cat);
    setCatFormData({ ...cat });
  };

  const handleSaveFootwearModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;

    await updateFootwearCategory(editingCat.id, catFormData);
    showToast(`Category "${catFormData.title}" updated with starting price ${catFormData.startingPrice}!`);
    setEditingCat(null);
    const updated = await getFootwearCategories();
    setFootwearCats(updated);
  };

  // School Level Handlers
  const handleShiftSchoolLevel = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= schoolLevels.length) return;

    const list = [...schoolLevels];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reordered = list.map((item, idx) => ({ id: item.id, display_order: idx + 1 }));
    setSchoolLevels(list.map((item, idx) => ({ ...item, display_order: idx + 1 })));
    await reorderSchoolLevels(reordered);
    showToast(`"${moved.title}" shifted to position #${targetIndex + 1}!`);
  };

  const handleUpdateSchoolLevelPrice = async (levelId: string, newPrice: string) => {
    await updateSchoolLevel(levelId, { startingPrice: newPrice });
    setSchoolLevels(schoolLevels.map((l) => (l.id === levelId ? { ...l, startingPrice: newPrice } : l)));
    showToast(`Starting price updated to ${newPrice}!`);
  };

  // Spotlight Product Handler
  const handleSaveSpotlight = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveFeaturedSpotlightConfig(spotlightCfg);
    showToast('Spotlight product updated on Homepage!');
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-navy-950">Homepage Layout &amp; Order Customizer</h1>
          </div>
          <p className="text-xs text-gray-500">
            Control the exact ordering (1st, 2nd, 3rd place), left-right shifting, prices, tags, and visibility of homepage sections and category carousels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-navy-950 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Homepage</span>
          </Link>
          <button
            onClick={handleResetSections}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            title="Restore default section ordering"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === 'sections'
              ? 'bg-navy-950 text-white shadow'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Homepage Section Blocks ({sections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('footwear')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === 'footwear'
              ? 'bg-navy-950 text-white shadow'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>2. Shop by Footwear Carousel ({footwearCats.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('levels')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === 'levels'
              ? 'bg-navy-950 text-white shadow'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>3. School Levels &amp; Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab('spotlight')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 ${
            activeTab === 'spotlight'
              ? 'bg-navy-950 text-white shadow'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>4. Spotlight Featured Product</span>
        </button>
      </div>

      {/* TAB 1: HOMEPAGE SECTIONS ORDER */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong>Homepage Section Stacking Order:</strong> The homepage dynamically renders each component in the exact order below. Move any section up/down or pick its 1st, 2nd, 3rd position directly.
            </div>
            <span className="font-bold text-[11px] bg-white px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
              {sections.filter((s) => s.is_active).length} of {sections.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition ${
                  section.is_active ? 'border-gray-200' : 'border-gray-200 bg-gray-50/80 opacity-60'
                }`}
              >
                {/* Left: Position Badge & Titles */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex flex-col items-center justify-center shrink-0 border border-brand-200 font-mono font-black text-xs">
                    <span>#{index + 1}</span>
                    <span className="text-[9px] uppercase tracking-tighter">
                      {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : 'Pos'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-navy-950">{section.name}</h3>
                      {section.badge && (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                </div>

                {/* Right: Controls (Direct Place Dropdown + Up/Down + Toggle Active) */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {/* Select Order Position (1st, 2nd, 3rd, etc.) */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400 font-bold text-[11px] hidden sm:inline">Set Place:</span>
                    <select
                      value={index + 1}
                      onChange={(e) => handleSetSectionPosition(index, Number(e.target.value))}
                      className="bg-gray-100 hover:bg-gray-200 text-navy-950 font-bold text-xs py-1.5 px-2.5 rounded-xl border border-gray-300 focus:outline-none cursor-pointer"
                    >
                      {sections.map((_, i) => (
                        <option key={i} value={i + 1}>
                          Place #{i + 1} {i === 0 ? '(1st Top)' : i === 1 ? '(2nd)' : i === 2 ? '(3rd)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Move Up / Move Down Buttons */}
                  <div className="flex items-center bg-gray-100 rounded-xl border border-gray-200 p-0.5">
                    <button
                      disabled={index === 0}
                      onClick={() => handleShiftSection(index, 'up')}
                      className="p-1.5 hover:bg-white rounded-lg text-navy-950 disabled:opacity-20 disabled:cursor-not-allowed transition"
                      title="Move Up"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      disabled={index === sections.length - 1}
                      onClick={() => handleShiftSection(index, 'down')}
                      className="p-1.5 hover:bg-white rounded-lg text-navy-950 disabled:opacity-20 disabled:cursor-not-allowed transition"
                      title="Move Down"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Toggle Active Button */}
                  <button
                    onClick={() => handleToggleSectionActive(section)}
                    className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      section.is_active
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title={section.is_active ? 'Hide from Homepage' : 'Show on Homepage'}
                  >
                    {section.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SHOP BY FOOTWEAR CAROUSEL ORDER & PRICING */}
      {activeTab === 'footwear' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong>Shop by Footwear Carousel Customizer:</strong> Reorder the carousel categories (shift left/right, pick 1st, 2nd, 3rd place), customize the starting prices (e.g. ₹499, ₹549), tags, and subtitles!
            </div>
            <span className="font-bold text-[11px] bg-white px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
              Instant Carousel Sync
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {footwearCats.map((cat, index) => (
              <div
                key={cat.id}
                className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow transition flex flex-col justify-between ${
                  cat.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50'
                }`}
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Position Tag & Starting Price Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-brand-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow">
                        #{index + 1} {index === 0 ? '(1st)' : index === 1 ? '(2nd)' : index === 2 ? '(3rd)' : ''}
                      </span>
                      <span className="bg-amber-400 text-navy-950 font-black text-xs px-2.5 py-1 rounded-full shadow">
                        From {cat.startingPrice}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur">
                        {cat.tag}
                      </span>
                    </div>

                    {/* Left/Right Shift Buttons */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <button
                        disabled={index === 0}
                        onClick={() => handleShiftFootwear(index, 'left')}
                        className="px-2.5 py-1 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-lg disabled:opacity-20 flex items-center gap-1 backdrop-blur"
                        title="Shift Left in Carousel"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Left</span>
                      </button>

                      {/* Direct Place Selector */}
                      <select
                        value={index + 1}
                        onChange={(e) => handleSetFootwearPosition(index, Number(e.target.value))}
                        className="bg-black/80 text-white font-bold text-xs py-1 px-2 rounded-lg border border-white/20 focus:outline-none cursor-pointer"
                      >
                        {footwearCats.map((_, i) => (
                          <option key={i} value={i + 1}>
                            Place #{i + 1} {i === 0 ? '(1st)' : i === 1 ? '(2nd)' : i === 2 ? '(3rd)' : ''}
                          </option>
                        ))}
                      </select>

                      <button
                        disabled={index === footwearCats.length - 1}
                        onClick={() => handleShiftFootwear(index, 'right')}
                        className="px-2.5 py-1 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-lg disabled:opacity-20 flex items-center gap-1 backdrop-blur"
                        title="Shift Right in Carousel"
                      >
                        <span>Right</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-base font-black text-navy-950">{cat.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{cat.subtitle}</p>
                    </div>

                    {/* Features list */}
                    <div className="flex flex-wrap gap-1.5">
                      {cat.features.map((feat, fi) => (
                        <span key={fi} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-0 border-t border-gray-100 mt-3 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleFootwearActive(cat)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                      cat.is_active ? 'bg-gray-100 text-gray-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {cat.is_active ? 'Hide Card' : 'Show Card'}
                  </button>

                  <button
                    onClick={() => handleOpenEditFootwear(cat)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Price &amp; Info</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCHOOL LEVELS & ACCESSORIES PRICING */}
      {activeTab === 'levels' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900">
            <strong>School Grade Levels Customizer:</strong> Set the order (Kindergarten, Middle Wing, Senior Wing) and adjust the starting price degrees displayed on the homepage cards.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schoolLevels.map((lvl, index) => (
              <div key={lvl.id} className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-lg">
                      #{index + 1} {lvl.badge}
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Starts {lvl.startingPrice || '₹399'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-navy-950">{lvl.title}</h3>
                    <p className="text-xs font-bold text-gray-400">{lvl.subtitle}</p>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{lvl.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    {lvl.points.map((pt, pi) => (
                      <div key={pi} className="flex items-center gap-2 text-xs text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  {/* Price degree quick edit */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500">Starting Price:</label>
                    <input
                      type="text"
                      value={lvl.startingPrice || ''}
                      onChange={(e) => handleUpdateSchoolLevelPrice(lvl.id, e.target.value)}
                      className="w-24 text-xs font-bold border border-gray-300 rounded-lg px-2 py-1 focus:border-brand-600 focus:outline-none"
                      placeholder="e.g. ₹499"
                    />
                  </div>

                  {/* Left / Right Shift */}
                  <div className="flex items-center justify-between">
                    <button
                      disabled={index === 0}
                      onClick={() => handleShiftSchoolLevel(index, 'left')}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-navy-950 font-bold text-xs rounded-lg disabled:opacity-30"
                    >
                      &larr; Shift Left
                    </button>
                    <button
                      disabled={index === schoolLevels.length - 1}
                      onClick={() => handleShiftSchoolLevel(index, 'right')}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-navy-950 font-bold text-xs rounded-lg disabled:opacity-30"
                    >
                      Shift Right &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SPOTLIGHT FEATURED PRODUCT */}
      {activeTab === 'spotlight' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-sm max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-navy-950">Spotlight Product Showcase</h3>
            <p className="text-xs text-gray-500">
              Select which product is highlighted in full multi-image detail directly on the homepage.
            </p>
          </div>

          <form onSubmit={handleSaveSpotlight} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-950">Featured Product</label>
              <select
                value={spotlightCfg.productSlug}
                onChange={(e) => setSpotlightCfg({ ...spotlightCfg, productSlug: e.target.value })}
                className="w-full text-xs font-bold border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none cursor-pointer"
              >
                {catalogProducts.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name} ({p.brand}) — ₹{p.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-950">Badge Tag</label>
              <input
                type="text"
                value={spotlightCfg.badge}
                onChange={(e) => setSpotlightCfg({ ...spotlightCfg, badge: e.target.value })}
                className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-950">Subtitle</label>
              <input
                type="text"
                value={spotlightCfg.subtitle}
                onChange={(e) => setSpotlightCfg({ ...spotlightCfg, subtitle: e.target.value })}
                className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow"
            >
              Save &amp; Update Spotlight
            </button>
          </form>
        </div>
      )}

      {/* Footwear Category Edit Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-navy-950">
                Edit Category: {editingCat.title}
              </h3>
              <button
                onClick={() => setEditingCat(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFootwearModal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-navy-950">Category Title</label>
                <input
                  type="text"
                  required
                  value={catFormData.title || ''}
                  onChange={(e) => setCatFormData({ ...catFormData, title: e.target.value })}
                  className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3 py-2 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-950">Starting Price</label>
                  <input
                    type="text"
                    required
                    value={catFormData.startingPrice || ''}
                    onChange={(e) => setCatFormData({ ...catFormData, startingPrice: e.target.value })}
                    className="w-full text-xs font-bold text-emerald-700 border border-gray-300 rounded-xl px-3 py-2 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. ₹499"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-950">Badge Tag</label>
                  <input
                    type="text"
                    value={catFormData.tag || ''}
                    onChange={(e) => setCatFormData({ ...catFormData, tag: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3 py-2 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. Assembly Ready"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-navy-950">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={catFormData.subtitle || ''}
                  onChange={(e) => setCatFormData({ ...catFormData, subtitle: e.target.value })}
                  className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3 py-2 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-navy-950">Target Collection Link</label>
                <input
                  type="text"
                  value={catFormData.href || ''}
                  onChange={(e) => setCatFormData({ ...catFormData, href: e.target.value })}
                  className="w-full text-xs font-mono border border-gray-300 rounded-xl px-3 py-2 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-navy-950">Image URL</label>
                <input
                  type="text"
                  value={catFormData.image || ''}
                  onChange={(e) => setCatFormData({ ...catFormData, image: e.target.value })}
                  className="w-full text-xs font-mono border border-gray-300 rounded-xl px-3 py-2 focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 border text-gray-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
