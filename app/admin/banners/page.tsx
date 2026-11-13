'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  CheckCircle,
  XCircle,
  X,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  getPromotionalBanners,
  createPromotionalBanner,
  updatePromotionalBanner,
  deletePromotionalBanner,
  reorderPromotionalBanners,
  PromotionalBanner,
} from '@/services/api';
import { uploadToStorage } from '@/lib/supabase';

const PRESET_BANNER_IMAGES = [
  { label: 'School Uniform Hero (Boys & Girls)', url: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg' },
  { label: 'PT & Sports Drill Shoes Banner', url: '/cdn/shop/files/Sports-Shoe-Web-Banner_934e3fd0-00bd-4c35-a071-b8943d6e32a6.v_1778128141_width_5760.jpg' },
  { label: 'Kindergarten & Junior Steps Banner', url: '/cdn/shop/files/Kids-Banner.v_1768369268_width_5760.jpg' },
  { label: 'Bounceez Ergonomic Sole Banner', url: '/cdn/shop/files/Bounceez-Web-Banner-4_94081796-b190-48a0-a99c-0b229a04a5c0.v_1772773040_width_5760.jpg' },
  { label: 'Bloomsy Collection Banner', url: '/cdn/shop/files/Bloomsy-Web-Banner_47afcd51-e579-4b9f-a174-6a95c1fa1213.v_1781954684_width_5760.jpg' },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PromotionalBanner | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'SPECIAL PROMO',
    image_url: PRESET_BANNER_IMAGES[0].url,
    primary_cta_text: 'Shop Now',
    primary_cta_link: '/collections/boys',
    secondary_cta_text: 'Explore Accessories',
    secondary_cta_link: '/collections/accessories',
    display_order: 1,
    is_active: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchBannersList = async () => {
    setLoading(true);
    try {
      const data = await getPromotionalBanners();
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannersList();

    const handleUpdate = () => {
      fetchBannersList();
    };

    window.addEventListener('koskool_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('koskool_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleOpenAdd = () => {
    const nextOrder =
      banners.length > 0
        ? Math.max(...banners.map((b) => Number(b.display_order) || 0)) + 1
        : 1;

    setFormData({
      title: '',
      subtitle: '',
      badge: 'SPECIAL PROMO',
      image_url: PRESET_BANNER_IMAGES[0].url,
      primary_cta_text: 'Shop Now',
      primary_cta_link: '/collections/boys',
      secondary_cta_text: 'Explore Accessories',
      secondary_cta_link: '/collections/accessories',
      display_order: nextOrder,
      is_active: true,
    });
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: PromotionalBanner) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle,
      badge: b.badge || 'PROMO',
      image_url: b.image_url,
      primary_cta_text: b.primary_cta_text,
      primary_cta_link: b.primary_cta_link,
      secondary_cta_text: b.secondary_cta_text || '',
      secondary_cta_link: b.secondary_cta_link || '',
      display_order: Number(b.display_order) || 1,
      is_active: b.is_active,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const payload = {
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      badge: formData.badge.trim() || 'PROMO',
      image_url: formData.image_url.trim() || PRESET_BANNER_IMAGES[0].url,
      primary_cta_text: formData.primary_cta_text.trim() || 'Shop Now',
      primary_cta_link: formData.primary_cta_link.trim() || '/collections/boys',
      secondary_cta_text: formData.secondary_cta_text.trim(),
      secondary_cta_link: formData.secondary_cta_link.trim(),
      display_order: Number(formData.display_order) || 1,
      is_active: formData.is_active,
    };

    if (editingBanner) {
      await updatePromotionalBanner(editingBanner.id, payload);
      showNotification(`Banner updated at position #${payload.display_order}! Live on home page.`);
    } else {
      await createPromotionalBanner(payload);
      showNotification(`New promotional banner added at position #${payload.display_order}! Live on home page.`);
    }

    setIsModalOpen(false);
    setEditingBanner(null);
    await fetchBannersList();
  };

  const handleConfirmDelete = async () => {
    if (deleteCandidate) {
      await deletePromotionalBanner(deleteCandidate.id);
      showNotification(`Banner "${deleteCandidate.title}" removed.`);
      setDeleteCandidate(null);
      await fetchBannersList();
    }
  };

  const handleToggleActive = async (b: PromotionalBanner) => {
    const updatedStatus = !b.is_active;
    await updatePromotionalBanner(b.id, { is_active: updatedStatus });
    showNotification(`Banner is now ${updatedStatus ? 'Visible (Active)' : 'Hidden (Disabled)'} on home page!`);
    await fetchBannersList();
  };

  const handleMoveOrder = async (idx: number, direction: 'up' | 'down') => {
    const list = [...banners];
    const target = list[idx];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;

    list[idx] = list[swapIdx];
    list[swapIdx] = target;

    // Renumber sequentially 1, 2, 3...
    const payload = list.map((b, i) => ({ id: b.id, display_order: i + 1 }));
    setBanners(list.map((b, i) => ({ ...b, display_order: i + 1 })));
    await reorderPromotionalBanners(payload);
    showNotification(`Banners reordered! Shifted to position #${swapIdx + 1}.`);
    await fetchBannersList();
  };

  const handleDirectOrderChange = async (bannerId: string, newOrder: number) => {
    if (isNaN(newOrder) || newOrder < 1) return;
    await updatePromotionalBanner(bannerId, { display_order: newOrder });
    showNotification(`Banner position set to #${newOrder}! Live on home page.`);
    await fetchBannersList();
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const res = await uploadToStorage(file, 'promotions', 'banners');
    if (res.url) {
      setFormData((prev) => ({ ...prev, image_url: res.url! }));
      showNotification('Banner image attached successfully.');
    }
    setUploadingImage(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-navy-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-brand-500 flex items-center gap-2.5 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Promotional Board / Banners</h1>
          <p className="text-xs text-gray-500">
            Publish seasonal campaign banners. Each banner will be shown on the home page carousel at your chosen position number.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Promotional Banner</span>
        </button>
      </div>

      {/* Info Card Explaining Position Number */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
          <span>
            <strong>Home Page Ordering:</strong> Set the position number (e.g. 1, 2, 3) to choose where each promotional banner appears in the home page slideshow alongside the static school uniform banners.
          </span>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* Visual Live Preview Banner */}
            <div className="relative bg-navy-950 min-h-[200px] flex items-center p-6 text-white overflow-hidden">
              <Image src={b.image_url} alt={b.title} fill className="object-cover opacity-40" />
              
              {/* Home Page Position Number Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-wide bg-navy-950/90 text-amber-400 border border-amber-400/40 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                  <span className="text-[10px] uppercase text-gray-300 font-bold">Home Page No.</span>
                  <span className="bg-amber-400 text-navy-950 px-2 py-0.5 rounded-full font-black text-[12px] leading-none">
                    #{b.display_order ?? idx + 1}
                  </span>
                </span>
              </div>

              {/* Status pill */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow ${
                    b.is_active
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {b.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="relative z-10 space-y-2 max-w-sm mt-6">
                <span className="text-[10px] font-black uppercase tracking-wider bg-brand-600 px-2.5 py-0.5 rounded-full">
                  {b.badge}
                </span>
                <h3 className="text-lg font-black">{b.title}</h3>
                <p className="text-xs text-gray-200 line-clamp-2">{b.subtitle}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold bg-white text-navy-950 px-3 py-1 rounded-lg">
                    {b.primary_cta_text}
                  </span>
                  {b.secondary_cta_text && (
                    <span className="text-[10px] font-bold bg-white/20 text-white px-3 py-1 rounded-lg">
                      {b.secondary_cta_text}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Banner Controls & Actions */}
            <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1.5">
                <div className="text-gray-500 truncate max-w-xs">
                  <span className="font-bold text-gray-700">Destination:</span> {b.primary_cta_link}
                </div>
                
                {/* At What Number Shown On Home Page Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-600">Home Page Position No:</span>
                  <div className="inline-flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-xs">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      defaultValue={b.display_order ?? idx + 1}
                      key={`${b.id}-${b.display_order}`}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (val && val !== b.display_order) {
                          handleDirectOrderChange(b.id, val);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt((e.target as HTMLInputElement).value);
                          if (val && val !== b.display_order) {
                            handleDirectOrderChange(b.id, val);
                          }
                        }
                      }}
                      className="w-12 text-center text-xs font-black text-navy-950 py-1 focus:outline-none focus:bg-amber-50"
                      title="Set homepage display number and press Enter"
                    />
                    <div className="flex flex-col border-l border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="px-1.5 py-0.5 hover:bg-gray-100 disabled:opacity-30 text-gray-600"
                        title="Move higher priority (lower number)"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === banners.length - 1}
                        className="px-1.5 py-0.5 hover:bg-gray-100 disabled:opacity-30 text-gray-600 border-t border-gray-100"
                        title="Move lower priority (higher number)"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-2 rounded-xl text-gray-600 hover:text-navy-950 hover:bg-gray-200 transition"
                  title="Edit Banner"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteCandidate(b)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-100 transition"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-navy-950">
                {editingBanner ? 'Edit Promotional Banner' : 'Create Promotional Banner'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBanner(null);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Back-to-School Mega Admission Discount"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle / Details</label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Details about the promotion or uniform offer..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. ANNUAL SPECIAL"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Primary CTA Button</label>
                  <input
                    type="text"
                    value={formData.primary_cta_text}
                    onChange={(e) => setFormData({ ...formData, primary_cta_text: e.target.value })}
                    placeholder="e.g. Shop School Shoes"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Destination URL Link</label>
                  <input
                    type="text"
                    value={formData.primary_cta_link}
                    onChange={(e) => setFormData({ ...formData, primary_cta_link: e.target.value })}
                    placeholder="e.g. /collections/boys"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Secondary Button (Optional)</label>
                  <input
                    type="text"
                    value={formData.secondary_cta_text}
                    onChange={(e) => setFormData({ ...formData, secondary_cta_text: e.target.value })}
                    placeholder="e.g. Explore Girls"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none"
                  />
                </div>
              </div>

              {/* Homepage Position & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                <div>
                  <label className="block text-xs font-black text-navy-950 mb-1">
                    Home Page Position No. *
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    placeholder="e.g. 1"
                    className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs text-navy-950 font-black focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <p className="text-[10px] text-amber-800 font-medium mt-1">
                    At what slide number this banner is shown on the home page (1 = 1st, 2 = 2nd, etc.)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black text-navy-950 mb-1">
                    Visibility on Home Page
                  </label>
                  <select
                    value={formData.is_active ? 'active' : 'disabled'}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.value === 'active' })
                    }
                    className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs text-navy-950 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="active">Active (Visible on Homepage)</option>
                    <option value="disabled">Disabled (Hidden from Homepage)</option>
                  </select>
                  <p className="text-[10px] text-amber-800 font-medium mt-1">
                    Toggle whether this banner is published live
                  </p>
                </div>
              </div>

              {/* Preset High-Resolution Banner Images */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Select Banner Image Preset (Quick Pick)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {PRESET_BANNER_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => setFormData({ ...formData, image_url: preset.url })}
                      className={`text-left p-2 rounded-xl border text-[11px] font-bold transition flex items-center gap-2 ${
                        formData.image_url === preset.url
                          ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-8 h-6 bg-navy-950 rounded relative overflow-hidden shrink-0">
                        <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                      </div>
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-bold text-gray-700 mb-1">Or Custom Image URL / Upload</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl bg-gray-900 relative overflow-hidden border border-gray-200 shrink-0">
                    <Image src={formData.image_url} alt="Banner Preview" fill className="object-cover" />
                  </div>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Enter image URL..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-navy-950 focus:outline-none"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-navy-950 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0">
                    <Upload className="w-4 h-4 text-brand-600" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                  </label>
                  {uploadingImage && <span className="text-xs text-brand-600 font-bold">Uploading...</span>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBanner(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow"
                >
                  Save &amp; Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-gray-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-navy-950">Delete Promotional Banner</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete banner <strong className="text-gray-900">{deleteCandidate.title}</strong>?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
