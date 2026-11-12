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
} from 'lucide-react';
import {
  getPromotionalBanners,
  createPromotionalBanner,
  updatePromotionalBanner,
  deletePromotionalBanner,
  PromotionalBanner,
} from '@/services/api';
import { uploadToStorage } from '@/lib/supabase';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner[] | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PromotionalBanner | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'SPECIAL PROMO',
    image_url: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',
    primary_cta_text: 'Shop Now',
    primary_cta_link: '/collections/boys',
    secondary_cta_text: 'Explore Accessories',
    secondary_cta_link: '/collections/accessories',
    is_active: true,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

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
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      subtitle: '',
      badge: 'SPECIAL PROMO',
      image_url: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',
      primary_cta_text: 'Shop Now',
      primary_cta_link: '/collections/boys',
      secondary_cta_text: 'Explore Bags',
      secondary_cta_link: '/collections/bags',
      is_active: true,
    });
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: PromotionalBanner) => {
    setEditingBanner([b]);
    setFormData({
      title: b.title,
      subtitle: b.subtitle,
      badge: b.badge || 'PROMO',
      image_url: b.image_url,
      primary_cta_text: b.primary_cta_text,
      primary_cta_link: b.primary_cta_link,
      secondary_cta_text: b.secondary_cta_text || '',
      secondary_cta_link: b.secondary_cta_link || '',
      is_active: b.is_active,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner && editingBanner[0]) {
      await updatePromotionalBanner(editingBanner[0].id, formData);
    } else {
      await createPromotionalBanner(formData);
    }
    setIsModalOpen(false);
    fetchBannersList();
  };

  const handleConfirmDelete = async () => {
    if (deleteCandidate) {
      await deletePromotionalBanner(deleteCandidate.id);
      setDeleteCandidate(null);
      fetchBannersList();
    }
  };

  const handleToggleActive = async (b: PromotionalBanner) => {
    await updatePromotionalBanner(b.id, { is_active: !b.is_active });
    fetchBannersList();
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const res = await uploadToStorage(file, 'promotions', 'banners');
    if (res.url) {
      setFormData((prev) => ({ ...prev, image_url: res.url! }));
    }
    setUploadingImage(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Promotional Board / Banners</h1>
          <p className="text-xs text-gray-500">
            Publish seasonal campaign banners and student announcements directly via Supabase.
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

      {/* Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* Visual Live Preview Banner */}
            <div className="relative bg-navy-950 min-h-[200px] flex items-center p-6 text-white overflow-hidden">
              <Image src={b.image_url} alt={b.title} fill className="object-cover opacity-40" />
              <div className="relative z-10 space-y-2 max-w-sm">
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

              {/* Status pill */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    b.is_active
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {b.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Banner Controls & Actions */}
            <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="text-gray-500">
                <span className="font-bold">Destination:</span> {b.primary_cta_link}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-navy-950 hover:bg-gray-200 transition"
                  title="Edit Banner"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteCandidate(b)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 transition"
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
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-navy-950">
                {editingBanner ? 'Edit Promotional Banner' : 'Create Promotional Banner'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-gray-400">
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

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Destination URL Link</label>
                <input
                  type="text"
                  value={formData.primary_cta_link}
                  onChange={(e) => setFormData({ ...formData, primary_cta_link: e.target.value })}
                  placeholder="e.g. /collections/school-shoes"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none"
                />
              </div>

              {/* Banner Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Banner Background Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl bg-gray-900 relative overflow-hidden border border-gray-200 shrink-0">
                    <Image src={formData.image_url} alt="Banner Preview" fill className="object-cover" />
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-navy-950 px-3.5 py-2 rounded-xl text-xs font-bold transition">
                    <Upload className="w-4 h-4 text-brand-600" />
                    <span>Upload to Supabase Storage (promotions)</span>
                    <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                  </label>
                  {uploadingImage && <span className="text-xs text-brand-600 font-bold">Uploading...</span>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
