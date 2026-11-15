'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '@/data/products';
import {
  ProductReview,
  getProductReviews,
  createProductReview,
  voteReviewHelpful,
  deleteReview,
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { uploadReviewImage } from '@/lib/reviewUpload';
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  Image as ImageIcon,
  Check,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Loader2,
  CheckCircle2,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Trash2,
  PenSquare,
  User,
  ShieldAlert,
} from 'lucide-react';

interface ProductReviewsSectionProps {
  product: Product;
  onReviewStatsChange?: (stats: { rating: number; reviewCount: number }) => void;
}

export default function ProductReviewsSection({
  product,
  onReviewStatsChange,
}: ProductReviewsSectionProps) {
  const { user, isAdmin, openAuthModal } = useAuth();

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Collapsed state: by default all comments collapsed, just showing stars, write comment & drop arrow
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Review Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Admin action state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form Fields
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [nameInput, setNameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [titleInput, setTitleInput] = useState<string>('');
  const [commentInput, setCommentInput] = useState<string>('');
  const [recommendInput, setRecommendInput] = useState<boolean>(true);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Filter & Sort State
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all' | 'with-photos'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');

  // Lightbox Modal for Photo viewing
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Voted reviews tracking in state
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  // Pre-fill user name and email when logged in
  useEffect(() => {
    if (user?.name && !nameInput) {
      setNameInput(user.name);
    }
    if (user?.email && !emailInput) {
      setEmailInput(user.email);
    }
  }, [user]);

  // Listen for expand event from top review counter
  useEffect(() => {
    const handleExpand = () => setIsExpanded(true);
    window.addEventListener('koskool_expand_reviews', handleExpand);
    return () => window.removeEventListener('koskool_expand_reviews', handleExpand);
  }, []);

  // Load reviews on mount or when product id/slug changes
  const loadReviews = async () => {
    try {
      setLoading(true);
      const list = await getProductReviews(product.id, product.slug, product.name);
      setReviews(list);

      // Report stats back to parent if needed
      if (list.length > 0) {
        const total = list.reduce((sum, r) => sum + r.rating, 0);
        const avg = Number((total / list.length).toFixed(1));
        onReviewStatsChange?.({ rating: avg, reviewCount: list.length });
      } else {
        onReviewStatsChange?.({ rating: 5, reviewCount: 0 });
      }
    } catch (err) {
      console.error('Error loading product reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [product.id, product.slug]);

  // Check voted helpful keys from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const map: Record<string, boolean> = {};
      reviews.forEach((r) => {
        if (localStorage.getItem(`koskool_voted_rev_${r.id}`)) {
          map[r.id] = true;
        }
      });
      setVotedMap(map);
    }
  }, [reviews]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = reviews.length;
    if (totalCount === 0) {
      return {
        averageRating: product.rating || 5,
        totalReviews: 0,
        starsBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        starsPercent: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendPercent: 100,
        photosCount: 0,
      };
    }

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;
    let recommendCount = 0;
    let photosCount = 0;

    reviews.forEach((r) => {
      ratingSum += r.rating;
      const rounded = Math.max(1, Math.min(5, Math.round(r.rating)));
      breakdown[rounded] = (breakdown[rounded] || 0) + 1;
      if (r.recommend !== false) recommendCount += 1;
      if (r.images && r.images.length > 0) photosCount += r.images.length;
    });

    const averageRating = Number((ratingSum / totalCount).toFixed(1));
    const starsPercent: Record<number, number> = {
      5: Math.round(((breakdown[5] || 0) / totalCount) * 100),
      4: Math.round(((breakdown[4] || 0) / totalCount) * 100),
      3: Math.round(((breakdown[3] || 0) / totalCount) * 100),
      2: Math.round(((breakdown[2] || 0) / totalCount) * 100),
      1: Math.round(((breakdown[1] || 0) / totalCount) * 100),
    };

    const recommendPercent = Math.round((recommendCount / totalCount) * 100);

    return {
      averageRating,
      totalReviews: totalCount,
      starsBreakdown: breakdown,
      starsPercent,
      recommendPercent,
      photosCount,
    };
  }, [reviews, product.rating]);

  // Extract all customer photos for the gallery
  const allCustomerPhotos = useMemo(() => {
    const list: { url: string; review: ProductReview }[] = [];
    reviews.forEach((r) => {
      if (r.images && r.images.length > 0) {
        r.images.forEach((url) => {
          if (url) list.push({ url, review: r });
        });
      }
    });
    return list;
  }, [reviews]);

  // Filtered and Sorted Reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    // Filter
    if (selectedStarFilter === 'with-photos') {
      list = list.filter((r) => r.images && r.images.length > 0);
    } else if (typeof selectedStarFilter === 'number') {
      list = list.filter((r) => Math.round(r.rating) === selectedStarFilter);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      if (sortBy === 'helpful') return (b.helpful_count || 0) - (a.helpful_count || 0);
      // 'recent'
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [reviews, selectedStarFilter, sortBy]);

  // Handle Image Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const combinedFiles = [...attachedFiles, ...newFiles].slice(0, 5); // max 5 photos

    setAttachedFiles(combinedFiles);

    // Generate previews
    const newPreviews = combinedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const removeAttachedFile = (index: number) => {
    const nextFiles = attachedFiles.filter((_, i) => i !== index);
    const nextPreviews = previewUrls.filter((_, i) => i !== index);
    setAttachedFiles(nextFiles);
    setPreviewUrls(nextPreviews);
  };

  // Open Write Review: Prompt login if customer is not logged in
  const handleOpenWriteReview = () => {
    if (!user) {
      openAuthModal(() => {
        setIsModalOpen(true);
        setIsExpanded(true);
        setSubmitSuccess(false);
        setFormError(null);
      });
      return;
    }
    setIsModalOpen(true);
    setSubmitSuccess(false);
    setFormError(null);
  };

  // Handle Form Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      setFormError('Please login to post your comment.');
      return;
    }

    const name = (nameInput.trim() || user.name || 'Customer').trim();
    const comment = commentInput.trim();
    const title = titleInput.trim();

    if (!ratingInput) {
      setFormError('Please select a star rating (1 to 5 stars).');
      return;
    }
    if (!comment) {
      setFormError('Please write your review feedback comment.');
      return;
    }

    try {
      setSubmitting(true);

      // Upload attached images if any
      let uploadedImageUrls: string[] = [];
      if (attachedFiles.length > 0) {
        setUploadingImages(true);
        const uploadPromises = attachedFiles.map((file) => uploadReviewImage(file));
        uploadedImageUrls = await Promise.all(uploadPromises);
        setUploadingImages(false);
      }

      const res = await createProductReview({
        product_id: product.id,
        product_slug: product.slug,
        product_name: product.name,
        user_name: name,
        user_email: emailInput.trim() || user.email,
        rating: ratingInput,
        title: title || (ratingInput >= 4 ? 'Great purchase!' : 'Product feedback'),
        comment,
        images: uploadedImageUrls,
        recommend: recommendInput,
        verified_purchase: true,
      });

      if (res.success && res.data) {
        setSubmitSuccess(true);
        // Refresh reviews list
        await loadReviews();
        // Auto-expand comments so customer sees their live comment immediately
        setIsExpanded(true);

        // Reset form after short delay
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
          setCommentInput('');
          setTitleInput('');
          setAttachedFiles([]);
          setPreviewUrls([]);
        }, 1500);
      } else {
        setFormError(res.error || 'Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Helpful Vote
  const handleVoteHelpful = async (reviewId: string) => {
    if (votedMap[reviewId]) return;

    try {
      const res = await voteReviewHelpful(reviewId, product.id);
      if (res.success) {
        setVotedMap((prev) => ({ ...prev, [reviewId]: true }));
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, helpful_count: res.count } : r))
        );
      }
    } catch (err) {
      console.error('Vote helpful error:', err);
    }
  };

  // Admin Delete Review from Product Section
  const handleDeleteReview = async (reviewId: string) => {
    if (!isAdmin) {
      alert('You do not have permission to delete reviews.');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this customer comment from this product?')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      await deleteReview(reviewId);

      setReviews((prev) => {
        const next = prev.filter((r) => r.id !== reviewId);
        if (next.length > 0) {
          const total = next.reduce((sum, r) => sum + r.rating, 0);
          const avg = Number((total / next.length).toFixed(1));
          onReviewStatsChange?.({ rating: avg, reviewCount: next.length });
        } else {
          onReviewStatsChange?.({ rating: 5, reviewCount: 0 });
        }
        return next;
      });
    } catch (err) {
      alert('Failed to delete comment. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return '5.0 - Excellent! Exceeded expectations';
      case 4:
        return '4.0 - Very Good, satisfied';
      case 3:
        return '3.0 - Average, met basic expectations';
      case 2:
        return '2.0 - Poor, could be much better';
      case 1:
        return '1.0 - Terrible, not recommended';
      default:
        return 'Select a star rating';
    }
  };

  return (
    <section id="product-reviews" className="pt-8 sm:pt-12 pb-6">
      
      {/* ================= COLLAPSED ACCORDION CARD ================= */}
      {/* By default all comments collapsed, just showing stars, write comment & drop arrow */}
      <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-3xl shadow-sm transition overflow-hidden">
        
        {/* Main Bar: Stars + Count + Write Comment + Drop Arrow */}
        <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left / Clickable Trigger: Stars, Average Score, Total Comments count, and Drop Arrow */}
          <div
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-3 sm:gap-5 cursor-pointer select-none group flex-1"
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            aria-label="Toggle customer comments and ratings"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsExpanded((prev) => !prev);
              }
            }}
          >
            {/* Stars Display */}
            <div className="flex items-center gap-1 shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${
                    star <= Math.round(metrics.averageRating)
                      ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Score & Comments count */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                {metrics.averageRating}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-600 group-hover:text-gray-900 transition">
                ({metrics.totalReviews} Customer {metrics.totalReviews === 1 ? 'Comment' : 'Comments'})
              </span>
              {metrics.totalReviews > 0 && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{metrics.recommendPercent}% recommend</span>
                </span>
              )}
            </div>

            {/* Dropdown Arrow Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 group-hover:bg-amber-100/70 text-gray-700 group-hover:text-amber-900 text-xs font-bold transition ml-auto sm:ml-2 shrink-0">
              <span className="hidden sm:inline">
                {isExpanded ? 'Hide Comments' : 'See Comments'}
              </span>
              <span className="sm:hidden">
                {isExpanded ? 'Hide' : 'See'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 text-gray-600 group-hover:text-amber-800 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          {/* Right Action: Write a Comment Button */}
          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 justify-end">
            <button
              type="button"
              onClick={handleOpenWriteReview}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-2xl shadow-sm hover:shadow transition cursor-pointer"
            >
              <PenSquare className="w-4 h-4" />
              <span>Write a Comment</span>
            </button>
          </div>

        </div>

        {/* ================= EXPANDED CONTENT ================= */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-5 sm:p-8 space-y-8 bg-gray-50/40 animate-in fade-in duration-300">
            
            {/* Header info badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Real Customer Feedback</span>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                Verified buyer comments, ratings and real product pictures
              </span>
            </div>

            {/* ================= RATINGS BREAKDOWN OVERVIEW CARD ================= */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Col 1: Big Average Rating Score */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center sm:border-r sm:border-gray-200 pr-0 sm:pr-6">
                  <div className="text-5xl sm:text-6xl font-black text-gray-950 tracking-tighter">
                    {metrics.averageRating}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(metrics.averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Based on {metrics.totalReviews} Verified Review{metrics.totalReviews !== 1 ? 's' : ''}
                  </div>

                  {metrics.totalReviews > 0 && (
                    <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{metrics.recommendPercent}% of customers recommend</span>
                    </div>
                  )}
                </div>

                {/* Col 2: Star Percentages Bars */}
                <div className="md:col-span-5 space-y-2.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = metrics.starsBreakdown[stars] || 0;
                    const percent = metrics.starsPercent[stars] || 0;
                    const isSelected = selectedStarFilter === stars;

                    return (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => {
                          setSelectedStarFilter(isSelected ? 'all' : stars);
                        }}
                        className={`w-full group flex items-center gap-3 text-xs text-left p-1 rounded-lg transition hover:bg-gray-100 ${
                          isSelected ? 'bg-amber-50 ring-1 ring-amber-300' : ''
                        }`}
                      >
                        <span className="w-12 font-bold text-gray-700 flex items-center gap-1 shrink-0">
                          <span>{stars}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </span>

                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 group-hover:bg-amber-500 transition-all rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <span className="w-10 text-right font-medium text-gray-500 shrink-0">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Col 3: Quick Action & Highlights */}
                <div className="md:col-span-3 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-3 pl-0 md:pl-4">
                  <div className="text-xs text-gray-600">
                    Have you worn this footwear? Share your sizing fit, grip, and comfort thoughts!
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenWriteReview}
                    className="w-full bg-navy-950 hover:bg-navy-900 active:scale-95 text-white font-bold text-xs py-3 px-4 rounded-xl shadow transition text-center cursor-pointer"
                  >
                    Write a Comment
                  </button>
                </div>

              </div>
            </div>

            {/* ================= CUSTOMER PHOTOS GALLERY ================= */}
            {allCustomerPhotos.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider">
                      Customer Photos ({allCustomerPhotos.length})
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    Click any photo to enlarge & read comment
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 sm:gap-3 pb-2">
                  {allCustomerPhotos.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-gray-200 shadow-sm hover:ring-2 hover:ring-brand-500 hover:scale-[1.03] transition group"
                    >
                      <img
                        src={item.url}
                        alt={`Customer photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-[11px] font-bold bg-black/50 px-1.5 py-0.5 rounded">
                          Zoom
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================= FILTERS & SORTING TOOLBAR ================= */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-2 border-b border-gray-200">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-gray-500 font-semibold mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedStarFilter('all')}
                  className={`px-3 py-1.5 rounded-full font-bold transition ${
                    selectedStarFilter === 'all'
                      ? 'bg-gray-950 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All ({reviews.length})
                </button>

                {allCustomerPhotos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedStarFilter('with-photos')}
                    className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 ${
                      selectedStarFilter === 'with-photos'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    <span>With Photos ({reviews.filter((r) => r.images?.length > 0).length})</span>
                  </button>
                )}

                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = metrics.starsBreakdown[stars] || 0;
                  if (count === 0 && selectedStarFilter !== stars) return null;
                  const isSelected = selectedStarFilter === stars;

                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setSelectedStarFilter(isSelected ? 'all' : stars)}
                      className={`px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{stars}</span>
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[11px] opacity-80">({count})</span>
                    </button>
                  );
                })}

                {selectedStarFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedStarFilter('all')}
                    className="text-xs text-brand-600 hover:text-brand-700 underline font-semibold ml-1 cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 font-bold text-gray-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>

            {/* ================= REVIEWS / COMMENTS LIST ================= */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
                <span className="text-xs font-semibold">Loading verified comments...</span>
              </div>
            ) : displayedReviews.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-300 p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900">
                  {selectedStarFilter !== 'all' ? 'No comments match this filter' : 'No comments yet'}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {selectedStarFilter !== 'all'
                    ? 'Try clearing your filter to view all customer comments.'
                    : 'Be the first person to share your experience and add photos of this product!'}
                </p>
                {selectedStarFilter !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => setSelectedStarFilter('all')}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Show All Comments
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenWriteReview}
                    className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 px-5 rounded-full shadow cursor-pointer"
                  >
                    Write the First Comment
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {displayedReviews.map((rev) => {
                  const initials = (rev.user_name || 'Customer')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const formattedDate = new Date(rev.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  const isVoted = votedMap[rev.id];
                  const isDeleting = deletingId === rev.id;

                  return (
                    <div
                      key={rev.id}
                      className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-gray-300 transition"
                    >
                      {/* Top Bar: Reviewer profile, stars, date, & Admin Delete Action */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar Circle */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
                            {initials}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-gray-950 text-sm">{rev.user_name}</span>
                              {rev.verified_purchase && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Verified Buyer</span>
                                </span>
                              )}
                            </div>

                            {/* Stars & Date */}
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <= rev.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-gray-200 text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-gray-400">•</span>
                              <span className="text-[11px] text-gray-500">{formattedDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Recommends pill + Admin Delete Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {rev.recommend && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Recommends</span>
                            </span>
                          )}

                          {/* ADMIN DELETE BUTTON FROM PRODUCT SECTION */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              disabled={isDeleting}
                              title="Delete this comment permanently"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="space-y-1.5 text-left">
                        {rev.title && (
                          <h4 className="font-bold text-gray-950 text-sm sm:text-base leading-snug">
                            {rev.title}
                          </h4>
                        )}
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                          {rev.comment}
                        </p>
                      </div>

                      {/* Customer Attached Photos */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="pt-2">
                          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Camera className="w-3 h-3 text-brand-600" />
                            <span>Attached Photos ({rev.images.length})</span>
                          </div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            {rev.images.map((imgUrl, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => {
                                  const foundIdx = allCustomerPhotos.findIndex(
                                    (p) => p.url === imgUrl && p.review.id === rev.id
                                  );
                                  if (foundIdx >= 0) {
                                    setLightboxIndex(foundIdx);
                                  } else {
                                    setLightboxIndex(0);
                                  }
                                }}
                                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:scale-105 hover:ring-2 hover:ring-brand-500 transition group shrink-0"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Review attachment ${imgIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-white bg-black/60 px-1 py-0.5 rounded">
                                    Enlarge
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Bar: Helpful button */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <button
                          type="button"
                          onClick={() => handleVoteHelpful(rev.id)}
                          disabled={isVoted}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                            isVoted
                              ? 'bg-emerald-50 text-emerald-700 cursor-default'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 cursor-pointer'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                          <span>{isVoted ? 'Helpful' : 'Helpful?'}</span>
                          {rev.helpful_count > 0 && (
                            <span className="text-[11px] font-bold opacity-80">
                              ({rev.helpful_count})
                            </span>
                          )}
                        </button>

                        <span className="text-[11px] text-gray-400">
                          Product: {product.brand || 'Walkaroo'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Collapse Button */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  const el = document.getElementById('product-reviews');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer"
              >
                <ChevronUp className="w-4 h-4 text-gray-500" />
                <span>Collapse Comments</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ================= WRITE A COMMENT / REVIEW MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!submitting) setIsModalOpen(false);
            }}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-navy-950 flex items-center gap-2">
                  <PenSquare className="w-5 h-5 text-brand-600" />
                  <span>Write a Customer Comment</span>
                </h3>
                <p className="text-xs text-gray-500 pt-0.5">
                  Share your real product experience, sizing, and comfort feedback.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Logged in User Bar */}
            {user ? (
              <div className="flex items-center justify-between gap-3 bg-brand-50/60 border border-brand-200/80 rounded-2xl p-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                    {(user.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                      <span>{user.name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                        Logged in
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="text-[11px] text-brand-700 font-semibold">
                  Verified Buyer
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center justify-between gap-2">
                <span>Please log in to submit your comment.</span>
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  className="bg-amber-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-amber-700"
                >
                  Log In
                </button>
              </div>
            )}

            {/* Product Summary Preview */}
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-white">
                <img
                  src={product.images[0] || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                <p className="text-[11px] text-gray-500">₹{product.price} • {product.brand || 'Walkaroo'}</p>
              </div>
            </div>

            {submitSuccess ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-black text-gray-900">Thank You For Your Comment!</h4>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  Your comment and photos have been posted successfully and are now live on this product.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-5">
                
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Star Rating Selection */}
                <div className="space-y-1.5 text-center sm:text-left">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-125 transition active:scale-95 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition ${
                            star <= (hoverRating || ratingInput)
                              ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                              : 'fill-gray-200 text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-amber-700">
                    {getRatingLabel(hoverRating || ratingInput)}
                  </p>
                </div>

                {/* 2. Reviewer Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                      Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
                    />
                    <p className="text-[10px] text-gray-400">Kept private, never displayed publicly.</p>
                  </div>
                </div>

                {/* 3. Review Headline / Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                    Headline / Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="e.g. Super comfortable sandals for daily use!"
                    className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
                  />
                </div>

                {/* 4. Detailed Comment Feedback */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
                    Your Comment Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Describe the fit, sole grip, comfort level, material durability, or everyday feel..."
                    className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
                  />
                </div>

                {/* 5. Attach Images / Photos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-brand-600" />
                      <span>Attach Real Product Photos (Optional)</span>
                    </label>
                    <span className="text-[11px] text-gray-400">Up to 5 pictures</span>
                  </div>

                  {/* Previews */}
                  {previewUrls.length > 0 && (
                    <div className="flex items-center gap-3 flex-wrap pb-2">
                      {previewUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-300 shadow-sm group"
                        >
                          <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeAttachedFile(idx)}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 transition"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Drop Zone / Button */}
                  {attachedFiles.length < 5 && (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 hover:border-brand-500 bg-gray-50 hover:bg-brand-50/20 rounded-2xl cursor-pointer transition">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <UploadCloud className="w-6 h-6 text-gray-400" />
                        <span className="text-xs font-bold text-gray-700">
                          Click to upload customer photos
                        </span>
                        <span className="text-[10px] text-gray-400">
                          JPG, PNG, WebP accepted
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* 6. Recommendation Radio */}
                <div className="pt-1">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block mb-2">
                    Would you recommend this item?
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRecommendInput(true)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        recommendInput
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Yes, I recommend it</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecommendInput(false)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        !recommendInput
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>No, not recommended</span>
                    </button>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !user}
                    className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{uploadingImages ? 'Uploading Photos...' : 'Posting Comment...'}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Submit Comment</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ================= PHOTO LIGHTBOX MODAL ================= */}
      {lightboxIndex !== null && allCustomerPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev / Next controls */}
          {allCustomerPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev - 1 + allCustomerPhotos.length) % allCustomerPhotos.length : 0
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev !== null ? (prev + 1) % allCustomerPhotos.length : 0
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Content Container */}
          <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh]">
            
            {/* Left: Photo view */}
            <div className="md:w-3/5 bg-black flex items-center justify-center p-4 min-h-[300px]">
              <img
                src={allCustomerPhotos[lightboxIndex].url}
                alt="Enlarged review photo"
                className="max-h-[60vh] md:max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Right: Review Details */}
            <div className="md:w-2/5 p-6 overflow-y-auto space-y-4 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Photo {lightboxIndex + 1} of {allCustomerPhotos.length}
                </span>
                <span className="text-[11px] text-gray-500">
                  {new Date(allCustomerPhotos[lightboxIndex].review.created_at).toLocaleDateString(
                    'en-IN',
                    { day: 'numeric', month: 'short', year: 'numeric' }
                  )}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-950 text-sm">
                    {allCustomerPhotos[lightboxIndex].review.user_name}
                  </span>
                  {allCustomerPhotos[lightboxIndex].review.verified_purchase && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= allCustomerPhotos[lightboxIndex].review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {allCustomerPhotos[lightboxIndex].review.title && (
                <h5 className="font-bold text-sm text-gray-950">
                  {allCustomerPhotos[lightboxIndex].review.title}
                </h5>
              )}

              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {allCustomerPhotos[lightboxIndex].review.comment}
              </p>

              {allCustomerPhotos[lightboxIndex].review.recommend && (
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Recommends this product</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
