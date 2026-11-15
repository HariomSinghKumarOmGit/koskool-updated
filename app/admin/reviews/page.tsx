'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ProductReview,
  getAllReviews,
  deleteReview,
} from '@/services/api';
import {
  Star,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Camera,
  ThumbsUp,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'all' | 'with-photos'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadAllReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      setDeletingId(id);
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return { total: 0, avg: 0, withPhotos: 0, fiveStars: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / total).toFixed(1);
    const withPhotos = reviews.filter((r) => r.images && r.images.length > 0).length;
    const fiveStars = reviews.filter((r) => Math.round(r.rating) === 5).length;
    return { total, avg, withPhotos, fiveStars };
  }, [reviews]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.user_name?.toLowerCase().includes(q) ||
          r.user_email?.toLowerCase().includes(q) ||
          r.product_id?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q)
      );
    }

    if (starFilter === 'with-photos') {
      list = list.filter((r) => r.images && r.images.length > 0);
    } else if (typeof starFilter === 'number') {
      list = list.filter((r) => Math.round(r.rating) === starFilter);
    }

    return list;
  }, [reviews, searchQuery, starFilter]);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Customer Ratings & Reviews</span>
          </h1>
          <p className="text-xs text-gray-500 pt-0.5">
            Monitor, moderate, and inspect customer reviews, attached photos, and buyer ratings.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAllReviews}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Total Reviews
          </div>
          <div className="text-2xl font-black text-gray-950 mt-1">{stats.total}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Across all store products</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Average Rating
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1 flex items-center gap-1">
            <span>{stats.avg}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Storewide satisfaction</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            5-Star Reviews
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.fiveStars}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {stats.total > 0 ? Math.round((stats.fiveStars / stats.total) * 100) : 0}% of all feedback
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            With Customer Photos
          </div>
          <div className="text-2xl font-black text-brand-600 mt-1 flex items-center gap-1">
            <span>{stats.withPhotos}</span>
            <Camera className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Visual social proof</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, email, product, or keywords..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-gray-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => setStarFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                starFilter === 'all'
                  ? 'bg-gray-950 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({reviews.length})
            </button>

            <button
              type="button"
              onClick={() => setStarFilter('with-photos')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                starFilter === 'with-photos'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Photos ({stats.withPhotos})</span>
            </button>

            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStarFilter(s)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                  starFilter === s
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{s}</span>
                <Star className="w-3 h-3 fill-current" />
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Reviews Table / Cards */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-bold">Loading customer reviews...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center space-y-2">
          <MessageSquare className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-sm font-bold text-gray-800">No reviews found</h3>
          <p className="text-xs text-gray-500">
            {searchQuery || starFilter !== 'all'
              ? 'Try modifying your search or clearing your rating filter.'
              : 'Reviews submitted by normal customers will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const formattedDate = new Date(rev.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={rev.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-gray-300 transition"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 border border-brand-200">
                      {(rev.user_name || 'C')[0].toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{rev.user_name}</span>
                        {rev.verified_purchase && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                        {rev.user_email && (
                          <span className="text-xs text-gray-400 font-normal">
                            ({rev.user_email})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">{formattedDate}</span>
                    </div>
                  </div>

                  {/* Actions & Product Link */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products/${rev.product_id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-[11px] font-bold text-gray-700 transition"
                    >
                      <span>Product: {rev.product_id}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      disabled={deletingId === rev.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rating & Review details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
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
                    {rev.title && (
                      <span className="text-xs font-bold text-gray-900">
                        {rev.title}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {rev.comment}
                  </p>
                </div>

                {/* Customer Attached Photos */}
                {rev.images && rev.images.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-brand-600" />
                      <span>Attached Photos ({rev.images.length})</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {rev.images.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPreviewImage(imgUrl)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:scale-105 transition shrink-0"
                        >
                          <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer bar */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-50">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{rev.helpful_count || 0} found this helpful</span>
                  </span>
                  <span>ID: {rev.id}</span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1 hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={previewImage} alt="Full preview" className="max-h-[80vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}

    </div>
  );
}
