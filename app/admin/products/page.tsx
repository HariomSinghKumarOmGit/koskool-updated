'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import {
  Package,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  GripVertical,
  CheckCircle,
  XCircle,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
  getCategories,
  Category,
} from '@/services/api';
import { Product } from '@/data/products';
import { uploadToStorage } from '@/lib/supabase';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('custom');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({
    name: '',
    slug: '',
    brand: 'KOSKOOL',
    price: 499,
    originalPrice: 699,
    discountPercent: 28,
    gender: 'boys',
    schoolLevel: ['middle-wing'],
    productType: 'school-shoes',
    sizes: ['1', '2', '3', '4', '5'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [],
    description: '',
    material: 'High-Density Water-Resistant PU Upper + TPR Anti-Slip Sole',
    closureType: 'Velcro Hook-and-Loop',
    inStock: true,
  });

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reorder State
  const [reorderedItems, setReorderedItems] = useState<Product[]>([]);
  const [isReorderingMode, setIsReorderingMode] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSavedNotification, setOrderSavedNotification] = useState(false);

  // Load products
  const fetchProductsList = async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        page,
        limit,
        search,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
      });
      setProducts(res.products);
      setReorderedItems(res.products);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, [page, categoryFilter, statusFilter, sortBy]);

  // Debounced Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchProductsList();
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      slug: '',
      brand: 'KOSKOOL',
      price: 499,
      originalPrice: 699,
      discountPercent: 28,
      gender: 'boys',
      schoolLevel: ['middle-wing'],
      productType: 'school-shoes',
      sizes: ['1', '2', '3', '4', '5'],
      colours: ['Black'],
      primaryColour: 'Black',
      images: ['/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'],
      description: 'Specially engineered for school uniform daily compliance and playground stamina.',
      material: 'School Grade PU + Durable Non-Marking Rubber Outsole',
      closureType: 'Velcro Hook-and-Loop',
      inStock: true,
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      brand: p.brand || 'KOSKOOL',
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      discountPercent: p.discountPercent || 25,
      gender: p.gender,
      schoolLevel: p.schoolLevel,
      productType: p.productType,
      sizes: p.sizes,
      colours: p.colours,
      primaryColour: p.primaryColour,
      images: p.images && p.images.length > 0 ? p.images : [],
      description: p.description,
      material: p.material,
      closureType: p.closureType || 'Lace-Up',
      inStock: p.inStock,
    });
    setIsAddModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
    } else {
      await createProduct(formData);
    }
    setIsAddModalOpen(false);
    fetchProductsList();
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (deleteCandidate) {
      await deleteProduct(deleteCandidate.id);
      setDeleteCandidate(null);
      fetchProductsList();
    }
  };

  // Toggle Active/Inactive
  const handleToggleStatus = async (p: Product) => {
    const newStatus = !(p.inStock !== false);
    await updateProduct(p.id, { inStock: newStatus });
    fetchProductsList();
  };

  // Image Upload to Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setUploadProgress(20);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round(((i + 1) / files.length) * 80));
      const res = await uploadToStorage(file, 'product-images');
      if (res.url) {
        uploadedUrls.push(res.url);
      }
    }

    setUploadProgress(100);
    setFormData((prev: any) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));

    setTimeout(() => {
      setUploadingImage(false);
      setUploadProgress(0);
    }, 500);
  };

  // Remove an image from form
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, idx: number) => idx !== indexToRemove),
    }));
  };

  // Make Primary Thumbnail
  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev: any) => {
      const img = prev.images[index];
      const rest = prev.images.filter((_: any, idx: number) => idx !== index);
      return { ...prev, images: [img, ...rest] };
    });
  };

  // Drag and drop / Move Reordering
  const handleMoveProduct = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const list = [...reorderedItems];
    const target = list[index];

    if (direction === 'up' && index > 0) {
      list[index] = list[index - 1];
      list[index - 1] = target;
    } else if (direction === 'down' && index < list.length - 1) {
      list[index] = list[index + 1];
      list[index + 1] = target;
    } else if (direction === 'top') {
      list.splice(index, 1);
      list.unshift(target);
    } else if (direction === 'bottom') {
      list.splice(index, 1);
      list.push(target);
    }

    setReorderedItems(list);
  };

  // Save New Custom Order directly to Supabase
  const handleSaveCustomOrder = async () => {
    setIsSavingOrder(true);
    const payload = reorderedItems.map((p, idx) => ({
      id: p.id,
      display_order: (page - 1) * limit + idx + 1,
    }));

    await reorderProducts(payload);
    setIsSavingOrder(false);
    setOrderSavedNotification(true);
    setTimeout(() => setOrderSavedNotification(false), 3000);
    fetchProductsList();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Product Management</h1>
          <p className="text-xs text-gray-500">
            {total} total items • Paginated in 20 items batches with Supabase synchronization
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReorderingMode(!isReorderingMode)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition border ${
              isReorderingMode
                ? 'bg-amber-500 text-white border-amber-600 shadow'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{isReorderingMode ? 'Exit Reordering' : 'Reorder Products'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-brand-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Reordering Active Bar */}
      {isReorderingMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <ArrowUpDown className="w-4 h-4 text-amber-600" />
            <span>Drag-and-Drop &amp; Position Controls Active</span>
            <span className="text-[11px] font-normal text-amber-700">
              (Use Top/Up/Down/Bottom buttons to adjust sequence and save directly to Supabase)
            </span>
          </div>

          <button
            onClick={handleSaveCustomOrder}
            disabled={isSavingOrder}
            className="inline-flex items-center gap-1.5 bg-navy-950 hover:bg-navy-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
          >
            {isSavingOrder ? (
              <span>Saving Order...</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save New Ordering</span>
              </>
            )}
          </button>
        </div>
      )}

      {orderSavedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Product sequence successfully saved to Supabase database!</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          />
        </div>

        {/* Filter Drops */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="school-shoes">School Shoes</option>
            <option value="sports-shoes">Sports Shoes</option>
            <option value="fabric-shoes">Fabric Shoes</option>
            <option value="bags">School Bags</option>
            <option value="accessories">Accessories</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">In Stock / Active</option>
            <option value="inactive">Out of Stock</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none"
          >
            <option value="custom">Custom Order</option>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {/* Product Listing Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-black text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4 w-16">Image</th>
                <th className="py-3.5 px-4">Product Name &amp; Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                {isReorderingMode && <th className="py-3.5 px-4 text-center">Reorder Position</th>}
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-navy-950 border-t-brand-600 rounded-full animate-spin" />
                      <span>Loading products from Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : (isReorderingMode ? reorderedItems : products).length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                (isReorderingMode ? reorderedItems : products).map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition">
                    {/* Index */}
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-gray-400">
                      {(page - 1) * limit + idx + 1}
                    </td>

                    {/* Thumbnail with lazy loading */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 relative overflow-hidden border border-gray-200 shrink-0">
                        <Image
                          src={p.images[0] || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                          alt={p.name}
                          fill
                          loading="lazy"
                          className="object-contain p-1"
                        />
                      </div>
                    </td>

                    {/* Name & SKU */}
                    <td className="py-3 px-4 min-w-[200px]">
                      <span className="font-bold text-navy-950 block truncate max-w-sm">
                        {p.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="font-mono">ID: {p.id}</span>
                        <span>•</span>
                        <span className="capitalize">{p.gender}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 capitalize whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        {p.productType.replace('-', ' ')}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-black text-navy-950">₹{p.price}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[10px] text-gray-400 line-through ml-1.5">
                          ₹{p.originalPrice}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition ${
                          p.inStock !== false
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {p.inStock !== false ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Reorder Buttons */}
                    {isReorderingMode && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                          <button
                            onClick={() => handleMoveProduct(idx, 'top')}
                            title="Move to Top"
                            className="p-1 hover:bg-white rounded-lg text-gray-700 transition"
                          >
                            <span className="text-[10px] font-black uppercase px-1">Top</span>
                          </button>
                          <button
                            onClick={() => handleMoveProduct(idx, 'up')}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-1 hover:bg-white rounded-lg text-gray-700 disabled:opacity-30 transition"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveProduct(idx, 'down')}
                            disabled={idx === reorderedItems.length - 1}
                            title="Move Down"
                            className="p-1 hover:bg-white rounded-lg text-gray-700 disabled:opacity-30 transition"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveProduct(idx, 'bottom')}
                            title="Move to Bottom"
                            className="p-1 hover:bg-white rounded-lg text-gray-700 transition"
                          >
                            <span className="text-[10px] font-black uppercase px-1">End</span>
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-navy-950 hover:bg-gray-100 transition"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <span className="text-xs text-gray-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} products
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-bold text-navy-950 px-2">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-navy-950">
                {editingProduct ? 'Edit Product' : 'Add New Product to Supabase'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. KOSKOOL Boys Easy-Strap Velcro School Shoes"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-950 font-bold focus:outline-none"
                  >
                    <option value="school-shoes">School Shoes</option>
                    <option value="sports-shoes">Sports Shoes</option>
                    <option value="fabric-shoes">Fabric Shoes</option>
                    <option value="bags">Bags</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-950 font-bold focus:outline-none"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="kids">Kids</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Closure Type</label>
                  <input
                    type="text"
                    value={formData.closureType}
                    onChange={(e) => setFormData({ ...formData, closureType: e.target.value })}
                    placeholder="e.g. Velcro Hook-and-Loop"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-950 focus:outline-none"
                  />
                </div>
              </div>

              {/* Supabase Storage Image Uploader */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700">
                    Product Images (Supabase Storage: <code>product-images</code> bucket)
                  </label>
                  <span className="text-[11px] text-gray-400">First image is primary thumbnail</span>
                </div>

                {/* Upload Trigger */}
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-navy-950 px-4 py-2 rounded-xl text-xs font-bold transition">
                    <Upload className="w-4 h-4 text-brand-600" />
                    <span>Upload Images to Supabase</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {uploadingImage && (
                    <span className="text-xs text-brand-600 font-bold animate-pulse">
                      Uploading to Supabase Storage ({uploadProgress}%)...
                    </span>
                  )}
                </div>

                {/* Image Previews & Ordering */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                  {formData.images.map((imgUrl: string, idx: number) => (
                    <div
                      key={idx}
                      className={`relative group rounded-xl overflow-hidden border-2 bg-gray-50 aspect-square ${
                        idx === 0 ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-gray-200'
                      }`}
                    >
                      <Image src={imgUrl} alt="Thumbnail preview" fill className="object-contain p-1" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Main
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="p-1 bg-white text-navy-950 rounded text-[10px] font-bold"
                            title="Set as Main Thumbnail"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 bg-red-600 text-white rounded"
                          title="Remove Image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description & Material */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Engineered for 8 hours school wear, assembly compliance, and active recess drills..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Material Composition</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g. Scuff-resistant synthetic leather + high-grip rubber"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg transition"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Product in Supabase'}
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
            <div className="space-y-1">
              <h3 className="text-base font-black text-navy-950">Confirm Deletion</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete <strong className="text-gray-900">{deleteCandidate.name}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
