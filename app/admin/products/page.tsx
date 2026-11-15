'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
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
  Star,
  Palette,
  FileText,
  DollarSign,
  Layers,
  HelpCircle,
  Info,
  Tag,
  Percent,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts,
  getCategories,
  Category,
  toggleProductHomepageShowcase,
  getHomepageProductIds,
  getProductReviews,
  deleteReview,
  ProductReview,
} from '@/services/api';
import { Product, ColorVariant } from '@/data/products';
import { uploadToStorage } from '@/lib/supabase';

const FALLBACK_CATEGORIES = [
  { slug: 'school-shoes', name: 'School Shoes' },
  { slug: 'sports-shoes', name: 'Sports & PT Shoes' },
  { slug: 'fabric-shoes', name: 'Canvas & Fabric Shoes' },
  { slug: 'bags', name: 'School Bags' },
  { slug: 'accessories', name: 'Accessories' },
  { slug: 'sandals', name: 'Sandals' },
  { slug: 'daily-wear', name: 'Daily Wear' },
];

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
  const [homeProductIds, setHomeProductIds] = useState<Set<string>>(new Set());
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Modal Tab & Custom Size State
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'colors' | 'reviews' | 'content' | 'sizes'>('basic');
  const [customSizeInput, setCustomSizeInput] = useState('');

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
    colorVariants: [],
    categoryOptions: ['BOYS', 'KIDS'],
    rating: 4.8,
    reviewCount: 100,
    additionalInfo: '',
    shippingInfo: '',
    features: ['Specially engineered for school uniform daily compliance', 'Anti-slip durable rubber outsole'],
    images: [],
    description: '',
    material: 'High-Density Water-Resistant PU Upper + TPR Anti-Slip Sole',
    closureType: 'Velcro Hook-and-Loop',
    inStock: true,
    isPopular: false,
    isNewArrival: false,
    showOnHomepage: false,
  });

  // Product Reviews Management in Modal
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [loadingProductReviews, setLoadingProductReviews] = useState(false);
  const [deletingProductReviewId, setDeletingProductReviewId] = useState<string | null>(null);

  useEffect(() => {
    const currentId = editingProduct?.id || formData?.id || formData?.slug;
    const currentSlug = editingProduct?.slug || formData?.slug;
    const currentName = editingProduct?.name || formData?.name;
    if (isAddModalOpen && activeModalTab === 'reviews' && currentId) {
      setLoadingProductReviews(true);
      getProductReviews(currentId, currentSlug, currentName)
        .then((list) => setProductReviews(list))
        .catch(() => setProductReviews([]))
        .finally(() => setLoadingProductReviews(false));
    }
  }, [isAddModalOpen, activeModalTab, editingProduct, formData?.id, formData?.slug, formData?.name]);

  const handleDeleteSpecificReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this comment from this product?')) return;
    try {
      setDeletingProductReviewId(id);
      await deleteReview(id);
      setProductReviews((prev) => prev.filter((r) => r.id !== id));
      setFormData((prev: any) => ({
        ...prev,
        reviewCount: Math.max(0, (prev.reviewCount || 1) - 1),
      }));
      setToastNotification('Comment deleted successfully');
      setTimeout(() => setToastNotification(null), 3000);
    } catch (err) {
      alert('Failed to delete review');
    } finally {
      setDeletingProductReviewId(null);
    }
  };

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
    const loadCategories = () => {
      getCategories().then((cats) => {
        if (cats && cats.length > 0) setCategories(cats);
      });
    };
    loadCategories();

    window.addEventListener('koskool_categories_updated', loadCategories);
    return () => {
      window.removeEventListener('koskool_categories_updated', loadCategories);
    };
  }, []);

  // Load and listen for Homepage Showcase Product IDs
  useEffect(() => {
    const loadHomeIds = async () => {
      try {
        const ids = await getHomepageProductIds();
        setHomeProductIds(new Set(ids));
      } catch (e) {
        console.error(e);
      }
    };
    loadHomeIds();

    window.addEventListener('koskool_banner_showcase_updated', loadHomeIds);
    window.addEventListener('koskool_data_updated', loadHomeIds);
    window.addEventListener('storage', loadHomeIds);

    return () => {
      window.removeEventListener('koskool_banner_showcase_updated', loadHomeIds);
      window.removeEventListener('koskool_data_updated', loadHomeIds);
      window.removeEventListener('storage', loadHomeIds);
    };
  }, []);

  const handleToggleHomeShowcase = async (p: Product) => {
    const isCurrentlyOnHome = homeProductIds.has(p.id);
    const nextSet = new Set(homeProductIds);
    if (isCurrentlyOnHome) {
      nextSet.delete(p.id);
    } else {
      nextSet.add(p.id);
    }
    setHomeProductIds(nextSet);

    const res = await toggleProductHomepageShowcase(p.id);
    setToastNotification(
      res.isOnHomepage
        ? `"${p.name}" is now showing on Homepage Bottom Banner Showcase!`
        : `"${p.name}" removed from Homepage Bottom Banner Showcase.`
    );
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Compute all available categories by combining Category Management data and fallbacks
  const availableCategories = useMemo(() => {
    const list: { slug: string; name: string }[] = [];
    const seen = new Set<string>();

    // 1. Dynamic categories from Category Management section
    categories.forEach((c) => {
      if (c.slug && !seen.has(c.slug)) {
        seen.add(c.slug);
        list.push({ slug: c.slug, name: c.name });
      }
    });

    // 2. Standard fallbacks if not already present
    FALLBACK_CATEGORIES.forEach((f) => {
      if (!seen.has(f.slug)) {
        seen.add(f.slug);
        list.push(f);
      }
    });

    // 3. If formData has a productType not in the list, keep it visible
    if (formData.productType && !seen.has(formData.productType)) {
      list.push({
        slug: formData.productType,
        name: formData.productType.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      });
    }

    return list;
  }, [categories, formData.productType]);

  // Lookup map for category names
  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    FALLBACK_CATEGORIES.forEach((f) => {
      map[f.slug] = f.name;
    });
    categories.forEach((c) => {
      if (c.slug) map[c.slug] = c.name;
    });
    return map;
  }, [categories]);

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setActiveModalTab('basic');
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
      colorVariants: [],
      categoryOptions: ['BOYS', 'KIDS'],
      rating: 4.8,
      reviewCount: 100,
      additionalInfo: '',
      shippingInfo: '',
      features: ['Specially engineered for school uniform daily compliance', 'Anti-slip durable rubber outsole'],
      images: ['/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'],
      description: 'Specially engineered for school uniform daily compliance and playground stamina.',
      material: 'School Grade PU + Durable Non-Marking Rubber Outsole',
      closureType: 'Velcro Hook-and-Loop',
      inStock: true,
      isPopular: false,
      isNewArrival: false,
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEdit = (p: Product) => {
    setActiveModalTab('basic');
    setEditingProduct(p);

    // Initial color variants from product or generated from colors
    let initialVariants: ColorVariant[] = [];
    if (p.colorVariants && p.colorVariants.length > 0) {
      initialVariants = p.colorVariants;
    } else if (p.colours && p.colours.length > 0) {
      initialVariants = p.colours.map((col, idx) => ({
        name: col,
        image: p.images[idx] || p.images[0] || '',
      }));
    } else if (p.primaryColour) {
      initialVariants = [{
        name: p.primaryColour,
        image: p.images[0] || '',
      }];
    }

    const calculatedDiscount = p.discountPercent ?? (p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : 0);

    setFormData({
      name: p.name || '',
      slug: p.slug || '',
      brand: p.brand || 'KOSKOOL',
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      discountPercent: calculatedDiscount,
      gender: p.gender || 'boys',
      schoolLevel: p.schoolLevel || [],
      productType: p.productType || 'school-shoes',
      sizes: p.sizes || [],
      colours: p.colours && p.colours.length > 0 ? p.colours : [p.primaryColour || 'Black'],
      primaryColour: p.primaryColour || 'Black',
      colorVariants: initialVariants,
      categoryOptions: p.categoryOptions || [],
      rating: p.rating ?? 4.8,
      reviewCount: p.reviewCount ?? 100,
      additionalInfo: p.additionalInfo || '',
      shippingInfo: p.shippingInfo || '',
      features: p.features || [],
      images: p.images && p.images.length > 0 ? p.images : [],
      description: p.description || '',
      material: p.material || '',
      closureType: p.closureType || 'Lace-Up',
      inStock: p.inStock !== false,
      isPopular: p.isPopular ?? false,
      isNewArrival: p.isNewArrival ?? false,
      showOnHomepage: homeProductIds.has(p.id) || !!p.showOnHomepage,
    });
    setIsAddModalOpen(true);
  };

  // Color Variants Helpers
  const handleAddColorVariant = () => {
    setFormData((prev: any) => ({
      ...prev,
      colorVariants: [
        ...(prev.colorVariants || []),
        { name: '', image: prev.images?.[0] || '' },
      ],
    }));
  };

  const handleUpdateColorVariant = (index: number, field: 'name' | 'image', value: string) => {
    setFormData((prev: any) => {
      const nextVariants = [...(prev.colorVariants || [])];
      nextVariants[index] = { ...nextVariants[index], [field]: value };
      
      // If primaryColour is empty and this is the first variant, set primaryColour
      let primary = prev.primaryColour;
      if (field === 'name' && (!primary || primary === 'Black') && index === 0 && value.trim()) {
        primary = value.trim();
      }

      return { ...prev, colorVariants: nextVariants, primaryColour: primary };
    });
  };

  const handleRemoveColorVariant = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      colorVariants: (prev.colorVariants || []).filter((_: any, idx: number) => idx !== index),
    }));
  };

  const handleSyncColoursFromVariants = () => {
    const variantNames = (formData.colorVariants || [])
      .map((v: ColorVariant) => v.name.trim())
      .filter(Boolean);
    if (variantNames.length > 0) {
      setFormData((prev: any) => ({
        ...prev,
        colours: Array.from(new Set(variantNames)),
        primaryColour: prev.primaryColour || variantNames[0],
      }));
    }
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    setFormData((prev: any) => {
      const current = prev.sizes || [];
      if (!current.includes(trimmed)) {
        return { ...prev, sizes: [...current, trimmed] };
      }
      return prev;
    });
    setCustomSizeInput('');
  };

  const insertFootwearTemplate = () => {
    const tpl = `Manufactured by: Walkaroo International Pvt Ltd. Plot No 10-12, SIDCO Industrial Estate, Malumichampatti, Coimbatore - 641050 India
Commodity - Footwear
Number of Commodity - 2N (1 Pair)
Country of Origin - India
Customer Care: 011-6119-7311 customercare@walkaroo.in
Please Note: The color of the original product may slightly vary due to photography lighting and your screen brightness.`;
    setFormData((prev: any) => ({ ...prev, additionalInfo: tpl }));
  };

  const insertShippingTemplate = () => {
    const tpl = `This item is eligible for our 7 day easy return policy. No questions asked.
Estimated time of delivery: 2 to 6 working days.
Free shipping on orders ₹500 and above. Flat ₹100 delivery fee on orders below ₹500. Cash on delivery available.`;
    setFormData((prev: any) => ({ ...prev, shippingInfo: tpl }));
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
      if (formData.showOnHomepage !== homeProductIds.has(editingProduct.id)) {
        await toggleProductHomepageShowcase(editingProduct.id);
      }
    } else {
      const res = await createProduct(formData);
      if (formData.showOnHomepage && res.data?.id) {
        await toggleProductHomepageShowcase(res.data.id);
      }
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
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 bg-navy-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-brand-500 flex items-center gap-2.5 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastNotification}</span>
        </div>
      )}

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
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
            {FALLBACK_CATEGORIES.filter((f) => !categories.some((c) => c.slug === f.slug)).map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name}
              </option>
            ))}
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
            <option value="home_bottom">On Home Bottom Showcase ({homeProductIds.size})</option>
            <option value="active">In Stock / Active</option>
            <option value="inactive">Out of Stock</option>
          </select>

          {/* Home Bottom Showcase Quick Filter */}
          <button
            onClick={() => {
              setStatusFilter(statusFilter === 'home_bottom' ? 'all' : 'home_bottom');
              setPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              statusFilter === 'home_bottom'
                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Home Bottom ({homeProductIds.size})</span>
          </button>

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
                <th className="py-3.5 px-4 text-center">Home Bottom</th>
                {isReorderingMode && <th className="py-3.5 px-4 text-center">Reorder Position</th>}
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-navy-950 border-t-brand-600 rounded-full animate-spin" />
                      <span>Loading products from Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : (isReorderingMode ? reorderedItems : products).length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                (isReorderingMode ? reorderedItems : products)
                  .filter((p) => (statusFilter === 'home_bottom' ? homeProductIds.has(p.id) : true))
                  .map((p, idx) => (
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
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="bg-brand-50 text-brand-800 border border-brand-200/60 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        {categoryNameMap[p.productType] || p.productType.replace(/-/g, ' ')}
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

                    {/* Home Bottom Eye Toggle Button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleHomeShowcase(p)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition shadow-2xs ${
                          homeProductIds.has(p.id)
                            ? 'bg-brand-50 text-brand-700 border border-brand-200/80 hover:bg-brand-100'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-navy-950'
                        }`}
                        title={
                          homeProductIds.has(p.id)
                            ? 'Showing on Homepage Bottom Banner Showcase (Click to hide)'
                            : 'Click to show on Homepage Bottom Banner Showcase'
                        }
                      >
                        {homeProductIds.has(p.id) ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-brand-600" />
                            <span>On Home</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hidden</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 border border-gray-200 shadow-2xl space-y-5 my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-navy-950">
                  {editingProduct ? 'Edit Product' : 'Add New Product to Supabase'}
                </h2>
                <p className="text-xs text-gray-500">
                  Configure pricing, crossed-out MRP, colors, reviews & additional information
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-100 flex-shrink-0">
              {[
                { id: 'basic', label: 'Pricing & Info', icon: DollarSign },
                { id: 'colors', label: 'Colors & Swatches', icon: Palette },
                { id: 'reviews', label: 'Reviews & Rating', icon: Star },
                { id: 'content', label: 'Additional Info & Content', icon: FileText },
                { id: 'sizes', label: 'Sizes & Images', icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveModalTab(tab.id as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Body (Scrollable) */}
            <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              
              {/* ================= TAB 1: PRICING & BASIC INFO ================= */}
              {activeModalTab === 'basic' && (
                <div className="space-y-4">
                  {/* Product Title */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. chipit or Walkaroo Urbanoz Sandals"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    />
                  </div>

                  {/* Brand & Slug */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="e.g. KOSKOOL, URBANOZ, BOUNCEEZ"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Product URL Slug</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. chipit-kids-sandals"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Pricing & Discount */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => {
                          const p = Number(e.target.value);
                          const orig = formData.originalPrice || p;
                          const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                          setFormData({ ...formData, price: p, discountPercent: disc });
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <span className="text-[10px] text-gray-400">Actual price customer pays</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Original MRP (₹)</label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => {
                          const orig = Number(e.target.value);
                          const p = formData.price;
                          const disc = orig > p ? Math.round(((orig - p) / orig) * 100) : 0;
                          setFormData({ ...formData, originalPrice: orig, discountPercent: disc });
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <span className="text-[10px] text-gray-400">Shown crossed-out (strikethrough)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Discount %</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={formData.discountPercent}
                          onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none"
                        />
                        <span className="text-xs font-bold text-gray-500">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Price Preview Box matching Image 3 */}
                  <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/50 border border-amber-200/80 rounded-2xl p-3.5">
                    <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Tag className="w-3 h-3 text-brand-600" />
                      <span>Live Storefront Price Display (Customer View)</span>
                    </div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <div className="flex items-baseline font-black text-gray-950">
                        <span className="text-sm font-bold mr-0.5 leading-none">₹</span>
                        <span className="text-2xl font-black tracking-tight leading-none">
                          {Number(formData.price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {formData.originalPrice && formData.originalPrice > formData.price && (
                        <span className="text-base text-gray-400 line-through font-semibold decoration-gray-500 decoration-[1.5px]">
                          ₹{Number(formData.originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}

                      {formData.originalPrice && formData.originalPrice > formData.price && (
                        <span className="text-[11px] font-black text-brand-600 bg-white border border-brand-200 px-2 py-0.5 rounded shadow-sm uppercase">
                          {formData.discountPercent || Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}% OFF
                        </span>
                      )}

                      <span className="text-[11px] text-gray-500 font-normal">
                        (Inclusive of all taxes)
                      </span>
                    </div>
                  </div>

                  {/* Category, Gender, Closure Type */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">Category</label>
                        <Link
                          href="/admin/categories"
                          target="_blank"
                          className="text-[10px] text-brand-600 hover:underline font-bold"
                          title="Manage Categories in Category Section"
                        >
                          + Manage
                        </Link>
                      </div>
                      <select
                        value={formData.productType}
                        onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        {availableCategories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Gender / Dept</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-950 font-bold focus:outline-none"
                      >
                        <option value="boys">Boys</option>
                        <option value="girls">Girls</option>
                        <option value="kids">Kids</option>
                        <option value="mens">Mens</option>
                        <option value="women">Women</option>
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

                  {/* Stock & Badges */}
                  <div className="flex items-center gap-4 pt-1 flex-wrap">
                    <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.inStock !== false}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                      />
                      <span>In Stock</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!formData.isPopular}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                        className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                      />
                      <span>Popular Pick / Bestseller</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!formData.isNewArrival}
                        onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                        className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                      />
                      <span>New Arrival</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer bg-brand-50 px-3 py-2 rounded-xl border border-brand-200 text-xs font-bold text-brand-800">
                      <input
                        type="checkbox"
                        checked={!!formData.showOnHomepage}
                        onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                        className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                      />
                      <Eye className="w-4 h-4 text-brand-600" />
                      <span>Show on Homepage (Bottom Banner Showcase)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: COLORS & SWATCHES ================= */}
              {activeModalTab === 'colors' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Primary Colour */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Primary Selected Colour *
                      </label>
                      <input
                        type="text"
                        value={formData.primaryColour}
                        onChange={(e) => setFormData({ ...formData, primaryColour: e.target.value })}
                        placeholder="e.g. Black, Tan, Olive, Navy"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <span className="text-[10px] text-gray-400">Shown next to "Colour:" label</span>
                    </div>

                    {/* Available Colours text */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Available Colours (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={(formData.colours || []).join(', ')}
                        onChange={(e) => {
                          const parsed = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setFormData({ ...formData, colours: parsed });
                        }}
                        placeholder="e.g. Black, Tan, Olive, Brown"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <span className="text-[10px] text-gray-400">List of all colours for this item</span>
                    </div>
                  </div>

                  {/* Color Variants (Swatches on Product Page) */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-gray-800">
                          Color Swatch Variants (Thumbnails on Product Page)
                        </label>
                        <p className="text-[11px] text-gray-400">
                          Each variant appears as a clickable swatch button with its image
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {formData.colours && formData.colours.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const created = formData.colours.map((c: string, idx: number) => ({
                                name: c,
                                image: formData.images[idx] || formData.images[0] || '',
                              }));
                              setFormData({ ...formData, colorVariants: created });
                            }}
                            className="text-[10px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
                          >
                            Populate from Colours
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAddColorVariant}
                          className="inline-flex items-center gap-1 text-[11px] font-bold bg-navy-950 text-white hover:bg-brand-600 px-3 py-1.5 rounded-xl transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Variant</span>
                        </button>
                      </div>
                    </div>

                    {/* Variant list */}
                    {(!formData.colorVariants || formData.colorVariants.length === 0) ? (
                      <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center text-xs text-gray-500 bg-gray-50">
                        <Palette className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
                        <p className="font-semibold text-gray-700">No color variants created yet</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Click "Add Variant" or "Populate from Colours" to show color swatches on the product page
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {formData.colorVariants.map((variant: ColorVariant, vIdx: number) => (
                          <div
                            key={vIdx}
                            className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex items-center gap-3"
                          >
                            {/* Thumbnail preview */}
                            <div className="relative w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {variant.image ? (
                                <Image src={variant.image} alt={variant.name} fill className="object-contain p-1" />
                              ) : (
                                <Palette className="w-5 h-5 text-gray-400" />
                              )}
                            </div>

                            {/* Name input */}
                            <div className="w-32 flex-shrink-0">
                              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Colour Name</label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => handleUpdateColorVariant(vIdx, 'name', e.target.value)}
                                placeholder="e.g. Tan"
                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-navy-950 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                              />
                            </div>

                            {/* Image URL input */}
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Swatch Image URL</label>
                              <input
                                type="text"
                                value={variant.image}
                                onChange={(e) => handleUpdateColorVariant(vIdx, 'image', e.target.value)}
                                placeholder="/cdn/shop/files/... or https://..."
                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-navy-950 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                              />
                            </div>

                            {/* Quick image shortcuts if available */}
                            {formData.images && formData.images.length > 0 && (
                              <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                                <span className="text-[10px] text-gray-400 font-medium">Use img:</span>
                                {formData.images.slice(0, 3).map((imgUrl: string, imgIdx: number) => (
                                  <button
                                    key={imgIdx}
                                    type="button"
                                    onClick={() => handleUpdateColorVariant(vIdx, 'image', imgUrl)}
                                    className="relative w-7 h-7 rounded border border-gray-200 overflow-hidden hover:border-brand-500 bg-white"
                                    title={`Use image #${imgIdx + 1}`}
                                  >
                                    <Image src={imgUrl} alt="pick" fill className="object-contain" />
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Delete variant */}
                            <button
                              type="button"
                              onClick={() => handleRemoveColorVariant(vIdx)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition flex-shrink-0"
                              title="Delete variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB 3: REVIEWS & RATINGS ================= */}
              {activeModalTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
                    <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>Product Reviews & Customer Rating Settings</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      These values are shown next to the stars directly under the product title on the product detail page.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Star Rating */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Star Rating (Out of 5.0)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <span className="text-[10px] text-gray-400">e.g. 4.8, 4.9, 5.0</span>
                    </div>

                    {/* Review Count */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Total Reviews Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reviewCount}
                        onChange={(e) => setFormData({ ...formData, reviewCount: Number(e.target.value) })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <span className="text-[10px] text-gray-400">e.g. 100, 248, 520 reviews</span>
                    </div>
                  </div>

                  {/* Live Star Review Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-2">
                      Live Storefront Review Preview
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(formData.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : i < (formData.rating || 5)
                                ? 'fill-amber-300 text-amber-300'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {formData.rating}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        ({formData.reviewCount ?? 100} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Live Product Comments List & Admin Delete Section */}
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-brand-600" />
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Customer Comments for this Product ({productReviews.length})
                        </span>
                      </div>
                      <Link
                        href="/admin/reviews"
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <span>All Reviews</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {loadingProductReviews ? (
                      <div className="py-6 text-center text-xs text-gray-400">Loading comments...</div>
                    ) : productReviews.length === 0 ? (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
                        No customer comments currently attached to this product.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {productReviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-3 bg-white border border-gray-200 rounded-xl flex items-start justify-between gap-3 text-xs shadow-sm hover:border-gray-300 transition"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-gray-900">{rev.user_name}</span>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < rev.rating
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'fill-gray-200 text-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(rev.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {rev.title && (
                                <p className="font-semibold text-gray-800 truncate">{rev.title}</p>
                              )}
                              <p className="text-gray-600 line-clamp-2">{rev.comment}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteSpecificReview(rev.id)}
                              disabled={deletingProductReviewId === rev.id}
                              title="Delete this comment from product"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB 4: ADDITIONAL INFO & POLICIES ================= */}
              {activeModalTab === 'content' && (
                <div className="space-y-4">
                  {/* Category Buttons / Options (KIDS, BOYS, GIRLS) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Category Badges / Filter Buttons (Shown above size picker)
                    </label>
                    <input
                      type="text"
                      value={(formData.categoryOptions || []).join(', ')}
                      onChange={(e) => {
                        const parsed = e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
                        setFormData({ ...formData, categoryOptions: parsed });
                      }}
                      placeholder="e.g. KIDS, BOYS, GIRLS or MENS, BOYS"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">Quick presets:</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, categoryOptions: ['KIDS', 'BOYS', 'GIRLS'] })}
                        className="text-[10px] text-brand-600 hover:underline font-bold"
                      >
                        [KIDS, BOYS, GIRLS]
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, categoryOptions: ['MENS', 'BOYS'] })}
                        className="text-[10px] text-brand-600 hover:underline font-bold"
                      >
                        [MENS, BOYS]
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, categoryOptions: ['WOMENS', 'GIRLS'] })}
                        className="text-[10px] text-brand-600 hover:underline font-bold"
                      >
                        [WOMENS, GIRLS]
                      </button>
                    </div>
                  </div>

                  {/* Additional Information (Accordion Tab 2) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Additional Information (Accordion Tab on Product Page)
                      </label>
                      <button
                        type="button"
                        onClick={insertFootwearTemplate}
                        className="text-[10px] font-bold text-brand-600 hover:underline"
                      >
                        Insert Default Footwear Info
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={formData.additionalInfo || ''}
                      onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                      placeholder="Manufactured by: Walkaroo International Pvt Ltd...&#10;Commodity: Footwear&#10;Country of Origin: India&#10;Customer Care: 011-6119-7311..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed font-sans"
                    />
                    <span className="text-[10px] text-gray-400">
                      Displayed inside the collapsible "Additional Information" accordion
                    </span>
                  </div>

                  {/* Shipping and Returns (Accordion Tab 3) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Shipping and Returns Policy (Accordion Tab on Product Page)
                      </label>
                      <button
                        type="button"
                        onClick={insertShippingTemplate}
                        className="text-[10px] font-bold text-brand-600 hover:underline"
                      >
                        Insert Default Shipping Policy
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={formData.shippingInfo || ''}
                      onChange={(e) => setFormData({ ...formData, shippingInfo: e.target.value })}
                      placeholder="Eligible for 7 day easy return policy...&#10;Estimated delivery: 2 to 6 working days..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Product Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Specially engineered for school uniform daily compliance and playground stamina..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {/* Key Features */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Key Features (One feature per line)
                    </label>
                    <textarea
                      rows={3}
                      value={(formData.features || []).join('\n')}
                      onChange={(e) => {
                        const feats = e.target.value.split('\n').filter((f) => f.trim().length > 0);
                        setFormData({ ...formData, features: feats });
                      }}
                      placeholder="Dual Adjustable Hook-and-Loop Straps&#10;Ergonomic Cushioned Comfort Footbed&#10;Lightweight Flexible PU Sole"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans"
                    />
                  </div>

                  {/* Material Composition */}
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
                </div>
              )}

              {/* ================= TAB 5: SIZES & IMAGES ================= */}
              {activeModalTab === 'sizes' && (
                <div className="space-y-4">
                  {/* School Wing & Sizes */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        School Wing / Level
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[
                          { id: 'kindergarten', label: 'Kindergarten' },
                          { id: 'middle-wing', label: 'Middle Wing' },
                          { id: 'senior-wing', label: 'Senior Wing' },
                        ].map((wing) => {
                          const isChecked = formData.schoolLevel?.includes(wing.id);
                          return (
                            <button
                              key={wing.id}
                              type="button"
                              onClick={() => {
                                const current = formData.schoolLevel || [];
                                const updated = current.includes(wing.id)
                                  ? current.filter((w: string) => w !== wing.id)
                                  : [...current, wing.id];
                                setFormData({ ...formData, schoolLevel: updated });
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                isChecked
                                  ? 'bg-navy-950 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              <span>{wing.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-gray-700">
                          Available Sizes (Click to toggle)
                        </label>
                        <span className="text-[11px] text-gray-400">
                          {formData.sizes?.length || 0} selected
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          '5', '6', '7', '8', '9', '10', '11', '1', '2', '3', '4',
                          '9C', '10C', '11C', '12C', '13C'
                        ].map((sz) => {
                          const isChecked = formData.sizes?.includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                const current = formData.sizes || [];
                                const updated = current.includes(sz)
                                  ? current.filter((s: string) => s !== sz)
                                  : [...current, sz];
                                setFormData({ ...formData, sizes: updated });
                              }}
                              className={`min-w-8 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                isChecked
                                  ? 'bg-brand-600 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Size Adder */}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={customSizeInput}
                          onChange={(e) => setCustomSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSize();
                            }
                          }}
                          placeholder="Add custom size (e.g. 12, S, M)"
                          className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy-950 focus:outline-none w-48"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomSize}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-bold text-gray-800 transition"
                        >
                          + Add Size
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Supabase Storage Image Uploader */}
                  <div className="space-y-2 pt-3 border-t border-gray-100">
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
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 flex-shrink-0">
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  All changes sync to Supabase & storefront instantly
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingProduct ? 'Save Product Changes' : 'Create Product in Supabase'}</span>
                  </button>
                </div>
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
