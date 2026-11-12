'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  ArrowLeft,
  Search,
  Package,
  X,
  Upload,
  Check,
  Save,
  AlertTriangle,
} from 'lucide-react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getProducts,
  Category,
} from '@/services/api';
import { Product } from '@/data/products';
import { uploadToStorage } from '@/lib/supabase';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Category Drilldown
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categoryProductSearch, setCategoryProductSearch] = useState('');
  const [categoryProductLoading, setCategoryProductLoading] = useState(false);

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
  });

  // Reorder State
  const [reorderedItems, setReorderedItems] = useState<Category[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  const fetchCategoriesList = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      setReorderedItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  // Drilldown to category products
  const handleSelectCategory = async (cat: Category) => {
    setSelectedCategory(cat);
    setCategoryProductLoading(true);
    try {
      const res = await getProducts({ category: cat.slug, limit: 100 });
      setCategoryProducts(res.products);
    } catch (err) {
      console.error(err);
    } finally {
      setCategoryProductLoading(false);
    }
  };

  const handleReturnToCategories = () => {
    setSelectedCategory(null);
    setCategoryProducts([]);
    setCategoryProductSearch('');
  };

  // Open Add Category
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
    });
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // Open Edit Category
  const handleOpenEdit = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
    } else {
      await createCategory(formData);
    }
    setIsModalOpen(false);
    fetchCategoriesList();
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (deleteCandidate) {
      await deleteCategory(deleteCandidate.id);
      setDeleteCandidate(null);
      fetchCategoriesList();
    }
  };

  // Move Category Reorder
  const handleMoveCategory = (idx: number, direction: 'up' | 'down') => {
    const list = [...reorderedItems];
    const target = list[idx];
    if (direction === 'up' && idx > 0) {
      list[idx] = list[idx - 1];
      list[idx - 1] = target;
    } else if (direction === 'down' && idx < list.length - 1) {
      list[idx] = list[idx + 1];
      list[idx + 1] = target;
    }
    setReorderedItems(list);
  };

  const handleSaveOrder = async () => {
    const payload = reorderedItems.map((c, idx) => ({ id: c.id, display_order: idx + 1 }));
    await reorderCategories(payload);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
    fetchCategoriesList();
  };

  // Upload category image to Supabase
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadToStorage(file, 'product-images', 'categories');
    if (res.url) {
      setFormData((prev) => ({ ...prev, image_url: res.url! }));
    }
  };

  // Filtered Products for drilldown
  const filteredCategoryProducts = categoryProducts.filter((p) =>
    p.name.toLowerCase().includes(categoryProductSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Category Products Drilldown View */}
      {selectedCategory ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Header with Return Button */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleReturnToCategories}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-navy-950 text-xs font-bold transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to All Categories</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-navy-950">{selectedCategory.name}</h1>
                  <span className="text-[10px] bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded-full border border-brand-200">
                    Category Filtered
                  </span>
                </div>
                <p className="text-xs text-gray-500">{selectedCategory.description}</p>
              </div>
            </div>

            {/* Search within Category */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={categoryProductSearch}
                onChange={(e) => setCategoryProductSearch(e.target.value)}
                placeholder={`Search in ${selectedCategory.name}...`}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryProductLoading ? (
              <div className="col-span-full py-16 text-center text-gray-400">
                <div className="w-8 h-8 border-3 border-navy-950 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs font-bold">Loading category items...</span>
              </div>
            ) : filteredCategoryProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold">No products found in this category.</p>
              </div>
            ) : (
              filteredCategoryProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3 hover:shadow-md transition"
                >
                  <div className="aspect-square relative rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                    <Image
                      src={p.images[0] || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                      alt={p.name}
                      fill
                      loading="lazy"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-navy-950 line-clamp-1">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-navy-950">₹{p.price}</span>
                      <span className="text-[10px] text-gray-500 capitalize">{p.gender}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Categories List View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-navy-950">Category Management</h1>
              <p className="text-xs text-gray-500">
                Manage uniform categories, drag-and-drop hierarchy, and inspect associated products.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsReordering(!isReordering)}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
                  isReordering
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>{isReordering ? 'Exit Reorder' : 'Reorder Categories'}</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {isReordering && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
              <span className="text-xs font-bold text-amber-900">
                Use arrows to adjust category sequence and click Save to write to Supabase.
              </span>
              <button
                onClick={handleSaveOrder}
                className="inline-flex items-center gap-1.5 bg-navy-950 hover:bg-navy-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Sequence</span>
              </button>
            </div>
          )}

          {savedNotification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Category order updated in Supabase!</span>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(isReordering ? reorderedItems : categories).map((cat, idx) => (
              <div
                key={cat.id}
                onClick={() => !isReordering && handleSelectCategory(cat)}
                className={`bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4 transition ${
                  isReordering
                    ? 'cursor-default ring-1 ring-amber-300'
                    : 'hover:shadow-md cursor-pointer hover:border-brand-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 relative overflow-hidden border border-gray-100 shrink-0">
                    <Image
                      src={cat.image_url || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                      alt={cat.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 font-mono">
                      Order: #{cat.display_order}
                    </span>
                    <h3 className="text-sm font-black text-navy-950 truncate">{cat.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-brand-600">
                    Click to view products →
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {isReordering ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveCategory(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveCategory(idx, 'down')}
                          disabled={idx === reorderedItems.length - 1}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleOpenEdit(cat, e)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-navy-950 hover:bg-gray-100 transition"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCandidate(cat);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-black text-navy-950">
                {editingCategory ? 'Edit Category' : 'Add New Category to Supabase'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Senior Wing Formal Uniform"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none"
                />
              </div>

              {/* Category Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 relative overflow-hidden border border-gray-200 shrink-0">
                    <Image src={formData.image_url} alt="Category preview" fill className="object-contain p-1" />
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-navy-950 px-3 py-2 rounded-xl text-xs font-bold transition">
                    <Upload className="w-3.5 h-3.5 text-brand-600" />
                    <span>Upload to Supabase</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow"
                >
                  Save Category
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
            <h3 className="text-base font-black text-navy-950">Delete Category</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to remove category <strong className="text-gray-900">{deleteCandidate.name}</strong>?
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
