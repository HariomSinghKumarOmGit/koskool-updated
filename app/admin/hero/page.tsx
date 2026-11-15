'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoveLeft,
  MoveRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  X,
  Layers,
  Sliders,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  HeroSlide,
} from '@/services/api';
import { uploadToStorage } from '@/lib/supabase';

const PRESET_BANNER_IMAGES = [
  { label: 'School Uniform Hero (Boys & Girls)', url: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg' },
  { label: 'PT & Sports Drill Shoes Banner', url: '/cdn/shop/files/Sports-Shoe-Web-Banner_934e3fd0-00bd-4c35-a071-b8943d6e32a6.v_1778128141_width_5760.jpg' },
  { label: 'Kindergarten & Junior Steps Banner', url: '/cdn/shop/files/Kids-Banner.v_1768369268_width_5760.jpg' },
  { label: 'Bounceez Ergonomic Sole Banner', url: '/cdn/shop/files/Bounceez-Web-Banner-4_94081796-b190-48a0-a99c-0b229a04a5c0.v_1772773040_width_5760.jpg' },
  { label: 'Bloomsy Collection Banner', url: '/cdn/shop/files/Bloomsy-Web-Banner_47afcd51-e579-4b9f-a174-6a95c1fa1213.v_1781954684_width_5760.jpg' },
];

export default function AdminHeroSectionPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const [dragOverDesktop, setDragOverDesktop] = useState(false);
  const [dragOverMobile, setDragOverMobile] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    badge: 'KOSKOOL 2026',
    title: '',
    subtitle: '',
    desktopImage: PRESET_BANNER_IMAGES[0].url,
    mobileImage: PRESET_BANNER_IMAGES[0].url,
    primaryCtaText: 'Shop Boys',
    primaryCtaLink: '/collections/boys',
    secondaryCtaText: 'Shop Girls',
    secondaryCtaLink: '/collections/girls',
    tertiaryCtaText: 'Explore Accessories',
    tertiaryCtaLink: '/collections/accessories',
    is_active: true,
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDesktopUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file (PNG, JPG, WEBP, SVG, etc.).');
      return;
    }
    setUploadingDesktop(true);
    try {
      const res = await uploadToStorage(file, 'promotions', 'hero-slides');
      if (res.url) {
        setFormData((prev) => ({
          ...prev,
          desktopImage: res.url!,
          mobileImage:
            !prev.mobileImage || prev.mobileImage.includes('School-Mobile-Banner')
              ? res.url!
              : prev.mobileImage,
        }));
        showNotification('Desktop banner uploaded successfully! Live preview updated.');
      } else {
        showNotification('Image upload failed. Please try a different file.');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Upload error. Please try again.');
    } finally {
      setUploadingDesktop(false);
    }
  };

  const handleMobileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file (PNG, JPG, WEBP, SVG, etc.).');
      return;
    }
    setUploadingMobile(true);
    try {
      const res = await uploadToStorage(file, 'promotions', 'hero-slides');
      if (res.url) {
        setFormData((prev) => ({
          ...prev,
          mobileImage: res.url!,
        }));
        showNotification('Mobile banner uploaded successfully!');
      } else {
        showNotification('Image upload failed. Please try a different file.');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Upload error. Please try again.');
    } finally {
      setUploadingMobile(false);
    }
  };

  const loadSlides = async () => {
    setLoading(true);
    try {
      const data = await getHeroSlides();
      setSlides(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  // Quick Shift Slide Order (Left or Right / 1st, 2nd, 3rd)
  const handleShift = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);

    const updatedSlides = newSlides.map((slide, idx) => ({
      ...slide,
      display_order: idx + 1,
    }));

    setSlides(updatedSlides);
    await reorderHeroSlides(updatedSlides.map((s) => ({ id: s.id, display_order: s.display_order })));
    showNotification(`Slide shifted to position #${targetIndex + 1}! Live on homepage.`);
  };

  // Move directly to specific place (1st, 2nd, 3rd)
  const handleMoveToPosition = async (index: number, newPosition: number) => {
    const targetIdx = newPosition - 1;
    if (targetIdx === index || targetIdx < 0 || targetIdx >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIdx, 0, moved);

    const updatedSlides = newSlides.map((slide, idx) => ({
      ...slide,
      display_order: idx + 1,
    }));

    setSlides(updatedSlides);
    await reorderHeroSlides(updatedSlides.map((s) => ({ id: s.id, display_order: s.display_order })));
    showNotification(`Slide placed in position #${newPosition}! Homepage updated.`);
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    const updatedStatus = !slide.is_active;
    await updateHeroSlide(slide.id, { is_active: updatedStatus });
    setSlides(slides.map((s) => (s.id === slide.id ? { ...s, is_active: updatedStatus } : s)));
    showNotification(`Slide #${slide.display_order} is now ${updatedStatus ? 'Visible' : 'Hidden'} on Homepage!`);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;
    await deleteHeroSlide(id);
    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    showNotification('Hero slide removed.');
  };

  const handleOpenAdd = () => {
    setEditingSlide(null);
    setFormData({
      badge: 'OFFICIAL 2026',
      title: 'New School Collection',
      subtitle: 'Discover uniform compliant footwear and school essentials.',
      desktopImage: PRESET_BANNER_IMAGES[0].url,
      mobileImage: PRESET_BANNER_IMAGES[0].url,
      primaryCtaText: 'Shop Boys',
      primaryCtaLink: '/collections/boys',
      secondaryCtaText: 'Shop Girls',
      secondaryCtaLink: '/collections/girls',
      tertiaryCtaText: 'Explore Bags',
      tertiaryCtaLink: '/collections/bags',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      badge: slide.badge,
      title: slide.title,
      subtitle: slide.subtitle,
      desktopImage: slide.desktopImage,
      mobileImage: slide.mobileImage,
      primaryCtaText: slide.primaryCtaText,
      primaryCtaLink: slide.primaryCtaLink,
      secondaryCtaText: slide.secondaryCtaText,
      secondaryCtaLink: slide.secondaryCtaLink,
      tertiaryCtaText: slide.tertiaryCtaText,
      tertiaryCtaLink: slide.tertiaryCtaLink,
      is_active: slide.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      await updateHeroSlide(editingSlide.id, formData);
      showNotification('Slide updated! Homepage updated live.');
    } else {
      await createHeroSlide(formData);
      showNotification('New slide added to Homepage hero slideshow!');
    }
    setIsModalOpen(false);
    loadSlides();
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Toast Notification */}
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
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-navy-950">Hero Slideshow Manager</h1>
          </div>
          <p className="text-xs text-gray-500">
            Control the order (1st, 2nd, 3rd place, shift left/right), titles, badges, and action CTA links on the main homepage slideshow.
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
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Slide</span>
          </button>
        </div>
      </div>

      {/* Quick Helper Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-black text-navy-950">
            <Sliders className="w-4 h-4 text-brand-600" />
            <span>Interactive Positioning &amp; Shifting Active</span>
          </div>
          <p className="text-gray-600 text-[11px] leading-relaxed">
            Use the <strong>Shift Left</strong> and <strong>Shift Right</strong> arrow controls or select <strong>Position 1st, 2nd, 3rd</strong> directly on each card. Any order or pricing changes apply instantly to the homepage and subpages!
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-white rounded-full border border-blue-200 font-bold text-navy-950 text-[11px]">
            {slides.filter((s) => s.is_active).length} of {slides.length} Slides Active
          </span>
        </div>
      </div>

      {/* Slides Grid / List */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-gray-400">Loading hero slides...</div>
      ) : slides.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center space-y-3">
          <p className="text-sm font-bold text-gray-500">No hero slides found.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
          >
            Create Slide
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`bg-white rounded-3xl border transition shadow-sm hover:shadow overflow-hidden flex flex-col lg:flex-row ${
                slide.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              {/* Image Preview & Order Badge */}
              <div className="lg:w-96 relative bg-navy-950 min-h-[220px] shrink-0 overflow-hidden">
                <Image
                  src={slide.desktopImage}
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Position & Status Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-brand-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    #{index + 1} {index === 0 ? '(1st Display)' : index === 1 ? '(2nd Display)' : index === 2 ? '(3rd Display)' : ''}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      slide.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-600 text-gray-200'
                    }`}
                  >
                    {slide.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Shift Left / Right Overlay Controls */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <button
                    disabled={index === 0}
                    onClick={() => handleShift(index, 'left')}
                    className="px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 backdrop-blur"
                    title="Shift Left (Earlier in Carousel)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Shift Left</span>
                  </button>

                  <button
                    disabled={index === slides.length - 1}
                    onClick={() => handleShift(index, 'right')}
                    className="px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 backdrop-blur"
                    title="Shift Right (Later in Carousel)"
                  >
                    <span>Shift Right</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Slide Meta & Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                      {slide.badge}
                    </span>

                    {/* Direct Move to Position Dropdown */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-gray-400 font-bold text-[11px]">Set Order:</span>
                      <select
                        value={index + 1}
                        onChange={(e) => handleMoveToPosition(index, Number(e.target.value))}
                        className="bg-gray-100 hover:bg-gray-200 text-navy-950 font-bold text-xs py-1 px-2 rounded-lg border border-gray-300 focus:outline-none cursor-pointer"
                      >
                        {slides.map((_, i) => (
                          <option key={i} value={i + 1}>
                            Place #{i + 1} {i === 0 ? '(1st)' : i === 1 ? '(2nd)' : i === 2 ? '(3rd)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-navy-950 leading-snug">{slide.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{slide.subtitle}</p>
                </div>

                {/* Call to Actions on Slide */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-gray-400 mr-1">CTA Buttons:</span>
                  <span className="bg-navy-950 text-white font-bold px-3 py-1 rounded-lg">
                    1. {slide.primaryCtaText} ({slide.primaryCtaLink})
                  </span>
                  {slide.secondaryCtaText && (
                    <span className="bg-gray-100 text-navy-950 font-bold px-3 py-1 rounded-lg">
                      2. {slide.secondaryCtaText} ({slide.secondaryCtaLink})
                    </span>
                  )}
                  {slide.tertiaryCtaText && (
                    <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-lg">
                      3. {slide.tertiaryCtaText} ({slide.tertiaryCtaLink})
                    </span>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      slide.is_active
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {slide.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{slide.is_active ? 'Hide from Homepage' : 'Show on Homepage'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(slide)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-950 rounded-xl text-xs font-bold transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Slide</span>
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black text-navy-950">
                {editingSlide ? `Edit Slide #${editingSlide.display_order}` : 'Add New Hero Slide'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-navy-950">Slide Main Headline / Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. Every Step Begins with KOSKOOL."
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-navy-950">Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
                    placeholder="Brief description under the headline"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-navy-950">Top Badge Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. KOSKOOL OFFICIAL 2026"
                  />
                </div>

                {/* Desktop Banner Image Section */}
                <div className="sm:col-span-2 space-y-3 p-4 bg-gray-50/90 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-navy-950 uppercase tracking-wide flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-brand-600" />
                        <span>Desktop Hero Banner (Primary)</span>
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Main high-resolution banner for desktops and laptops. Recommended: 1920x800 or 16:9 ratio.
                      </p>
                    </div>
                    {uploadingDesktop && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-brand-600 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading Image...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                    {/* Live Preview */}
                    <div className="relative aspect-[16/8] md:col-span-1 rounded-xl overflow-hidden bg-navy-950 border border-gray-300 flex items-center justify-center">
                      {formData.desktopImage ? (
                        <>
                          <img
                            src={formData.desktopImage}
                            alt="Desktop Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[9px] text-white font-bold">
                            Desktop Preview
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 text-gray-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px] font-bold">No Image Selected</span>
                        </div>
                      )}
                    </div>

                    {/* Drag & Drop / Upload Picker */}
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
                        if (file) handleDesktopUpload(file);
                      }}
                      className={`md:col-span-2 border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center transition cursor-pointer ${
                        dragOverDesktop
                          ? 'border-brand-500 bg-brand-50/70'
                          : 'border-gray-300 hover:border-brand-500 bg-white'
                      }`}
                    >
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-2">
                        <Upload className="w-6 h-6 text-brand-600 mb-1" />
                        <span className="text-xs font-bold text-navy-950">
                          Click to Upload Desktop Banner or Drag Image Here
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          PNG, JPG, WEBP, SVG • Saved automatically
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDesktopUpload(file);
                          }}
                          className="hidden"
                          disabled={uploadingDesktop}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preset Dropdown & URL Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Or Pick from Preset Banners
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData((prev) => ({
                              ...prev,
                              desktopImage: e.target.value,
                              mobileImage:
                                !prev.mobileImage || prev.mobileImage.includes('School-Mobile-Banner')
                                  ? e.target.value
                                  : prev.mobileImage,
                            }));
                          }
                        }}
                        className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3 py-2 bg-white focus:border-brand-600 focus:outline-none"
                      >
                        <option value="">Select preset or type URL below...</option>
                        {PRESET_BANNER_IMAGES.map((img, i) => (
                          <option key={i} value={img.url}>
                            {img.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Desktop Image URL
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.desktopImage || ''}
                        onChange={(e) => setFormData({ ...formData, desktopImage: e.target.value })}
                        className="w-full text-xs font-mono border border-gray-300 rounded-xl px-3 py-2 bg-white focus:border-brand-600 focus:outline-none"
                        placeholder="Image URL or uploaded path"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Banner Image Section */}
                <div className="sm:col-span-2 space-y-3 p-4 bg-gray-50/90 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-navy-950 uppercase tracking-wide flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-brand-600" />
                        <span>Mobile Hero Banner (Optional)</span>
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Shown on smartphone portrait screens (under 768px). Defaults to Desktop banner if left empty.
                      </p>
                    </div>
                    {uploadingMobile && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-brand-600 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading Mobile Image...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                    {/* Live Preview */}
                    <div className="relative aspect-[4/3] md:col-span-1 rounded-xl overflow-hidden bg-navy-950 border border-gray-300 flex items-center justify-center">
                      {formData.mobileImage || formData.desktopImage ? (
                        <>
                          <img
                            src={formData.mobileImage || formData.desktopImage}
                            alt="Mobile Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[9px] text-white font-bold">
                            {formData.mobileImage ? 'Custom Mobile Banner' : 'Mirrors Desktop'}
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 text-gray-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px] font-bold">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Drag & Drop / Upload Picker */}
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
                        if (file) handleMobileUpload(file);
                      }}
                      className={`md:col-span-2 border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center transition cursor-pointer ${
                        dragOverMobile
                          ? 'border-brand-500 bg-brand-50/70'
                          : 'border-gray-300 hover:border-brand-500 bg-white'
                      }`}
                    >
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-2">
                        <Upload className="w-6 h-6 text-brand-600 mb-1" />
                        <span className="text-xs font-bold text-navy-950">
                          Upload Mobile-Optimized Banner (Portrait)
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          Recommended 1000x1250 portrait • Or drag file here
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMobileUpload(file);
                          }}
                          className="hidden"
                          disabled={uploadingMobile}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Mobile Image URL (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.mobileImage || ''}
                        onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                        className="flex-1 text-xs font-mono border border-gray-300 rounded-xl px-3 py-2 bg-white focus:border-brand-600 focus:outline-none"
                        placeholder="Leave blank to use desktop image"
                      />
                      {formData.mobileImage && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, mobileImage: '' }))}
                          className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-red-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition shrink-0"
                        >
                          Use Desktop
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Button */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-950">Primary Button Text</label>
                  <input
                    type="text"
                    required
                    value={formData.primaryCtaText}
                    onChange={(e) => setFormData({ ...formData, primaryCtaText: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. Shop Boys"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-950">Primary Button Link</label>
                  <input
                    type="text"
                    required
                    value={formData.primaryCtaLink}
                    onChange={(e) => setFormData({ ...formData, primaryCtaLink: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. /collections/boys"
                  />
                </div>

                {/* Secondary Button */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-950">Secondary Button Text (Optional)</label>
                  <input
                    type="text"
                    value={formData.secondaryCtaText}
                    onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. Shop Girls"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-950">Secondary Button Link (Optional)</label>
                  <input
                    type="text"
                    value={formData.secondaryCtaLink}
                    onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. /collections/girls"
                  />
                </div>

                {/* Tertiary Button */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-950">Tertiary Button Text (Optional)</label>
                  <input
                    type="text"
                    value={formData.tertiaryCtaText}
                    onChange={(e) => setFormData({ ...formData, tertiaryCtaText: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. Explore Accessories"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-navy-950">Tertiary Button Link (Optional)</label>
                  <input
                    type="text"
                    value={formData.tertiaryCtaLink}
                    onChange={(e) => setFormData({ ...formData, tertiaryCtaLink: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-300 rounded-xl px-3.5 py-2.5 focus:border-brand-600 focus:outline-none"
                    placeholder="e.g. /collections/accessories"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy-950">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span>Active &amp; Visible on Homepage</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow"
                  >
                    {editingSlide ? 'Save & Apply to Homepage' : 'Create Slide'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
