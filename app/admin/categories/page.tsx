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
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getProducts,
  getAllCatalogProducts,
  updateProduct,
  Category,
} from '@/services/api';
import { Product } from '@/data/products';
import { uploadToStorage } from '@/lib/supabase';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Selected Category Drilldown
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categoryProductSearch, setCategoryProductSearch] = useState('');
  const [categoryProductLoading, setCategoryProductLoading] = useState(false);

  // Assign Products Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignSelectedIds, setAssignSelectedIds] = useState<Set<string>>(new Set());
  const [assignSearch, setAssignSearch] = useState('');
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
    starting_price: '₹499',
    badge: 'Uniform Approved',
    show_on_homepage: true,
  });

  // Reorder State
  const [reorderedItems, setReorderedItems] = useState<Category[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  const fetchCategoriesList = async () => {
    setLoading(true);
    try {
      const [data, prods] = await Promise.all([
        getCategories(),
        getAllCatalogProducts(),
      ]);
      setCategories(data);
      setReorderedItems(data);
      setAllProducts(prods);

      const counts: Record<string, number> = {};
      prods.forEach((p) => {
        if (p.productType) {
          counts[p.productType] = (counts[p.productType] || 0) + 1;
        }
      });
      setProductCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
    const handleUpdate = () => fetchCategoriesList();
    window.addEventListener('koskool_categories_updated', handleUpdate);
    window.addEventListener('koskool_products_updated', handleUpdate);
    return () => {
      window.removeEventListener('koskool_categories_updated', handleUpdate);
      window.removeEventListener('koskool_products_updated', handleUpdate);
    };
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

  // Open Assign Products Modal
  const handleOpenAssignModal = () => {
    if (!selectedCategory) return;
    const currentIds = new Set(
      allProducts
        .filter((p) => p.productType === selectedCategory.slug)
        .map((p) => p.id)
    );
    setAssignSelectedIds(currentIds);
    setAssignSearch('');
    setIsAssignModalOpen(true);
  };

  const handleToggleProduct = (id: string) => {
    setAssignSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveAssignments = async () => {
    if (!selectedCategory) return;
    setIsSavingAssignment(true);
    try {
      const toAdd = allProducts.filter(
        (p) => assignSelectedIds.has(p.id) && p.productType !== selectedCategory.slug
      );
      const toRemove = allProducts.filter(
        (p) => !assignSelectedIds.has(p.id) && p.productType === selectedCategory.slug
      );

      await Promise.all([
        ...toAdd.map((p) => updateProduct(p.id, { productType: selectedCategory.slug })),
        ...toRemove.map((p) => updateProduct(p.id, { productType: 'school-shoes' })),
      ]);

      setIsAssignModalOpen(false);
      await fetchCategoriesList();
      await handleSelectCategory(selectedCategory);
    } catch (err) {
      console.error('Failed to update category products:', err);
    } finally {
      setIsSavingAssignment(false);
    }
  };

  const handleRemoveProductFromCategory = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this product from this category?')) return;
    await updateProduct(productId, { productType: 'school-shoes' });
    if (selectedCategory) {
      await fetchCategoriesList();
      await handleSelectCategory(selectedCategory);
    }
  };

  // Open Add Category
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
      starting_price: '₹499',
      badge: 'Uniform Approved',
      show_on_homepage: true,
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
      starting_price: cat.starting_price || '₹499',
      badge: cat.badge || 'Uniform Approved',
      show_on_homepage: cat.show_on_homepage !== false && cat.is_active !== false,
    });
    setIsModalOpen(true);
  };

  // Toggle Homepage Visibility with Eye Button
  const handleToggleHomepage = async (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !(cat.show_on_homepage !== false && cat.is_active !== false);
    await updateCategory(cat.id, { show_on_homepage: nextVal, is_active: nextVal });
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, show_on_homepage: nextVal, is_active: nextVal } : c))
    );
    setReorderedItems((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, show_on_homepage: nextVal, is_active: nextVal } : c))
    );
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      is_active: formData.show_on_homepage,
    };
    if (editingCategory) {
      await updateCategory(editingCategory.id, payload);
    } else {
      await createCategory(payload);
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

            {/* Search and Action within Category */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={categoryProductSearch}
                  onChange={(e) => setCategoryProductSearch(e.target.value)}
                  placeholder={`Search in ${selectedCategory.name}...`}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>

              <button
                onClick={handleOpenAssignModal}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Products</span>
              </button>
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
              <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 p-8 space-y-3">
                <Package className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-sm font-bold text-navy-950">No products assigned to {selectedCategory.name} yet.</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Click below to browse the catalog and apply this category to existing products.
                </p>
                <button
                  onClick={handleOpenAssignModal}
                  className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow transition mt-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Products to this Category</span>
                </button>
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
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/admin/products?search=${encodeURIComponent(p.name)}`}
                      className="text-[10px] text-brand-600 hover:underline font-bold"
                    >
                      Edit Product →
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveProductFromCategory(p.id, e)}
                      className="text-[10px] text-red-500 hover:text-red-700 hover:underline font-bold"
                    >
                      Remove
                    </button>
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

          {/* Homepage Visibility Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
            <div>
              <strong>Homepage Categories Customizer:</strong> You can choose exactly which categories appear on the home page using the Eye button. For example, if you have 5 categories and want to display only 2 on the homepage, click the Eye icon on the 3 you want to hide!
            </div>
            <span className="font-bold text-[11px] bg-white px-3 py-1.5 rounded-xl border border-blue-200 shrink-0 self-start sm:self-auto">
              {categories.filter((c) => c.show_on_homepage !== false && c.is_active !== false).length} of {categories.length} on Home
            </span>
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
            {(isReordering ? reorderedItems : categories).map((cat, idx) => {
              const isOnHome = cat.show_on_homepage !== false && cat.is_active !== false;
              return (
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
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                          Order: #{cat.display_order}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {productCounts[cat.slug] || 0} {productCounts[cat.slug] === 1 ? 'Product' : 'Products'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOnHome
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {isOnHome ? 'On Home' : 'Hidden'}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-navy-950 truncate">{cat.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-brand-600">
                      Click to view products ({productCounts[cat.slug] || 0}) →
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
                            onClick={(e) => handleToggleHomepage(cat, e)}
                            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-bold ${
                              isOnHome
                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                            }`}
                            title={isOnHome ? 'Showing on Homepage (Click to hide)' : 'Hidden from Homepage (Click to show)'}
                          >
                            {isOnHome ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            <span className="text-[10px] hidden sm:inline">{isOnHome ? 'On Home' : 'Hidden'}</span>
                          </button>
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
              );
            })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Starting Price</label>
                  <input
                    type="text"
                    value={formData.starting_price}
                    onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                    placeholder="e.g. ₹499"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-emerald-700 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Uniform Approved"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
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

              {/* Show on Homepage Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cat_show_on_home"
                  checked={formData.show_on_homepage}
                  onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="cat_show_on_home" className="text-xs font-bold text-navy-950 cursor-pointer">
                  Show on Homepage Category Showcase
                </label>
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

      {/* Assign Products to Category Modal */}
      {isAssignModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-gray-200 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-navy-950">
                  Assign Products to {selectedCategory.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Select products from the catalog to apply category <span className="font-mono font-bold text-navy-950">{selectedCategory.slug}</span> ({assignSelectedIds.size} selected)
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-navy-950 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Quick Selection */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  placeholder="Filter products by title, SKU, gender..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const filtered = allProducts.filter((p) =>
                    p.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                    (p.brand && p.brand.toLowerCase().includes(assignSearch.toLowerCase())) ||
                    (p.gender && p.gender.toLowerCase().includes(assignSearch.toLowerCase()))
                  );
                  const next = new Set(assignSelectedIds);
                  filtered.forEach((p) => next.add(p.id));
                  setAssignSelectedIds(next);
                }}
                className="text-[11px] font-bold text-brand-600 hover:underline px-2"
              >
                Select Filtered
              </button>
              <button
                type="button"
                onClick={() => setAssignSelectedIds(new Set())}
                className="text-[11px] font-bold text-gray-400 hover:text-gray-600 px-2"
              >
                Clear All
              </button>
            </div>

            {/* Scrollable Products List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-2xl p-1 max-h-[50vh]">
              {allProducts
                .filter((p) =>
                  p.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                  (p.brand && p.brand.toLowerCase().includes(assignSearch.toLowerCase())) ||
                  (p.gender && p.gender.toLowerCase().includes(assignSearch.toLowerCase()))
                )
                .map((p) => {
                  const isChecked = assignSelectedIds.has(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleProduct(p.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                        isChecked ? 'bg-brand-50/70 border border-brand-200/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleProduct(p.id)}
                        className="w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-10 h-10 rounded-lg bg-gray-50 relative overflow-hidden border border-gray-200 shrink-0">
                        <Image
                          src={p.images[0] || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                          alt={p.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-navy-950 truncate">{p.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span className="font-bold text-navy-950">₹{p.price}</span>
                          <span>•</span>
                          <span className="capitalize">{p.gender}</span>
                          <span>•</span>
                          <span className="font-mono text-gray-400">Current: {p.productType}</span>
                        </div>
                      </div>
                      {isChecked && (
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md shrink-0">
                          Selected
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-500">
                {assignSelectedIds.size} {assignSelectedIds.size === 1 ? 'product' : 'products'} assigned to {selectedCategory.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={isSavingAssignment}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingAssignment ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Apply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
