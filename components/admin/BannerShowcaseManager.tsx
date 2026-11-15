'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  Check,
  X,
  Package,
  Layers,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Upload,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import { uploadToStorage } from '@/lib/supabase';
import {
  getBannerShowcaseSections,
  saveBannerShowcaseSections,
  createBannerShowcaseSection,
  updateBannerShowcaseSection,
  deleteBannerShowcaseSection,
  reorderBannerShowcaseSections,
  BannerShowcaseSection,
  DEFAULT_BANNER_SHOWCASE_SECTIONS,
  getAllCatalogProducts,
} from '@/services/api';
import { Product } from '@/data/products';

const PRESET_BANNER_IMAGES = [
  { label: 'Bounceez Ergonomic Sole (Default)', desktop: '/cdn/shop/files/Bounceez-Web-Banner-4_94081796-b190-48a0-a99c-0b229a04a5c0.v_1772773040_width_5760.jpg', mobile: '/cdn/shop/files/Bounceez-Mobile-Banner-landscape_a1472114-8617-4595-ad17-ba9ae43b7635.v_1772773044_width_1000.jpg' },
  { label: 'Bloomsy Everyday Comfort', desktop: '/cdn/shop/files/Bloomsy-Web-Banner_47afcd51-e579-4b9f-a174-6a95c1fa1213.v_1781954684_width_5760.jpg', mobile: '/cdn/shop/files/Bloomsy-Mobile-Banner-landscape_75038556-3611-48b3-8b03-a433059825ee.v_1781954947_width_1000.jpg' },
  { label: 'School Uniform Hero Banner', desktop: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg', mobile: '/cdn/shop/files/School-Mobile-Banner_fbefffb6-4e80-496e-83b5-bf4a835d0fad.v_1767783342_width_1000.jpg' },
  { label: 'PT & Athletic Drill Banner', desktop: '/cdn/shop/files/Sports-Shoe-Web-Banner_934e3fd0-00bd-4c35-a071-b8943d6e32a6.v_1778128141_width_5760.jpg', mobile: '/cdn/shop/files/Sports-Shoe-Web-Banner_934e3fd0-00bd-4c35-a071-b8943d6e32a6.v_1778128141_width_5760.jpg' },
  { label: 'Kids & Junior Steps Banner', desktop: '/cdn/shop/files/Kids-Banner.v_1768369268_width_5760.jpg', mobile: '/cdn/shop/files/Kids-Banner.v_1768369268_width_5760.jpg' },
];

export default function BannerShowcaseManager() {
  const [sections, setSections] = useState<BannerShowcaseSection[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<BannerShowcaseSection | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    bannerDesktop: PRESET_BANNER_IMAGES[0].desktop,
    bannerMobile: PRESET_BANNER_IMAGES[0].mobile,
    bannerAlt: '',
    bannerLink: '/collections/walkaroo-bounceez',
    gridRows: 2 as 1 | 2,
    is_active: true,
  });

  // Manage Products Modal
  const [productModalSection, setProductModalSection] = useState<BannerShowcaseSection | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Upload States
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [dragOverDesktop, setDragOverDesktop] = useState(false);
  const [dragOverMobile, setDragOverMobile] = useState(false);
  const [replacingBannerId, setReplacingBannerId] = useState<string | null>(null);

  const handleUploadDesktop = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }
    setUploadingDesktop(true);
    try {
      const res = await uploadToStorage(file, 'promotions', 'banners');
      if (res.url) {
        setFormData((prev) => {
          const shouldSyncMobile = !prev.bannerMobile || prev.bannerMobile === prev.bannerDesktop;
          return {
            ...prev,
            bannerDesktop: res.url!,
            bannerMobile: shouldSyncMobile ? res.url! : prev.bannerMobile,
          };
        });
        showToast('Desktop banner uploaded successfully!');
      } else {
        showToast('Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading image.');
    } finally {
      setUploadingDesktop(false);
    }
  };

  const handleUploadMobile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }
    setUploadingMobile(true);
    try {
      const res = await uploadToStorage(file, 'promotions', 'banners');
      if (res.url) {
        setFormData((prev) => ({
          ...prev,
          bannerMobile: res.url!,
        }));
        showToast('Mobile banner uploaded successfully!');
      } else {
        showToast('Failed to upload mobile image.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading mobile image.');
    } finally {
      setUploadingMobile(false);
    }
  };

  const handleQuickReplaceBannerImage = async (sec: BannerShowcaseSection, file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file.');
      return;
    }
    setReplacingBannerId(sec.id);
    try {
      const res = await uploadToStorage(file, 'promotions', 'banners');
      if (res.url) {
        await updateBannerShowcaseSection(sec.id, {
          bannerDesktop: res.url,
          bannerMobile: (!sec.bannerMobile || sec.bannerMobile === sec.bannerDesktop) ? res.url : sec.bannerMobile,
        });
        setSections((prev) =>
          prev.map((s) =>
            s.id === sec.id
              ? {
                  ...s,
                  bannerDesktop: res.url!,
                  bannerMobile: (!s.bannerMobile || s.bannerMobile === s.bannerDesktop) ? res.url! : s.bannerMobile,
                }
              : s
          )
        );
        showToast(`Updated banner image for "${sec.title || 'Section'}"!`);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to replace banner image.');
    } finally {
      setReplacingBannerId(null);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [secList, prods] = await Promise.all([
        getBannerShowcaseSections(),
        getAllCatalogProducts(),
      ]);
      setSections(secList);
      setCatalog(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('koskool_banner_showcase_updated', handleUpdate);
    window.addEventListener('koskool_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('koskool_banner_showcase_updated', handleUpdate);
      window.removeEventListener('koskool_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Section Handlers
  const handleOpenAdd = () => {
    setEditingSection(null);
    setFormData({
      title: '',
      bannerDesktop: PRESET_BANNER_IMAGES[0].desktop,
      bannerMobile: PRESET_BANNER_IMAGES[0].mobile,
      bannerAlt: '',
      bannerLink: '/collections/walkaroo-bounceez',
      gridRows: 2,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sec: BannerShowcaseSection) => {
    setEditingSection(sec);
    setFormData({
      title: sec.title || '',
      bannerDesktop: sec.bannerDesktop,
      bannerMobile: sec.bannerMobile,
      bannerAlt: sec.bannerAlt || '',
      bannerLink: sec.bannerLink || '',
      gridRows: (sec.gridRows === 1 || sec.gridRows === 2) ? sec.gridRows : 2,
      is_active: sec.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bannerDesktop.trim()) return;

    if (editingSection) {
      await updateBannerShowcaseSection(editingSection.id, {
        title: formData.title.trim() || 'Promotional Banner Showcase',
        bannerDesktop: formData.bannerDesktop.trim(),
        bannerMobile: formData.bannerMobile.trim() || formData.bannerDesktop.trim(),
        bannerAlt: formData.bannerAlt.trim() || formData.title.trim() || 'Banner',
        bannerLink: formData.bannerLink.trim() || '#',
        gridRows: formData.gridRows,
        is_active: formData.is_active,
      });
      showToast(`Updated "${formData.title || 'Banner'}" successfully!`);
    } else {
      await createBannerShowcaseSection({
        title: formData.title.trim() || 'Promotional Banner Showcase',
        bannerDesktop: formData.bannerDesktop.trim(),
        bannerMobile: formData.bannerMobile.trim() || formData.bannerDesktop.trim(),
        bannerAlt: formData.bannerAlt.trim() || formData.title.trim() || 'Banner',
        bannerLink: formData.bannerLink.trim() || '#',
        gridRows: formData.gridRows,
        is_active: formData.is_active,
        productIds: [
          'wgp53283-tan',
          'wgr53350-olive',
          'wgp53283-black',
          'wgr53512-olive',
          'wgp53410-tan',
          'wge53354-black',
          'w1030-black',
          'wv502-black',
        ],
      });
      showToast(`Created new banner section successfully!`);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteSection = async (sec: BannerShowcaseSection) => {
    if (!confirm(`Are you sure you want to delete "${sec.title || sec.id}" from homepage?`)) return;
    await deleteBannerShowcaseSection(sec.id);
    showToast(`Banner section deleted.`);
    loadData();
  };

  const handleToggleActive = async (sec: BannerShowcaseSection) => {
    const nextState = !sec.is_active;
    await updateBannerShowcaseSection(sec.id, { is_active: nextState });
    setSections(sections.map((s) => (s.id === sec.id ? { ...s, is_active: nextState } : s)));
    showToast(`"${sec.title || sec.id}" is now ${nextState ? 'Visible' : 'Hidden'} on Homepage!`);
  };

  const handleToggleGridRows = async (sec: BannerShowcaseSection, rows: 1 | 2) => {
    await updateBannerShowcaseSection(sec.id, { gridRows: rows });
    setSections(sections.map((s) => (s.id === sec.id ? { ...s, gridRows: rows } : s)));
    showToast(`Set to ${rows === 2 ? '2 Rows (up to 8 products)' : '1 Row (up to 4 products)'}!`);
  };

  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const list = [...sections];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const reordered = list.map((s, idx) => ({ id: s.id, display_order: idx + 1 }));
    setSections(list.map((s, idx) => ({ ...s, display_order: idx + 1 })));
    await reorderBannerShowcaseSections(reordered);
    showToast(`Section shifted to position #${targetIdx + 1}!`);
  };

  // Product Selection Handlers
  const handleOpenProductPicker = (sec: BannerShowcaseSection) => {
    setProductModalSection(sec);
    setSelectedProductIds([...sec.productIds]);
    setProductSearch('');
    setCategoryFilter('all');
  };

  const handleToggleProductInPicker = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSaveProductSelection = async () => {
    if (!productModalSection) return;
    await updateBannerShowcaseSection(productModalSection.id, {
      productIds: selectedProductIds,
    });
    setSections(
      sections.map((s) =>
        s.id === productModalSection.id ? { ...s, productIds: selectedProductIds } : s
      )
    );
    showToast(`Updated products for "${productModalSection.title || productModalSection.id}"!`);
    setProductModalSection(null);
  };

  const handleRemoveProductDirectly = async (sec: BannerShowcaseSection, productId: string) => {
    const updatedIds = sec.productIds.filter((id) => id !== productId);
    await updateBannerShowcaseSection(sec.id, { productIds: updatedIds });
    setSections(sections.map((s) => (s.id === sec.id ? { ...s, productIds: updatedIds } : s)));
    showToast(`Removed product from banner section.`);
  };

  const handleShiftProductInBanner = async (
    sec: BannerShowcaseSection,
    index: number,
    direction: 'left' | 'right'
  ) => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sec.productIds.length) return;

    const list = [...sec.productIds];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    await updateBannerShowcaseSection(sec.id, { productIds: list });
    setSections(sections.map((s) => (s.id === sec.id ? { ...s, productIds: list } : s)));
  };

  // Filter products for picker
  const filteredCatalog = catalog.filter((p) => {
    const matchesSearch =
      !productSearch.trim() ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || p.productType === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-bold mb-2">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Homepage Bottom Banner Showcases</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
            Bottom Banners &amp; Product Grids
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Manage the promotional banners displayed at the bottom of the homepage (like Bounceez &amp; Bloomsy), along with their product showcase grids (1 row or 2 rows). Add, edit, reorder banners and choose products with the Eye button.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-2xl shadow-sm transition self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner Section</span>
        </button>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="p-12 text-center text-gray-400">
          <div className="w-8 h-8 border-3 border-navy-950 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-medium">Loading banner showcase sections...</span>
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-navy-950">No Banner Sections Configured</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Click &quot;Add New Banner Section&quot; to create a banner card with products below it on your homepage.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
          >
            Create First Banner Section
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((sec, secIdx) => {
            const sectionProducts = sec.productIds
              .map((id) => catalog.find((p) => p.id === id || p.slug === id))
              .filter(Boolean) as Product[];

            const rows = sec.gridRows || 2;
            const limit = rows === 1 ? 4 : 8;

            return (
              <div
                key={sec.id}
                className={`bg-white rounded-3xl border overflow-hidden shadow-sm transition ${
                  sec.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50/50'
                }`}
              >
                {/* Banner Header Info */}
                <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <span className="bg-navy-950 text-white font-black text-xs px-3 py-1 rounded-full shrink-0">
                      #{secIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-navy-950">
                          {sec.title || 'Untitled Banner Section'}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sec.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {sec.is_active ? 'Active on Home' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">
                        Link: {sec.bannerLink || 'None'} • Grid: {rows} Row{rows > 1 ? 's' : ''} ({limit} products max)
                      </p>
                    </div>
                  </div>

                  {/* Actions & Reorder */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Shift Up/Down */}
                    <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => handleMoveSection(secIdx, 'up')}
                        disabled={secIdx === 0}
                        title="Move Up"
                        className="p-1 hover:bg-white rounded-lg text-gray-700 disabled:opacity-30 transition"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSection(secIdx, 'down')}
                        disabled={secIdx === sections.length - 1}
                        title="Move Down"
                        className="p-1 hover:bg-white rounded-lg text-gray-700 disabled:opacity-30 transition"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Active Toggle */}
                    <button
                      onClick={() => handleToggleActive(sec)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        sec.is_active
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                      title={sec.is_active ? 'Hide from Homepage' : 'Show on Homepage'}
                    >
                      {sec.is_active ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show</span>
                        </>
                      )}
                    </button>

                    {/* Edit Banner */}
                    <button
                      onClick={() => handleOpenEdit(sec)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Banner</span>
                    </button>

                    {/* Delete Banner */}
                    <button
                      onClick={() => handleDeleteSection(sec)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Banner Image Preview */}
                <div className="p-5 sm:p-6 border-b border-gray-100">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span>Banner Image Preview</span>
                      {sec.bannerMobile && sec.bannerMobile !== sec.bannerDesktop && (
                        <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full lowercase font-mono">
                          + mobile crop active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Quick Upload Button */}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition">
                        {replacingBannerId === sec.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-brand-600" />
                            <span>Upload New Image</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={replacingBannerId === sec.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleQuickReplaceBannerImage(sec, file);
                          }}
                          className="hidden"
                        />
                      </label>

                      <a
                        href={sec.bannerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-brand-600 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Visit Target Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="relative aspect-[1000/400] sm:aspect-[5760/1800] w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 group">
                    <img
                      src={sec.bannerDesktop}
                      alt={sec.bannerAlt || sec.title}
                      className="w-full h-full object-cover object-center"
                    />
                    {replacingBannerId === sec.id && (
                      <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center gap-2 text-white text-xs font-bold">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                        <span>Uploading &amp; applying new banner image...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Products Below Banner Section */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-navy-950 flex items-center gap-2">
                        <span>Products Below Banner</span>
                        <span className="text-xs font-bold bg-brand-50 text-brand-800 px-2 py-0.5 rounded-full">
                          {sectionProducts.length} Selected (Showing up to {limit})
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Choose whether to show 1 row (4 products) or 2 rows (8 products) on the homepage.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {/* 1 Row vs 2 Rows Grid Toggle */}
                      <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl text-xs font-bold">
                        <button
                          onClick={() => handleToggleGridRows(sec, 1)}
                          className={`px-3 py-1.5 rounded-lg transition ${
                            rows === 1
                              ? 'bg-white text-navy-950 shadow-sm'
                              : 'text-gray-500 hover:text-navy-950'
                          }`}
                        >
                          1 Row (4)
                        </button>
                        <button
                          onClick={() => handleToggleGridRows(sec, 2)}
                          className={`px-3 py-1.5 rounded-lg transition ${
                            rows === 2
                              ? 'bg-navy-950 text-white shadow-sm'
                              : 'text-gray-500 hover:text-navy-950'
                          }`}
                        >
                          2 Rows (8 Products)
                        </button>
                      </div>

                      {/* Add / Select Products Button */}
                      <button
                        onClick={() => handleOpenProductPicker(sec)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold rounded-xl shadow-sm transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Manage / Add Products</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Product Grid */}
                  {sectionProducts.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                      <p className="text-xs text-gray-400 font-medium">
                        No products selected for this banner. Click &quot;Manage / Add Products&quot; to pick items from your catalog.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {sectionProducts.slice(0, limit).map((prod, prodIdx) => (
                        <div
                          key={prod.id}
                          className="group relative bg-white rounded-2xl border border-gray-200 p-3 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                        >
                          {/* Order Badge & Remove Button */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                              #{prodIdx + 1}
                            </span>
                            <button
                              onClick={() => handleRemoveProductDirectly(sec, prod.id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition"
                              title="Remove product from banner"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Image */}
                          <div className="relative aspect-square bg-[#fbfbfb] rounded-xl overflow-hidden mb-2">
                            <Image
                              src={
                                prod.images[0] ||
                                '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'
                              }
                              alt={prod.name}
                              fill
                              className="object-contain p-2"
                            />
                          </div>

                          {/* Info */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-gray-400 block truncate">
                              {prod.brand}
                            </span>
                            <span className="text-xs font-bold text-navy-950 block truncate">
                              {prod.name}
                            </span>
                            <span className="text-xs font-black text-brand-600 block">
                              ₹{prod.price}
                            </span>
                          </div>

                          {/* Shift Left/Right */}
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                            <button
                              disabled={prodIdx === 0}
                              onClick={() => handleShiftProductInBanner(sec, prodIdx, 'left')}
                              className="p-1 text-gray-400 hover:text-navy-950 disabled:opacity-20 transition"
                              title="Move Left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[9px] text-gray-400 font-medium">Reorder</span>
                            <button
                              disabled={prodIdx === sectionProducts.length - 1}
                              onClick={() => handleShiftProductInBanner(sec, prodIdx, 'right')}
                              className="p-1 text-gray-400 hover:text-navy-950 disabled:opacity-20 transition"
                              title="Move Right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sectionProducts.length > limit && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      Note: You have {sectionProducts.length} products assigned, but the grid is set to {rows} row{rows > 1 ? 's' : ''} (showing first {limit} products on homepage).
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT BANNER SECTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-black text-navy-950">
                {editingSection ? 'Edit Banner Section' : 'Add New Bottom Banner Section'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1">
                  Section Title / Collection Name
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. BOUNCEEZ - A Perfect Cushion For Your Foot"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-600"
                  required
                />
              </div>

              {/* Preset Selector with 6th slot Upload button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-navy-950">
                    Choose Preset Banner Image (or upload your own)
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">Quick Select</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_BANNER_IMAGES.map((preset, pi) => (
                    <button
                      key={pi}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          bannerDesktop: preset.desktop,
                          bannerMobile: preset.mobile,
                          bannerAlt: preset.label,
                        })
                      }
                      className={`text-left p-2.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-2 ${
                        formData.bannerDesktop === preset.desktop
                          ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                        <img src={preset.desktop} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}

                  {/* 6th Button: Direct Image Upload from Device */}
                  <label
                    className={`text-left p-2.5 rounded-xl border-2 border-dashed text-[11px] font-bold transition flex items-center gap-2 cursor-pointer ${
                      uploadingDesktop
                        ? 'border-brand-500 bg-brand-50 text-brand-700 animate-pulse'
                        : 'border-brand-300 hover:border-brand-500 bg-brand-50/50 hover:bg-brand-50 text-brand-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 text-brand-600">
                      {uploadingDesktop ? (
                        <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-brand-600" />
                      )}
                    </div>
                    <div className="truncate">
                      <span>{uploadingDesktop ? 'Uploading Image...' : 'Upload Image from Computer'}</span>
                      <span className="block text-[9px] font-normal text-brand-600/80">Click or drop file</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingDesktop}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadDesktop(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Desktop Banner Image Upload & URL */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-navy-950">
                    Desktop Banner Image <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Recommended: 1920×700 or wide landscape banner
                  </span>
                </div>

                {/* Live Preview & Upload Area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverDesktop(true);
                  }}
                  onDragLeave={() => setDragOverDesktop(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverDesktop(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUploadDesktop(file);
                  }}
                  className={`relative rounded-2xl border-2 transition overflow-hidden ${
                    dragOverDesktop
                      ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-400'
                      : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                  }`}
                >
                  {formData.bannerDesktop ? (
                    <div className="p-3">
                      <div className="relative aspect-[1000/380] w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shadow-inner group">
                        <img
                          src={formData.bannerDesktop}
                          alt="Desktop Preview"
                          className="w-full h-full object-cover"
                        />

                        {/* Hover Overlay with Upload / Replace button */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-navy-950 text-xs font-bold hover:bg-brand-50 hover:text-brand-700 shadow-lg transition">
                            <Upload className="w-3.5 h-3.5 text-brand-600" />
                            <span>Upload &amp; Replace Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingDesktop}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadDesktop(file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {uploadingDesktop && (
                          <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center gap-2 text-white text-xs font-bold">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                            <span>Uploading desktop image...</span>
                          </div>
                        )}
                      </div>

                      {/* Action Bar below preview */}
                      <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-[11px] font-bold transition">
                            {uploadingDesktop ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-brand-600" />
                            )}
                            <span>{uploadingDesktop ? 'Uploading...' : 'Choose File to Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingDesktop}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadDesktop(file);
                              }}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] text-gray-400">or drag & drop here</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 truncate max-w-[200px]" title={formData.bannerDesktop}>
                          {formData.bannerDesktop.startsWith('data:') ? 'Custom Uploaded Data' : formData.bannerDesktop}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Empty state upload box */
                    <label className="p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer block">
                      <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">
                        {uploadingDesktop ? (
                          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-navy-950 block">
                          {uploadingDesktop ? 'Uploading image...' : 'Click or drag image file here to upload'}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-0.5 block">
                          Supports PNG, JPG, WebP, SVG
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingDesktop}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadDesktop(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Desktop URL manual edit field */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={formData.bannerDesktop}
                    onChange={(e) => setFormData({ ...formData, bannerDesktop: e.target.value })}
                    placeholder="Desktop Banner Image URL (or upload above)..."
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-600 bg-gray-50/50"
                    required
                  />
                </div>
              </div>

              {/* Mobile Banner Image Upload & URL */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-navy-950">
                    Mobile Banner Image (Optional)
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Defaults to desktop banner if left empty
                  </span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverMobile(true);
                  }}
                  onDragLeave={() => setDragOverMobile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverMobile(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUploadMobile(file);
                  }}
                  className={`relative rounded-2xl border-2 transition overflow-hidden ${
                    dragOverMobile
                      ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-400'
                      : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                  }`}
                >
                  {formData.bannerMobile && formData.bannerMobile !== formData.bannerDesktop ? (
                    <div className="p-3">
                      <div className="relative aspect-[1000/500] max-h-36 w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-200 shadow-inner group">
                        <img
                          src={formData.bannerMobile}
                          alt="Mobile Preview"
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-navy-950 text-xs font-bold hover:bg-brand-50 hover:text-brand-700 shadow-lg transition">
                            <Upload className="w-3.5 h-3.5 text-brand-600" />
                            <span>Replace Mobile Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingMobile}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadMobile(file);
                              }}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, bannerMobile: '' })}
                            className="px-2.5 py-1.5 rounded-xl bg-white/90 text-red-600 text-xs font-bold hover:bg-red-50 transition"
                            title="Reset to use desktop image"
                          >
                            Remove
                          </button>
                        </div>

                        {uploadingMobile && (
                          <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center gap-2 text-white text-xs font-bold">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                            <span>Uploading mobile banner...</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-[11px] font-bold transition">
                            {uploadingMobile ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-brand-600" />
                            )}
                            <span>{uploadingMobile ? 'Uploading...' : 'Upload Mobile Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingMobile}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadMobile(file);
                              }}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, bannerMobile: '' })}
                            className="text-[11px] font-bold text-gray-500 hover:text-red-600 transition"
                          >
                            Use Desktop Image
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                          {uploadingMobile ? (
                            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                          ) : (
                            <ImageIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-navy-950 block">
                            Using desktop banner for mobile devices
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            Upload a dedicated mobile crop if preferred
                          </span>
                        </div>
                      </div>

                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition shrink-0">
                        {uploadingMobile ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 text-brand-600" />
                        )}
                        <span>{uploadingMobile ? 'Uploading...' : 'Upload Mobile Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingMobile}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadMobile(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={formData.bannerMobile}
                  onChange={(e) => setFormData({ ...formData, bannerMobile: e.target.value })}
                  placeholder="Mobile Banner Image URL (optional, or upload above)..."
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-600 bg-gray-50/50"
                />
              </div>

              {/* Target Link */}
              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1">
                  Clickable Destination Link URL
                </label>
                <input
                  type="text"
                  value={formData.bannerLink}
                  onChange={(e) => setFormData({ ...formData, bannerLink: e.target.value })}
                  placeholder="e.g. /collections/walkaroo-bounceez"
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-600"
                />
              </div>

              {/* Grid Rows Setting */}
              <div>
                <label className="block text-xs font-bold text-navy-950 mb-1">
                  Product Grid Rows on Homepage
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gridRows: 1 })}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      formData.gridRows === 1
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    1 Row (4 Products)
                    <span className="block text-[10px] font-normal text-gray-500 mt-0.5">
                      Compact single row
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gridRows: 2 })}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      formData.gridRows === 2
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    2 Rows (8 Products)
                    <span className="block text-[10px] font-normal text-gray-500 mt-0.5">
                      Grid of 2 rows (4 per row)
                    </span>
                  </button>
                </div>
              </div>

              {/* Visibility Switch */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="section_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="section_active" className="text-xs font-bold text-navy-950 cursor-pointer">
                  Show this banner section on the Homepage
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  {editingSection ? 'Save Changes' : 'Create Banner Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE & SELECT PRODUCTS (WITH EYE TOGGLE BUTTON) */}
      {productModalSection && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-200 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div>
                <h3 className="text-lg font-black text-navy-950">
                  Select Products for &quot;{productModalSection.title}&quot;
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Click the Eye button or product card to add or remove it from this banner showcase.
                </p>
              </div>
              <button
                onClick={() => setProductModalSection(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-gray-100 bg-white shrink-0 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by product name or SKU..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-600"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-600 bg-white"
              >
                <option value="all">All Product Types</option>
                <option value="school-shoes">School Shoes</option>
                <option value="sports-shoes">PT &amp; Sports Shoes</option>
                <option value="fabric-shoes">Canvas &amp; Fabric</option>
                <option value="sandals">Sandals</option>
                <option value="daily-wear">Daily Wear</option>
                <option value="bags">Backpacks</option>
                <option value="accessories">Accessories</option>
              </select>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold shrink-0 self-start sm:self-center">
                <span>{selectedProductIds.length} Selected</span>
                <span className="text-[10px] text-brand-600">
                  ({Math.ceil(selectedProductIds.length / 4)} row{Math.ceil(selectedProductIds.length / 4) > 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {/* Products Grid in Modal */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredCatalog.map((prod) => {
                const isSelected = selectedProductIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleToggleProductInPicker(prod.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/40 shadow-xs ring-2 ring-brand-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 relative overflow-hidden shrink-0">
                        <Image
                          src={
                            prod.images[0] ||
                            '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'
                          }
                          alt={prod.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-gray-400 block truncate">
                          {prod.brand}
                        </span>
                        <h4 className="text-xs font-bold text-navy-950 truncate max-w-[170px]">
                          {prod.name}
                        </h4>
                        <span className="text-xs font-black text-brand-600">
                          ₹{prod.price}
                        </span>
                      </div>
                    </div>

                    {/* EYE BUTTON TO SHOW / HIDE PRODUCT */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleProductInPicker(prod.id);
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition shrink-0 ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-500'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-navy-950'
                      }`}
                      title={isSelected ? 'Showing on Homepage (Click to remove)' : 'Show on Homepage under this Banner'}
                    >
                      {isSelected ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Tip: 8 products form 2 clean rows on desktop.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalSection(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProductSelection}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  Apply &amp; Save ({selectedProductIds.length} Products)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
