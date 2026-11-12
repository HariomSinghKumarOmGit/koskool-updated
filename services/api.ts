import { supabase } from '@/lib/supabase';
import { PRODUCTS, Product } from '@/data/products';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  image_url: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text?: string;
  secondary_cta_link?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number; // e.g. 10%, 20%, 50% or ₹10, ₹20, ₹100
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  valid_until?: string;
}

export interface OrderItem {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image?: string;
  selectedSize: string;
  selectedColour?: string;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  promo_code?: string;
  shipping_cost: number;
  total_amount: number;
  payment_method: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  tracking_notes?: string;
  created_at: string;
}

export interface CustomerInquiry {
  id: string;
  customer_name: string;
  email: string;
  phone?: string;
  inquiry_type: string;
  subject?: string;
  message: string;
  quotation_details?: any;
  is_read: boolean;
  status: 'Pending' | 'In Progress' | 'Resolved';
  created_at: string;
}

// In-memory / localStorage cache for immediate UI responsiveness
const LOCAL_STORAGE_PRODUCTS_KEY = 'koskool_products_cache';
const LOCAL_STORAGE_CATEGORIES_KEY = 'koskool_categories_cache';
const LOCAL_STORAGE_BANNERS_KEY = 'koskool_banners_cache';
const LOCAL_STORAGE_PROMOS_KEY = 'koskool_promos_cache';
const LOCAL_STORAGE_ORDERS_KEY = 'koskool_orders_cache';
const LOCAL_STORAGE_INQUIRIES_KEY = 'koskool_inquiries_cache';

// Helper to get or set local cache
function getCache<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setCache(key: string, val: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

// Default Categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', slug: 'school-shoes', name: 'School Uniform Shoes', description: 'Mandatory assembly & uniform compliant formal shoes', image_url: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg', display_order: 1, is_active: true },
  { id: 'cat-2', slug: 'sports-shoes', name: 'PT & Sports Shoes', description: 'Non-marking white sneakers for PT drill & playground', image_url: '/cdn/shop/files/WGE53354-BLACK-GENTS_4d4814a1-64d8-45b9-a7b8-722cf22d3c8e.v_1786511261_width_1600.jpg', display_order: 2, is_active: true },
  { id: 'cat-3', slug: 'fabric-shoes', name: 'Fabric & Canvas Shoes', description: 'Breathable canvas shoes for daily routine', image_url: '/cdn/shop/files/W1030-BLACK-GENTS_37127caa-12a4-4e9c-914b-f06d017577a5.v_1786513424_width_1600.jpg', display_order: 3, is_active: true },
  { id: 'cat-4', slug: 'bags', name: 'School Backpacks', description: 'Dual-compartment spine-support student bags', image_url: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg', display_order: 4, is_active: true },
  { id: 'cat-5', slug: 'accessories', name: 'Student Accessories', description: 'Water bottles, geometry boxes, pencil pouches, and socks', image_url: '/cdn/shop/files/Kids-Banner.v_1768369268_width_5760.jpg', display_order: 5, is_active: true },
];

// Default Promo Codes
const DEFAULT_PROMO_CODES: PromoCode[] = [
  { id: 'pr-1', code: 'KOSKOOL10', description: '10% School Uniform Discount', discount_type: 'percentage', discount_value: 10, min_order_amount: 499, is_active: true, usage_count: 42 },
  { id: 'pr-2', code: 'KOSKOOL20', description: '20% Back to School Special', discount_type: 'percentage', discount_value: 20, min_order_amount: 999, is_active: true, usage_count: 18 },
  { id: 'pr-3', code: 'KOSKOOL50', description: '50% Mega Flash Sale', discount_type: 'percentage', discount_value: 50, min_order_amount: 1999, max_discount_amount: 1500, is_active: true, usage_count: 5 },
  { id: 'pr-4', code: 'SAVE10', description: '₹10 Instant Flat Savings', discount_type: 'fixed', discount_value: 10, min_order_amount: 199, is_active: true, usage_count: 95 },
  { id: 'pr-5', code: 'SAVE20', description: '₹20 Flat Savings on Daily Essentials', discount_type: 'fixed', discount_value: 20, min_order_amount: 299, is_active: true, usage_count: 31 },
  { id: 'pr-6', code: 'FIRSTSTEP', description: '₹100 Flat Off on First School Order', discount_type: 'fixed', discount_value: 100, min_order_amount: 599, is_active: true, usage_count: 73 },
];

// Default Initial Orders
const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-101',
    order_number: 'KS-849201',
    customer_name: 'Rajesh Sharma',
    customer_email: 'rajesh.sharma@gmail.com',
    customer_phone: '+91 98112 45892',
    delivery_address: 'House No. 42, Pocket B, Rohini Sector 15',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110085',
    items: [
      { id: 'ks-b-sch-01', name: 'KOSKOOL Boys Easy-Strap Velcro School Shoes - Black', price: 499, selectedSize: '1', quantity: 2, image: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg' },
    ],
    subtotal: 998,
    discount_amount: 100,
    promo_code: 'FIRSTSTEP',
    shipping_cost: 0,
    total_amount: 898,
    payment_method: 'upi',
    status: 'Pending',
    tracking_notes: 'Awaiting packaging at Bawana Industrial Unit',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'ord-102',
    order_number: 'KS-752194',
    customer_name: 'Sunita Mehra',
    customer_email: 'sunita.m@yahoo.com',
    customer_phone: '+91 98711 02341',
    delivery_address: 'Flat 304, Green View Apartments, Dwarka Sector 9',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110077',
    items: [
      { id: 'ks-b-sch-02', name: 'KOSKOOL Boys Classic Derby Lace-Up Senior School Shoes - Deep Black', price: 649, selectedSize: '7', quantity: 1, image: '/cdn/shop/files/WGE53354-BLACK-GENTS_4d4814a1-64d8-45b9-a7b8-722cf22d3c8e.v_1786511261_width_1600.jpg' },
    ],
    subtotal: 649,
    discount_amount: 65,
    promo_code: 'KOSKOOL10',
    shipping_cost: 0,
    total_amount: 584,
    payment_method: 'card',
    status: 'Confirmed',
    tracking_notes: 'Quality checked, scheduled for Delhivery courier pickup',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'ord-103',
    order_number: 'KS-621845',
    customer_name: 'Amitabh Verma',
    customer_email: 'amitabh.verma@outlook.com',
    customer_phone: '+91 99100 87654',
    delivery_address: 'C-12, Sector 50',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    items: [
      { id: 'ks-b-sch-01', name: 'KOSKOOL Boys Easy-Strap Velcro School Shoes - Black', price: 499, selectedSize: '12C', quantity: 1, image: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg' },
    ],
    subtotal: 499,
    discount_amount: 0,
    shipping_cost: 70,
    total_amount: 569,
    payment_method: 'cod',
    status: 'Shipped',
    tracking_notes: 'Dispatched via Express Courier from Bawana facility',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// Default Inquiries
const DEFAULT_INQUIRIES: CustomerInquiry[] = [
  {
    id: 'inq-1',
    customer_name: 'Principal R. K. Sharma',
    email: 'rksharma.dps@gmail.com',
    phone: '+91 98112 00001',
    inquiry_type: 'Bulk Quotation',
    subject: 'Bulk order for 500 pairs of Boys & Girls Uniform Shoes (Session 2026)',
    message: 'We are seeking an institutional quotation for 500 pairs of standard black school shoes and white sports shoes for our kindergarten and middle wing students. Please share catalogue price list with factory-direct discount tiers.',
    quotation_details: { estimatedPairs: 500, deliveryMonth: 'March 2026' },
    is_read: false,
    status: 'Pending',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'inq-2',
    customer_name: 'Pooja Aggarwal',
    email: 'pooja.agg@gmail.com',
    phone: '+91 99581 23456',
    inquiry_type: 'Size Exchange',
    subject: 'Request for size exchange from 10C to 11C',
    message: 'Received order KS-849201 today. The shoes look great but size 10C is a bit tight for my 5-year-old son. How can I initiate an exchange for size 11C?',
    is_read: true,
    status: 'In Progress',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

// Default Banners
const DEFAULT_BANNERS: PromotionalBanner[] = [
  {
    id: 'ban-1',
    title: 'Back-to-School Season 2026',
    subtitle: 'Uniform compliant shoes engineered for 8 hours of standing, marching & running.',
    badge: 'ANNUAL ADMISSIONS SALE',
    image_url: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',
    primary_cta_text: 'Explore Boys Shoes',
    primary_cta_link: '/collections/boys',
    secondary_cta_text: 'Explore Girls Shoes',
    secondary_cta_link: '/collections/girls',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'ban-2',
    title: 'High-Impact PT & Sports Drills',
    subtitle: 'Non-marking white sole sneakers with shock-absorbing honeycomb insoles.',
    badge: 'SPORTS DAY READY',
    image_url: '/cdn/shop/files/Sports-Shoe-Web-Banner_934e3fd0-00bd-4c35-a071-b8943d6e32a6.v_1778128141_width_5760.jpg',
    primary_cta_text: 'Shop Sports Footwear',
    primary_cta_link: '/collections/boys-sports-shoes-middle-wing',
    display_order: 2,
    is_active: true,
  },
];

// ==========================================
// 1. PRODUCTS API
// ==========================================
export async function getProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
  sortBy?: string;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const offset = (page - 1) * limit;

  // Attempt Supabase fetch
  try {
    let query = supabase.from('products').select('*', { count: 'exact' });

    if (params?.category && params.category !== 'all') {
      query = query.eq('product_type', params.category);
    }
    if (params?.status && params.status !== 'all') {
      query = query.eq('is_active', params.status === 'active');
    }
    if (params?.search && params.search.trim()) {
      query = query.ilike('name', `%${params.search.trim()}%`);
    }

    // Sorting
    if (params?.sortBy === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (params?.sortBy === 'price-high') {
      query = query.order('price', { ascending: false });
    } else if (params?.sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('display_order', { ascending: true });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (!error && data && data.length > 0) {
      // Map DB products to Product interface
      const formatted: Product[] = data.map((item: any, idx: number) => ({
        id: item.id,
        slug: item.slug || item.id,
        name: item.name,
        brand: item.brand || 'KOSKOOL',
        price: Number(item.price),
        originalPrice: Number(item.original_price || item.price),
        discountPercent: item.discount_percent,
        gender: item.gender || 'boys',
        schoolLevel: item.school_level || ['middle-wing'],
        productType: item.product_type || 'school-shoes',
        accessoryCategory: item.accessory_category,
        bagCategory: item.bag_category,
        sizes: item.sizes || ['1', '2', '3', '4'],
        colours: item.colours || ['Black'],
        primaryColour: item.primary_colour || 'Black',
        capacity: item.capacity,
        images: item.images && item.images.length > 0 ? item.images : ['/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'],
        rating: Number(item.rating || 4.8),
        reviewCount: Number(item.review_count || 100),
        isPopular: item.is_popular,
        isNewArrival: item.is_new_arrival,
        features: item.features || [],
        description: item.description || '',
        material: item.material || '',
        closureType: item.closure_type || '',
        inStock: item.in_stock !== false,
      }));

      return {
        products: formatted,
        total: count || formatted.length,
        page,
        totalPages: Math.ceil((count || formatted.length) / limit),
      };
    }
  } catch (err) {
    console.warn('Supabase products query fallback:', err);
  }

  // Fallback to local cache / PRODUCTS seed
  let localProducts: (Product & { display_order?: number; is_active?: boolean })[] = getCache(
    LOCAL_STORAGE_PRODUCTS_KEY,
    PRODUCTS.map((p, idx) => ({ ...p, display_order: idx + 1, is_active: true }))
  );

  // Apply filters
  if (params?.category && params.category !== 'all') {
    localProducts = localProducts.filter((p) => p.productType === params.category || p.gender === params.category);
  }
  if (params?.status && params.status !== 'all') {
    const isActive = params.status === 'active';
    localProducts = localProducts.filter((p) => (p.is_active ?? true) === isActive);
  }
  if (params?.search && params.search.trim()) {
    const term = params.search.toLowerCase().trim();
    localProducts = localProducts.filter((p) => p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term));
  }

  // Sorting
  if (params?.sortBy === 'price-low') {
    localProducts.sort((a, b) => a.price - b.price);
  } else if (params?.sortBy === 'price-high') {
    localProducts.sort((a, b) => b.price - a.price);
  } else if (params?.sortBy === 'popularity') {
    localProducts.sort((a, b) => b.rating - a.rating);
  } else {
    localProducts.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }

  const total = localProducts.length;
  const paginated = localProducts.slice(offset, offset + limit);

  return {
    products: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function createProduct(product: Partial<Product>): Promise<{ success: boolean; data?: any; error?: string }> {
  const newId = product.id || `ks-${Date.now().toString(36)}`;
  const slug = product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || newId;

  const dbPayload = {
    id: newId,
    slug,
    name: product.name,
    brand: product.brand || 'KOSKOOL',
    price: product.price || 499,
    original_price: product.originalPrice || product.price || 699,
    discount_percent: product.discountPercent || 25,
    gender: product.gender || 'boys',
    school_level: product.schoolLevel || ['middle-wing'],
    product_type: product.productType || 'school-shoes',
    accessory_category: product.accessoryCategory,
    bag_category: product.bagCategory,
    sizes: product.sizes || ['1', '2', '3', '4'],
    colours: product.colours || ['Black'],
    primary_colour: product.primaryColour || 'Black',
    images: product.images && product.images.length > 0 ? product.images : ['/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'],
    features: product.features || [],
    description: product.description || '',
    material: product.material || 'School Grade PU + Rubber Sole',
    closure_type: product.closureType || 'Velcro Hook-and-Loop',
    in_stock: product.inStock !== false,
    is_active: true,
    display_order: 1,
  };

  // Try Supabase insert
  try {
    const { data, error } = await supabase.from('products').insert([dbPayload]).select().single();
    if (error) console.warn('Supabase product insert warning:', error.message);
  } catch (err) {
    console.warn('Supabase product insert catch:', err);
  }

  // Update local cache
  const cached = getCache<any[]>(LOCAL_STORAGE_PRODUCTS_KEY, [...PRODUCTS]);
  const newProduct = {
    ...product,
    id: newId,
    slug,
    price: Number(product.price) || 499,
    originalPrice: Number(product.originalPrice) || 699,
    display_order: 1,
    is_active: true,
    images: dbPayload.images,
  };
  cached.unshift(newProduct);
  setCache(LOCAL_STORAGE_PRODUCTS_KEY, cached);

  return { success: true, data: newProduct };
}

export async function updateProduct(id: string, updates: Partial<Product & { is_active?: boolean; display_order?: number }>) {
  // Try Supabase update
  try {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
    if (updates.productType !== undefined) dbUpdates.product_type = updates.productType;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
    if (updates.colours !== undefined) dbUpdates.colours = updates.colours;
    if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
    if (updates.display_order !== undefined) dbUpdates.display_order = updates.display_order;

    await supabase.from('products').update(dbUpdates).eq('id', id);
  } catch {
    // ignore
  }

  // Update local cache
  const cached = getCache<any[]>(LOCAL_STORAGE_PRODUCTS_KEY, [...PRODUCTS]);
  const idx = cached.findIndex((p) => p.id === id);
  if (idx > -1) {
    cached[idx] = { ...cached[idx], ...updates };
    setCache(LOCAL_STORAGE_PRODUCTS_KEY, cached);
  }

  return { success: true };
}

export async function deleteProduct(id: string) {
  try {
    await supabase.from('products').delete().eq('id', id);
  } catch {
    // ignore
  }

  const cached = getCache<any[]>(LOCAL_STORAGE_PRODUCTS_KEY, [...PRODUCTS]);
  const filtered = cached.filter((p) => p.id !== id);
  setCache(LOCAL_STORAGE_PRODUCTS_KEY, filtered);

  return { success: true };
}

export async function reorderProducts(reorderedList: { id: string; display_order: number }[]) {
  // Update in Supabase
  try {
    for (const item of reorderedList) {
      await supabase.from('products').update({ display_order: item.display_order }).eq('id', item.id);
    }
  } catch {
    // ignore
  }

  // Update local cache
  const cached = getCache<any[]>(LOCAL_STORAGE_PRODUCTS_KEY, [...PRODUCTS]);
  const orderMap = new Map(reorderedList.map((item) => [item.id, item.display_order]));
  const updated = cached.map((p) => {
    if (orderMap.has(p.id)) {
      return { ...p, display_order: orderMap.get(p.id) };
    }
    return p;
  });
  updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  setCache(LOCAL_STORAGE_PRODUCTS_KEY, updated);

  return { success: true };
}

// ==========================================
// 2. CATEGORIES API
// ==========================================
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // ignore
  }

  return getCache<Category[]>(LOCAL_STORAGE_CATEGORIES_KEY, DEFAULT_CATEGORIES);
}

export async function createCategory(cat: Partial<Category>) {
  const newCat: Category = {
    id: `cat-${Date.now()}`,
    slug: cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `category-${Date.now()}`,
    name: cat.name || 'New Category',
    description: cat.description || '',
    image_url: cat.image_url || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
    display_order: cat.display_order || 1,
    is_active: true,
  };

  try {
    await supabase.from('categories').insert([newCat]);
  } catch {
    // ignore
  }

  const cached = getCache<Category[]>(LOCAL_STORAGE_CATEGORIES_KEY, DEFAULT_CATEGORIES);
  cached.push(newCat);
  setCache(LOCAL_STORAGE_CATEGORIES_KEY, cached);

  return { success: true, data: newCat };
}

export async function updateCategory(id: string, updates: Partial<Category>) {
  try {
    await supabase.from('categories').update(updates).eq('id', id);
  } catch {
    // ignore
  }

  const cached = getCache<Category[]>(LOCAL_STORAGE_CATEGORIES_KEY, DEFAULT_CATEGORIES);
  const idx = cached.findIndex((c) => c.id === id);
  if (idx > -1) {
    cached[idx] = { ...cached[idx], ...updates };
    setCache(LOCAL_STORAGE_CATEGORIES_KEY, cached);
  }

  return { success: true };
}

export async function deleteCategory(id: string) {
  try {
    await supabase.from('categories').delete().eq('id', id);
  } catch {
    // ignore
  }

  const cached = getCache<Category[]>(LOCAL_STORAGE_CATEGORIES_KEY, DEFAULT_CATEGORIES);
  const filtered = cached.filter((c) => c.id !== id);
  setCache(LOCAL_STORAGE_CATEGORIES_KEY, filtered);

  return { success: true };
}

export async function reorderCategories(reorderedList: { id: string; display_order: number }[]) {
  try {
    for (const item of reorderedList) {
      await supabase.from('categories').update({ display_order: item.display_order }).eq('id', item.id);
    }
  } catch {
    // ignore
  }

  const cached = getCache<Category[]>(LOCAL_STORAGE_CATEGORIES_KEY, DEFAULT_CATEGORIES);
  const map = new Map(reorderedList.map((i) => [i.id, i.display_order]));
  const updated = cached.map((c) => (map.has(c.id) ? { ...c, display_order: map.get(c.id)! } : c));
  updated.sort((a, b) => a.display_order - b.display_order);
  setCache(LOCAL_STORAGE_CATEGORIES_KEY, updated);

  return { success: true };
}

// ==========================================
// 3. PROMO CODES / COUPONS API
// ==========================================
export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // ignore
  }

  return getCache<PromoCode[]>(LOCAL_STORAGE_PROMOS_KEY, DEFAULT_PROMO_CODES);
}

export async function createPromoCode(promo: Partial<PromoCode>) {
  const newPromo: PromoCode = {
    id: `pr-${Date.now()}`,
    code: (promo.code || `CODE${Date.now()}`).toUpperCase().trim(),
    description: promo.description || 'Promotional Discount',
    discount_type: promo.discount_type || 'percentage',
    discount_value: Number(promo.discount_value) || 10,
    min_order_amount: Number(promo.min_order_amount) || 0,
    max_discount_amount: promo.max_discount_amount ? Number(promo.max_discount_amount) : undefined,
    usage_limit: promo.usage_limit,
    usage_count: 0,
    is_active: promo.is_active !== false,
  };

  try {
    await supabase.from('promo_codes').insert([newPromo]);
  } catch {
    // ignore
  }

  const cached = getCache<PromoCode[]>(LOCAL_STORAGE_PROMOS_KEY, DEFAULT_PROMO_CODES);
  cached.unshift(newPromo);
  setCache(LOCAL_STORAGE_PROMOS_KEY, cached);

  return { success: true, data: newPromo };
}

export async function updatePromoCode(id: string, updates: Partial<PromoCode>) {
  try {
    await supabase.from('promo_codes').update(updates).eq('id', id);
  } catch {
    // ignore
  }

  const cached = getCache<PromoCode[]>(LOCAL_STORAGE_PROMOS_KEY, DEFAULT_PROMO_CODES);
  const idx = cached.findIndex((p) => p.id === id);
  if (idx > -1) {
    cached[idx] = { ...cached[idx], ...updates };
    setCache(LOCAL_STORAGE_PROMOS_KEY, cached);
  }

  return { success: true };
}

export async function deletePromoCode(id: string) {
  try {
    await supabase.from('promo_codes').delete().eq('id', id);
  } catch {
    // ignore
  }

  const cached = getCache<PromoCode[]>(LOCAL_STORAGE_PROMOS_KEY, DEFAULT_PROMO_CODES);
  const filtered = cached.filter((p) => p.id !== id);
  setCache(LOCAL_STORAGE_PROMOS_KEY, filtered);

  return { success: true };
}

export async function validatePromoCode(
  inputCode: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; promo?: PromoCode; message: string }> {
  const codeClean = inputCode.trim().toUpperCase();
  const allPromos = await getPromoCodes();

  const found = allPromos.find((p) => p.code === codeClean && p.is_active);

  if (!found) {
    return {
      valid: false,
      discount: 0,
      message: `Invalid or inactive coupon code "${inputCode}". Try KOSKOOL10, KOSKOOL20 or FIRSTSTEP`,
    };
  }

  if (found.min_order_amount && subtotal < found.min_order_amount) {
    return {
      valid: false,
      discount: 0,
      message: `Coupon "${found.code}" requires a minimum order of ₹${found.min_order_amount}. (Cart subtotal: ₹${subtotal})`,
    };
  }

  let calculatedDiscount = 0;
  if (found.discount_type === 'percentage') {
    calculatedDiscount = Math.round((subtotal * found.discount_value) / 100);
    if (found.max_discount_amount && calculatedDiscount > found.max_discount_amount) {
      calculatedDiscount = found.max_discount_amount;
    }
  } else {
    // Fixed amount (₹10, ₹20, ₹100, etc.)
    calculatedDiscount = Math.min(found.discount_value, subtotal);
  }

  return {
    valid: true,
    discount: calculatedDiscount,
    promo: found,
    message: `Coupon "${found.code}" applied: ${
      found.discount_type === 'percentage'
        ? `${found.discount_value}% Off`
        : `₹${found.discount_value} Flat Off`
    }!`,
  };
}

// ==========================================
// 4. PROMOTIONAL BANNERS API
// ==========================================
export async function getPromotionalBanners(): Promise<PromotionalBanner[]> {
  try {
    const { data, error } = await supabase
      .from('promotional_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // ignore
  }

  return getCache<PromotionalBanner[]>(LOCAL_STORAGE_BANNERS_KEY, DEFAULT_BANNERS);
}

export async function createPromotionalBanner(banner: Partial<PromotionalBanner>) {
  const newBanner: PromotionalBanner = {
    id: `ban-${Date.now()}`,
    title: banner.title || 'Promotional Announcement',
    subtitle: banner.subtitle || '',
    badge: banner.badge || 'SPECIAL OFFER',
    image_url: banner.image_url || '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',
    primary_cta_text: banner.primary_cta_text || 'Shop Now',
    primary_cta_link: banner.primary_cta_link || '/collections/boys',
    secondary_cta_text: banner.secondary_cta_text,
    secondary_cta_link: banner.secondary_cta_link,
    display_order: banner.display_order || 1,
    is_active: banner.is_active !== false,
  };

  try {
    await supabase.from('promotional_banners').insert([newBanner]);
  } catch {
    // ignore
  }

  const cached = getCache<PromotionalBanner[]>(LOCAL_STORAGE_BANNERS_KEY, DEFAULT_BANNERS);
  cached.push(newBanner);
  setCache(LOCAL_STORAGE_BANNERS_KEY, cached);

  return { success: true, data: newBanner };
}

export async function updatePromotionalBanner(id: string, updates: Partial<PromotionalBanner>) {
  try {
    await supabase.from('promotional_banners').update(updates).eq('id', id);
  } catch {
    // ignore
  }

  const cached = getCache<PromotionalBanner[]>(LOCAL_STORAGE_BANNERS_KEY, DEFAULT_BANNERS);
  const idx = cached.findIndex((b) => b.id === id);
  if (idx > -1) {
    cached[idx] = { ...cached[idx], ...updates };
    setCache(LOCAL_STORAGE_BANNERS_KEY, cached);
  }

  return { success: true };
}

export async function deletePromotionalBanner(id: string) {
  try {
    await supabase.from('promotional_banners').delete().eq('id', id);
  } catch {
    // ignore
  }

  const cached = getCache<PromotionalBanner[]>(LOCAL_STORAGE_BANNERS_KEY, DEFAULT_BANNERS);
  const filtered = cached.filter((b) => b.id !== id);
  setCache(LOCAL_STORAGE_BANNERS_KEY, filtered);

  return { success: true };
}

// ==========================================
// 5. ORDERS & DELIVERIES API
// ==========================================
export async function getOrders(params?: { status?: string; search?: string }): Promise<Order[]> {
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    if (params?.search && params.search.trim()) {
      query = query.or(`order_number.ilike.%${params.search}%,customer_name.ilike.%${params.search}%`);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // ignore
  }

  let cached = getCache<Order[]>(LOCAL_STORAGE_ORDERS_KEY, DEFAULT_ORDERS);
  if (params?.status && params.status !== 'all') {
    cached = cached.filter((o) => o.status === params.status);
  }
  if (params?.search && params.search.trim()) {
    const term = params.search.toLowerCase();
    cached = cached.filter(
      (o) =>
        o.order_number.toLowerCase().includes(term) ||
        o.customer_name.toLowerCase().includes(term) ||
        o.customer_phone.includes(term)
    );
  }

  return cached;
}

export async function createOrder(orderPayload: Partial<Order>): Promise<{ success: boolean; orderId: string }> {
  const orderNumber = `KS-${Math.floor(100000 + Math.random() * 900000)}`;
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    order_number: orderNumber,
    customer_name: orderPayload.customer_name || 'Valued Parent',
    customer_email: orderPayload.customer_email || 'parent@example.com',
    customer_phone: orderPayload.customer_phone || '+91 98000 00000',
    delivery_address: orderPayload.delivery_address || 'Address',
    city: orderPayload.city || 'Delhi',
    state: orderPayload.state || 'Delhi',
    pincode: orderPayload.pincode || '110001',
    items: orderPayload.items || [],
    subtotal: orderPayload.subtotal || 0,
    discount_amount: orderPayload.discount_amount || 0,
    promo_code: orderPayload.promo_code,
    shipping_cost: orderPayload.shipping_cost || 0,
    total_amount: orderPayload.total_amount || 0,
    payment_method: orderPayload.payment_method || 'cod',
    status: 'Pending',
    tracking_notes: 'Order confirmed and sent to Bawana factory dispatch queue',
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('orders').insert([newOrder]);
  } catch {
    // ignore
  }

  const cached = getCache<Order[]>(LOCAL_STORAGE_ORDERS_KEY, DEFAULT_ORDERS);
  cached.unshift(newOrder);
  setCache(LOCAL_STORAGE_ORDERS_KEY, cached);

  return { success: true, orderId: orderNumber };
}

export async function updateOrderStatus(orderId: string, status: Order['status'], notes?: string) {
  try {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (notes) updates.tracking_notes = notes;
    await supabase.from('orders').update(updates).eq('id', orderId);
  } catch {
    // ignore
  }

  const cached = getCache<Order[]>(LOCAL_STORAGE_ORDERS_KEY, DEFAULT_ORDERS);
  const idx = cached.findIndex((o) => o.id === orderId || o.order_number === orderId);
  if (idx > -1) {
    cached[idx] = { ...cached[idx], status, tracking_notes: notes || cached[idx].tracking_notes };
    setCache(LOCAL_STORAGE_ORDERS_KEY, cached);
  }

  return { success: true };
}

// ==========================================
// 6. CUSTOMER INQUIRIES & QUOTATIONS API
// ==========================================
export async function getInquiries(params?: { status?: string; search?: string }): Promise<CustomerInquiry[]> {
  try {
    let query = supabase.from('inquiries').select('*').order('created_at', { ascending: false });

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    if (params?.search && params.search.trim()) {
      query = query.or(`customer_name.ilike.%${params.search}%,subject.ilike.%${params.search}%`);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // ignore
  }

  let cached = getCache<CustomerInquiry[]>(LOCAL_STORAGE_INQUIRIES_KEY, DEFAULT_INQUIRIES);
  if (params?.status && params.status !== 'all') {
    cached = cached.filter((i) => i.status === params.status);
  }
  if (params?.search && params.search.trim()) {
    const term = params.search.toLowerCase();
    cached = cached.filter(
      (i) =>
        i.customer_name.toLowerCase().includes(term) ||
        (i.subject && i.subject.toLowerCase().includes(term)) ||
        i.message.toLowerCase().includes(term)
    );
  }

  return cached;
}

export async function createInquiry(payload: Partial<CustomerInquiry>) {
  const newInq: CustomerInquiry = {
    id: `inq-${Date.now()}`,
    customer_name: payload.customer_name || 'Guest User',
    email: payload.email || '',
    phone: payload.phone,
    inquiry_type: payload.inquiry_type || 'General',
    subject: payload.subject || 'Website Inquiry',
    message: payload.message || '',
    quotation_details: payload.quotation_details,
    is_read: false,
    status: 'Pending',
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('inquiries').insert([newInq]);
  } catch {
    // ignore
  }

  const cached = getCache<CustomerInquiry[]>(LOCAL_STORAGE_INQUIRIES_KEY, DEFAULT_INQUIRIES);
  cached.unshift(newInq);
  setCache(LOCAL_STORAGE_INQUIRIES_KEY, cached);

  return { success: true, data: newInq };
}

export async function updateInquiry(id: string, updates: Partial<CustomerInquiry>) {
  try {
    await supabase.from('inquiries').update(updates).eq('id', id);
  } catch {
    // ignore
  }

  const cached = getCache<CustomerInquiry[]>(LOCAL_STORAGE_INQUIRIES_KEY, DEFAULT_INQUIRIES);
  const idx = cached.findIndex((i) => i.id === id);
  if (idx > -1) {
    cached[idx] = { ...cached[idx], ...updates };
    setCache(LOCAL_STORAGE_INQUIRIES_KEY, cached);
  }

  return { success: true };
}

export async function deleteInquiry(id: string) {
  try {
    await supabase.from('inquiries').delete().eq('id', id);
  } catch {
    // ignore
  }

  const cached = getCache<CustomerInquiry[]>(LOCAL_STORAGE_INQUIRIES_KEY, DEFAULT_INQUIRIES);
  const filtered = cached.filter((i) => i.id !== id);
  setCache(LOCAL_STORAGE_INQUIRIES_KEY, filtered);

  return { success: true };
}

// ==========================================
// 7. DASHBOARD METRICS AGGREGATOR
// ==========================================
export async function getDashboardMetrics() {
  const [productsRes, categories, orders, inquiries, promos] = await Promise.all([
    getProducts({ limit: 1000 }),
    getCategories(),
    getOrders(),
    getInquiries(),
    getPromoCodes(),
  ]);

  const totalProducts = productsRes.total;
  const totalCategories = categories.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const totalInquiries = inquiries.length;
  const unreadInquiries = inquiries.filter((i) => !i.is_read).length;
  const activePromos = promos.filter((p) => p.is_active).length;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total_amount : 0), 0);

  return {
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    totalInquiries,
    unreadInquiries,
    activePromos,
    totalRevenue,
    recentOrders: orders.slice(0, 5),
    recentProducts: productsRes.products.slice(0, 5),
  };
}
