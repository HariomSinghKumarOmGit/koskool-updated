import { supabase } from '@/lib/supabase';
import { PRODUCTS, Product, getProductsByCollection } from '@/data/products';
import { ProductReview, DEFAULT_PRODUCT_REVIEWS, generateSeedReviewsForProduct } from '@/data/defaultReviews';

export type { ProductReview };

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  show_on_homepage?: boolean;
  product_count?: number;
  starting_price?: string;
  badge?: string;
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

export interface CustomerAddress {
  id: string;
  user_id: string;
  address_type: 'shipping' | 'billing' | 'both';
  name: string;
  phone: string;
  house_flat?: string;
  street_area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  formatted_address?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Pending';

export interface OrderTrackingUpdate {
  id: string;
  order_id: string;
  status: OrderStatus;
  courier_name?: string;
  tracking_id?: string;
  notes?: string;
  update_time: string;
  created_at?: string;
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
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  shipping_address?: CustomerAddress | any;
  billing_address?: CustomerAddress | any;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  promo_code?: string;
  shipping_cost: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'Pending' | 'Paid' | 'Failed';
  status: OrderStatus;
  tracking_id?: string;
  courier_name?: string;
  tracking_notes?: string;
  tracking_history?: OrderTrackingUpdate[];
  created_at: string;
  updated_at?: string;
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

// In-memory / localStorage cache for immediate UI responsiveness & minimal Supabase API calls
const LOCAL_STORAGE_PRODUCTS_KEY = 'koskool_products_cache';
const LOCAL_STORAGE_CATEGORIES_KEY = 'koskool_categories_cache';
const LOCAL_STORAGE_BANNERS_KEY = 'koskool_banners_cache';
const LOCAL_STORAGE_PROMOS_KEY = 'koskool_promos_cache';
const LOCAL_STORAGE_ORDERS_KEY = 'koskool_orders_cache';
const LOCAL_STORAGE_INQUIRIES_KEY = 'koskool_inquiries_cache';
const LOCAL_STORAGE_HOMEPAGE_SECTIONS_KEY = 'koskool_homepage_sections_cache_v3';
const LOCAL_STORAGE_FOOTWEAR_CATEGORIES_KEY = 'koskool_footwear_categories_cache';
const LOCAL_STORAGE_HERO_SLIDES_KEY = 'koskool_hero_slides_cache';
const LOCAL_STORAGE_SCHOOL_LEVELS_KEY = 'koskool_school_levels_cache';
const LOCAL_STORAGE_FEATURED_PRODUCT_KEY = 'koskool_featured_product_cache';

export function broadcastDataChange(topic?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('koskool_data_updated', { detail: { topic } }));
    window.dispatchEvent(new CustomEvent('koskool_homepage_config_updated'));
    window.dispatchEvent(new CustomEvent('koskool_categories_updated'));
    window.dispatchEvent(new CustomEvent('koskool_products_updated'));
    window.dispatchEvent(new CustomEvent('koskool_banner_showcase_updated'));
  }
}

// In-memory response caches with 3-minute TTL to drastically reduce Supabase read egress
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const CACHE_TTL_MS = 3 * 60 * 1000;
const singleProductCache = new Map<string, CacheEntry<Product>>();
const previewListCache = new Map<string, CacheEntry<Product[]>>();

export function invalidateProductCaches() {
  singleProductCache.clear();
  previewListCache.clear();
  catalogCache = null;
}

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
  { id: 'cat-1', slug: 'school-shoes', name: 'School Uniform Shoes', description: 'Mandatory assembly & uniform compliant formal shoes', image_url: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg', display_order: 1, is_active: true, show_on_homepage: true, starting_price: '₹499', badge: 'Morning Assembly' },
  { id: 'cat-2', slug: 'sports-shoes', name: 'PT & Sports Shoes', description: 'Non-marking white sneakers for PT drill & playground', image_url: '/cdn/shop/files/WGE53354-BLACK-GENTS_4d4814a1-64d8-45b9-a7b8-722cf22d3c8e.v_1786511261_width_1600.jpg', display_order: 2, is_active: true, show_on_homepage: true, starting_price: '₹549', badge: 'PT & Drill' },
  { id: 'cat-3', slug: 'fabric-shoes', name: 'Fabric & Canvas Shoes', description: 'Breathable canvas shoes for daily routine', image_url: '/cdn/shop/files/W1030-BLACK-GENTS_37127caa-12a4-4e9c-914b-f06d017577a5.v_1786513424_width_1600.jpg', display_order: 3, is_active: true, show_on_homepage: false, starting_price: '₹399', badge: 'Summer Light' },
  { id: 'cat-4', slug: 'bags', name: 'School Backpacks', description: 'Dual-compartment spine-support student bags', image_url: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg', display_order: 4, is_active: true, show_on_homepage: false, starting_price: '₹649', badge: 'Spine Support' },
  { id: 'cat-5', slug: 'accessories', name: 'Student Accessories', description: 'Water bottles, geometry boxes, pencil pouches, and socks', image_url: '/cdn/shop/files/Kids-Banner.v_1768369268_width_5760.jpg', display_order: 5, is_active: true, show_on_homepage: false, starting_price: '₹99', badge: 'Everyday Kits' },
];

// Helper to test if string is a valid UUID
function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Default Promo Codes
const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: 'pr-welcome10',
    code: 'WELCOME10',
    description: '10% OFF on all school footwear & accessories (Min. order ₹499)',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 499,
    max_discount_amount: 300,
    usage_count: 142,
    is_active: true,
  },
  {
    id: 'pr-school150',
    code: 'BACKTOSCHOOL',
    description: 'Flat ₹150 OFF on full school essentials (Min. order ₹899)',
    discount_type: 'fixed',
    discount_value: 150,
    min_order_amount: 899,
    max_discount_amount: undefined,
    usage_count: 89,
    is_active: true,
  },
  {
    id: 'pr-season20',
    code: 'KOSKOOL20',
    description: '20% Mega Season Discount on complete uniform kits (Min. order ₹1,199)',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 1199,
    max_discount_amount: 450,
    usage_count: 65,
    is_active: true,
  },
  {
    id: 'pr-firststep',
    code: 'FIRSTSTEP',
    description: '₹100 Instant Discount for Kindergarten & Primary parents',
    discount_type: 'fixed',
    discount_value: 100,
    min_order_amount: 599,
    max_discount_amount: undefined,
    usage_count: 118,
    is_active: true,
  },
  {
    id: 'pr-save50',
    code: 'SCHOOL50',
    description: 'Flat ₹50 OFF on any stationery or bottle accessory order',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 399,
    max_discount_amount: undefined,
    usage_count: 204,
    is_active: true,
  },
];

// Orders storage initialization - no mock data in production
const DEFAULT_ORDERS: Order[] = [];

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

export function formatDbProduct(item: any): Product {
  const price = Number(item.price);
  const originalPrice = Number(item.original_price ?? item.originalPrice ?? item.price);
  const discountPercent = item.discount_percent ?? item.discountPercent ?? (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined);

  return {
    id: item.id,
    slug: item.slug || item.id,
    name: item.name,
    brand: item.brand || 'KOSKOOL',
    price,
    originalPrice,
    discountPercent,
    gender: item.gender || 'boys',
    schoolLevel: item.school_level ?? item.schoolLevel ?? ['middle-wing'],
    productType: item.product_type ?? item.productType ?? 'school-shoes',
    accessoryCategory: item.accessory_category ?? item.accessoryCategory,
    bagCategory: item.bag_category ?? item.bagCategory,
    sizes: item.sizes && item.sizes.length > 0 ? item.sizes : ['1', '2', '3', '4'],
    colours: item.colours && item.colours.length > 0 ? item.colours : ['Black'],
    primaryColour: item.primary_colour ?? item.primaryColour ?? 'Black',
    colorVariants: item.color_variants ?? item.colorVariants ?? undefined,
    categoryOptions: item.category_options ?? item.categoryOptions ?? undefined,
    additionalInfo: item.additional_info ?? item.additionalInfo ?? undefined,
    shippingInfo: item.shipping_info ?? item.shippingInfo ?? undefined,
    capacity: item.capacity,
    images: item.images && item.images.length > 0 ? item.images : ['/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'],
    rating: Number(item.rating ?? 4.8),
    reviewCount: Number(item.review_count ?? item.reviewCount ?? 100),
    isPopular: item.is_popular ?? item.isPopular,
    isNewArrival: item.is_new_arrival ?? item.isNewArrival,
    features: item.features || [],
    description: item.description || '',
    material: item.material || '',
    closureType: item.closure_type ?? item.closureType ?? '',
    inStock: item.in_stock !== false && item.inStock !== false,
  };
}

/**
 * Loads a single product on-demand by slug or ID with all images.
 * Reduces API traffic by fetching ONLY the product the user is currently looking at.
 */
export const getProductById = getProductBySlugOrId;

export async function getProductBySlugOrId(slugOrId: string): Promise<Product | null> {
  if (!slugOrId) return null;

  // 1. Check in-memory single product cache first
  const cached = singleProductCache.get(slugOrId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Fetch specific product from Supabase
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const prod = formatDbProduct(data);
      // Overlay any local updates if present
      const localProducts = getCache<Product[]>(LOCAL_STORAGE_PRODUCTS_KEY, []);
      const locallyEdited = localProducts.find((p) => p.slug === slugOrId || p.id === slugOrId);
      const finalProd = locallyEdited ? { ...prod, ...locallyEdited } : prod;

      singleProductCache.set(slugOrId, { data: finalProd, timestamp: Date.now() });
      if (finalProd.slug !== slugOrId) singleProductCache.set(finalProd.slug, { data: finalProd, timestamp: Date.now() });
      if (finalProd.id !== slugOrId) singleProductCache.set(finalProd.id, { data: finalProd, timestamp: Date.now() });
      return finalProd;
    }
  } catch (err) {
    console.warn('Supabase single product fetch warning:', err);
  }

  // 3. Fallback to local products list (checking local cache first)
  const localProducts = getCache<Product[]>(LOCAL_STORAGE_PRODUCTS_KEY, []);
  const fromCache = localProducts.find((p) => p.slug === slugOrId || p.id === slugOrId);
  if (fromCache) {
    singleProductCache.set(slugOrId, { data: fromCache, timestamp: Date.now() });
    return fromCache;
  }
  const fallback = PRODUCTS.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;
  if (fallback) {
    singleProductCache.set(slugOrId, { data: fallback, timestamp: Date.now() });
  }
  return fallback;
}

/**
 * Loads a small preview set of products for Home page sections and carousels.
 * Reduces Supabase API calls and egress by:
 * - Requesting only 6-10 items
 * - Returning only preview images (slice to 2 images max)
 * - Caching results for 3 minutes
 */
export async function getPreviewProducts(options?: {
  filter?: 'popular' | 'newArrival' | 'all';
  category?: string;
  limit?: number;
}): Promise<Product[]> {
  const filter = options?.filter || 'all';
  const category = options?.category || 'all';
  const limit = options?.limit || 8;
  const cacheKey = `preview_${filter}_${category}_${limit}`;

  const cached = previewListCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    let query = supabase
      .from('products')
      .select('id, slug, name, brand, price, original_price, discount_percent, gender, school_level, product_type, sizes, colours, primary_colour, images, rating, review_count, is_popular, is_new_arrival, in_stock, display_order')
      .eq('is_active', true);

    if (category !== 'all') {
      query = query.eq('product_type', category);
    }
    if (filter === 'popular') {
      query = query.eq('is_popular', true);
    } else if (filter === 'newArrival') {
      query = query.eq('is_new_arrival', true);
    }

    query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const mapped = data.map((item: any) => {
        const prod = formatDbProduct(item);
        // Only keep first 2 preview images on home page to save memory and data
        prod.images = prod.images.slice(0, 2);
        return prod;
      });

      previewListCache.set(cacheKey, { data: mapped, timestamp: Date.now() });
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase getPreviewProducts fallback:', err);
  }

  // Fallback to local PRODUCTS & cached admin edits
  const localProducts = getCache<Product[]>(LOCAL_STORAGE_PRODUCTS_KEY, []);
  const mergedMap = new Map<string, Product>();
  PRODUCTS.forEach((p) => mergedMap.set(p.id, p));
  localProducts.forEach((p: any) => {
    if (p.is_active !== false) {
      mergedMap.set(p.id, p);
    } else {
      mergedMap.delete(p.id);
    }
  });
  let combined = Array.from(mergedMap.values());
  combined.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));

  let local = combined.filter((p) => {
    if (category !== 'all' && p.productType !== category) return false;
    if (filter === 'popular' && !p.isPopular) return false;
    if (filter === 'newArrival' && !p.isNewArrival) return false;
    return true;
  }).slice(0, limit);

  previewListCache.set(cacheKey, { data: local, timestamp: Date.now() });
  return local;
}

/**
 * Loads all active catalog products with full DB synchronization and caching.
 * Used for live collection pages and dynamic searches.
 */
let catalogCache: { data: Product[]; timestamp: number } | null = null;

export async function getAllCatalogProducts(): Promise<Product[]> {
  if (catalogCache && Date.now() - catalogCache.timestamp < CACHE_TTL_MS) {
    return catalogCache.data;
  }

  // Read locally cached products (including newly added/edited in admin)
  const localProducts = getCache<Product[]>(LOCAL_STORAGE_PRODUCTS_KEY, []);

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const formatted = data.map(formatDbProduct);
      const mergedMap = new Map<string, Product>();
      formatted.forEach((p) => mergedMap.set(p.id, p));
      
      // Overlay local products
      localProducts.forEach((p: any) => {
        if (p.is_active !== false) {
          mergedMap.set(p.id, p);
        }
      });
      const result = Array.from(mergedMap.values());
      catalogCache = { data: result, timestamp: Date.now() };
      return result;
    }
  } catch (err) {
    console.warn('Supabase getAllCatalogProducts fallback:', err);
  }

  // Fallback: merge PRODUCTS seed with local cache
  const mergedMap = new Map<string, Product>();
  PRODUCTS.forEach((p) => mergedMap.set(p.id, p));
  localProducts.forEach((p: any) => {
    if (p.is_active !== false) {
      mergedMap.set(p.id, p);
    }
  });

  const result = Array.from(mergedMap.values());
  catalogCache = { data: result, timestamp: Date.now() };
  return result;
}

/**
 * Loads products for collection page with pagination and criteria.
 */
export async function getCollectionProducts(slug: string, options?: { limit?: number; page?: number }): Promise<{ products: Product[]; total: number }> {
  const limit = options?.limit || 20;
  const page = options?.page || 1;
  const offset = (page - 1) * limit;

  try {
    let query = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);

    if (slug === 'boys' || slug === 'girls' || slug === 'kids' || slug === 'unisex') {
      query = query.eq('gender', slug);
    } else if (['school-shoes', 'sports-shoes', 'fabric-shoes', 'bags', 'accessories'].includes(slug)) {
      query = query.eq('product_type', slug);
    } else if (['kindergarten', 'middle-wing', 'senior-wing'].includes(slug)) {
      query = query.contains('school_level', [slug]);
    } else if (slug.includes('accessories')) {
      query = query.eq('product_type', 'accessories');
    } else if (slug.includes('bag')) {
      query = query.eq('product_type', 'bags');
    }

    query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (!error && data && data.length > 0) {
      return {
        products: data.map(formatDbProduct),
        total: count || data.length,
      };
    }
  } catch (err) {
    console.warn('Supabase collection products fallback:', err);
  }

  // Fallback to local getProductsByCollection
  const local = getProductsByCollection(slug);
  return {
    products: local.slice(offset, offset + limit),
    total: local.length,
  };
}

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
      query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (!error && data && data.length > 0) {
      const formatted: Product[] = data.map(formatDbProduct);

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

  const price = Number(product.price) || 499;
  const originalPrice = Number(product.originalPrice) || price || 699;
  const discountPercent = product.discountPercent ?? (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  const dbPayload: any = {
    id: newId,
    slug,
    name: product.name,
    brand: product.brand || 'KOSKOOL',
    price,
    original_price: originalPrice,
    discount_percent: discountPercent,
    gender: product.gender || 'boys',
    school_level: product.schoolLevel || ['middle-wing'],
    product_type: product.productType || 'school-shoes',
    accessory_category: product.accessoryCategory,
    bag_category: product.bagCategory,
    sizes: product.sizes || ['1', '2', '3', '4'],
    colours: product.colours || ['Black'],
    primary_colour: product.primaryColour || 'Black',
    images: product.images && product.images.length > 0 ? product.images : ['/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'],
    rating: Number(product.rating ?? 4.8),
    review_count: Number(product.reviewCount ?? 100),
    features: product.features || [],
    description: product.description || '',
    material: product.material || 'School Grade PU + Rubber Sole',
    closure_type: product.closureType || 'Velcro Hook-and-Loop',
    in_stock: product.inStock !== false,
    is_popular: product.isPopular !== undefined ? product.isPopular : true,
    is_new_arrival: product.isNewArrival !== undefined ? product.isNewArrival : true,
    is_active: true,
    display_order: 1,
  };

  if (product.colorVariants) dbPayload.color_variants = product.colorVariants;
  if (product.categoryOptions) dbPayload.category_options = product.categoryOptions;
  if (product.additionalInfo) dbPayload.additional_info = product.additionalInfo;
  if (product.shippingInfo) dbPayload.shipping_info = product.shippingInfo;

  // Try Supabase insert
  try {
    const { data, error } = await supabase.from('products').insert([dbPayload]).select().single();
    if (error) {
      console.warn('Supabase product insert warning:', error.message);
      // Retry without extended schema columns if column not found
      if (error.message.includes('column') || error.code === '42703') {
        const fallbackPayload = { ...dbPayload };
        delete fallbackPayload.color_variants;
        delete fallbackPayload.category_options;
        delete fallbackPayload.additional_info;
        delete fallbackPayload.shipping_info;
        await supabase.from('products').insert([fallbackPayload]);
      }
    }
  } catch (err) {
    console.warn('Supabase product insert catch:', err);
  }

  // Update local cache
  const cached = getCache<any[]>(LOCAL_STORAGE_PRODUCTS_KEY, [...PRODUCTS]);
  const newProduct: Product = {
    id: newId,
    slug,
    name: product.name || 'New Product',
    brand: product.brand || 'KOSKOOL',
    price,
    originalPrice,
    discountPercent,
    gender: (product.gender as any) || 'boys',
    schoolLevel: product.schoolLevel && product.schoolLevel.length > 0 ? product.schoolLevel : ['middle-wing'],
    productType: (product.productType as any) || 'school-shoes',
    accessoryCategory: product.accessoryCategory,
    bagCategory: product.bagCategory,
    sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['1', '2', '3', '4'],
    colours: product.colours && product.colours.length > 0 ? product.colours : ['Black'],
    primaryColour: product.primaryColour || 'Black',
    colorVariants: product.colorVariants,
    categoryOptions: product.categoryOptions,
    additionalInfo: product.additionalInfo,
    shippingInfo: product.shippingInfo,
    images: dbPayload.images,
    rating: Number(product.rating ?? 4.8),
    reviewCount: Number(product.reviewCount ?? 100),
    isPopular: product.isPopular !== undefined ? product.isPopular : true,
    isNewArrival: product.isNewArrival !== undefined ? product.isNewArrival : true,
    features: product.features || [],
    description: product.description || '',
    material: product.material || 'School Grade PU + Rubber Sole',
    closureType: product.closureType || 'Velcro Hook-and-Loop',
    inStock: product.inStock !== false,
  };
  cached.unshift(newProduct);
  setCache(LOCAL_STORAGE_PRODUCTS_KEY, cached);
  invalidateProductCaches();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('koskool_products_updated'));
  }

  return { success: true, data: newProduct };
}

export async function updateProduct(id: string, updates: Partial<Product & { is_active?: boolean; display_order?: number }>) {
  // Try Supabase update
  try {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
    if (updates.originalPrice !== undefined) dbUpdates.original_price = Number(updates.originalPrice);
    if (updates.discountPercent !== undefined) dbUpdates.discount_percent = Number(updates.discountPercent);
    if (updates.productType !== undefined) dbUpdates.product_type = updates.productType;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
    if (updates.colours !== undefined) dbUpdates.colours = updates.colours;
    if (updates.primaryColour !== undefined) dbUpdates.primary_colour = updates.primaryColour;
    if (updates.rating !== undefined) dbUpdates.rating = Number(updates.rating);
    if (updates.reviewCount !== undefined) dbUpdates.review_count = Number(updates.reviewCount);
    if (updates.material !== undefined) dbUpdates.material = updates.material;
    if (updates.closureType !== undefined) dbUpdates.closure_type = updates.closureType;
    if (updates.schoolLevel !== undefined) dbUpdates.school_level = updates.schoolLevel;
    if (updates.features !== undefined) dbUpdates.features = updates.features;
    if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;
    if (updates.isPopular !== undefined) dbUpdates.is_popular = updates.isPopular;
    if (updates.isNewArrival !== undefined) dbUpdates.is_new_arrival = updates.isNewArrival;
    if (updates.colorVariants !== undefined) dbUpdates.color_variants = updates.colorVariants;
    if (updates.categoryOptions !== undefined) dbUpdates.category_options = updates.categoryOptions;
    if (updates.additionalInfo !== undefined) dbUpdates.additional_info = updates.additionalInfo;
    if (updates.shippingInfo !== undefined) dbUpdates.shipping_info = updates.shippingInfo;
    if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
    if (updates.display_order !== undefined) dbUpdates.display_order = updates.display_order;

    const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
    if (error) {
      console.warn('Supabase product update error:', error.message);
      if (error.message.includes('column') || error.code === '42703') {
        const safeUpdates = { ...dbUpdates };
        delete safeUpdates.color_variants;
        delete safeUpdates.category_options;
        delete safeUpdates.additional_info;
        delete safeUpdates.shipping_info;
        await supabase.from('products').update(safeUpdates).eq('id', id);
      }
    }
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
  invalidateProductCaches();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('koskool_products_updated'));
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
  invalidateProductCaches();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('koskool_products_updated'));
  }

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
  invalidateProductCaches();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('koskool_products_updated'));
  }

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
    is_active: cat.is_active !== undefined ? cat.is_active : true,
    show_on_homepage: cat.show_on_homepage !== undefined ? cat.show_on_homepage : true,
    starting_price: cat.starting_price || '₹499',
    badge: cat.badge || '',
  };

  try {
    await supabase.from('categories').insert([newCat]);
  } catch {
    // ignore
  }

  const cached = getCache<Category[]>(LOCAL_STORAGE_CATEGORIES_KEY, DEFAULT_CATEGORIES);
  cached.push(newCat);
  setCache(LOCAL_STORAGE_CATEGORIES_KEY, cached);
  broadcastDataChange('categories');

  return { success: true, data: newCat };
}

export async function toggleCategoryHomepage(id: string) {
  const cached = getCache<Category[]>(LOCAL_STORAGE_CATEGORIES_KEY, DEFAULT_CATEGORIES);
  const idx = cached.findIndex((c) => c.id === id);
  if (idx > -1) {
    const nextState = !(cached[idx].show_on_homepage !== false && cached[idx].is_active !== false);
    cached[idx].show_on_homepage = nextState;
    setCache(LOCAL_STORAGE_CATEGORIES_KEY, cached);
    try {
      await supabase.from('categories').update({ show_on_homepage: nextState }).eq('id', id);
    } catch {
      // ignore
    }
    broadcastDataChange('categories');
    return { success: true, show_on_homepage: nextState };
  }
  return { success: false };
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
    broadcastDataChange('categories');
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
  broadcastDataChange('categories');

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
  broadcastDataChange('categories');

  return { success: true };
}

// Helper to sync promo codes to both cache keys and broadcast
function syncPromoCodesAcrossStorage(promos: PromoCode[]) {
  setCache(LOCAL_STORAGE_PROMOS_KEY, promos);
  if (typeof window !== 'undefined') {
    try {
      const cartPromos = promos.map((p) => ({
        id: p.id,
        code: p.code,
        discountType: p.discount_type,
        discountValue: p.discount_value,
        minOrderValue: p.min_order_amount || 0,
        maxDiscount: p.max_discount_amount && Number(p.max_discount_amount) > 0 ? Number(p.max_discount_amount) : undefined,
        description: p.description,
        isActive: p.is_active,
        usageCount: p.usage_count || 0,
        createdAt: (p as any).created_at || new Date().toISOString().split('T')[0],
      }));
      localStorage.setItem('koskool_promocodes', JSON.stringify(cartPromos));
      window.dispatchEvent(new CustomEvent('koskool_promos_updated', { detail: promos }));
    } catch {
      // ignore
    }
  }
  broadcastDataChange('promos');
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
      syncPromoCodesAcrossStorage(data);
      return data;
    }
  } catch {
    // ignore
  }

  return getCache<PromoCode[]>(LOCAL_STORAGE_PROMOS_KEY, DEFAULT_PROMO_CODES);
}

export async function createPromoCode(promo: Partial<PromoCode>) {
  const code = (promo.code || `CODE${Date.now()}`).toUpperCase().trim();
  const minOrder = promo.min_order_amount !== undefined && promo.min_order_amount !== null ? Number(promo.min_order_amount) : 0;
  const maxCap = promo.max_discount_amount && Number(promo.max_discount_amount) > 0 ? Number(promo.max_discount_amount) : null;

  const dbPayload: any = {
    code,
    description: promo.description || 'Promotional Discount',
    discount_type: promo.discount_type || 'percentage',
    discount_value: Number(promo.discount_value) || 0,
    min_order_amount: minOrder,
    max_discount_amount: maxCap,
    usage_limit: promo.usage_limit || null,
    usage_count: promo.usage_count || 0,
    is_active: promo.is_active !== false,
  };

  let assignedId: string | undefined = undefined;

  try {
    // Only pass id if it is a valid UUID, otherwise let Supabase generate UUID
    const insertData: any = { ...dbPayload };
    if (promo.id && isUUID(promo.id)) {
      insertData.id = promo.id;
    }
    const { data, error } = await supabase.from('promo_codes').insert([insertData]).select().single();
    if (!error && data) {
      assignedId = data.id;
    }
  } catch (err) {
    console.warn('Supabase insert failed, using fallback ID', err);
  }

  const newPromo: PromoCode = {
    ...dbPayload,
    id: assignedId || `promo-${Date.now()}`,
    max_discount_amount: maxCap ?? undefined,
  };

  const cached = getCache<PromoCode[]>(LOCAL_STORAGE_PROMOS_KEY, DEFAULT_PROMO_CODES);
  const filtered = cached.filter((p) => p.code !== newPromo.code && p.id !== newPromo.id);
  filtered.unshift(newPromo);
  syncPromoCodesAcrossStorage(filtered);

  return { success: true, data: newPromo };
}

export async function updatePromoCode(id: string, updates: Partial<PromoCode>) {
  const dbUpdates: any = { ...updates };
  delete dbUpdates.id;
  if (dbUpdates.code) {
    dbUpdates.code = dbUpdates.code.toUpperCase().trim();
  }
  if (dbUpdates.min_order_amount !== undefined) {
    dbUpdates.min_order_amount = Number(dbUpdates.min_order_amount) || 0;
  }
  if (dbUpdates.max_discount_amount !== undefined) {
    dbUpdates.max_discount_amount = dbUpdates.max_discount_amount && Number(dbUpdates.max_discount_amount) > 0 ? Number(dbUpdates.max_discount_amount) : null;
  }

  try {
    if (isUUID(id)) {
      await supabase.from('promo_codes').update(dbUpdates).eq('id', id);
    } else if (updates.code) {
      await supabase.from('promo_codes').update(dbUpdates).eq('code', updates.code.toUpperCase().trim());
    }
  } catch (err) {
    console.warn('Supabase update failed', err);
  }

  const cached = getCache<PromoCode[]>(LOCAL_STORAGE_PROMOS_KEY, DEFAULT_PROMO_CODES);
  const idx = cached.findIndex((p) => p.id === id || (updates.code && p.code === updates.code.toUpperCase().trim()));
  if (idx > -1) {
    cached[idx] = {
      ...cached[idx],
      ...updates,
      max_discount_amount: dbUpdates.max_discount_amount ?? undefined,
    };
    syncPromoCodesAcrossStorage(cached);
  }

  return { success: true };
}

export async function deletePromoCode(id: string) {
  try {
    if (isUUID(id)) {
      await supabase.from('promo_codes').delete().eq('id', id);
    } else {
      const cached = getCache<PromoCode[]>(LOCAL_STORAGE_PROMOS_KEY, DEFAULT_PROMO_CODES);
      const target = cached.find((p) => p.id === id);
      if (target?.code) {
        await supabase.from('promo_codes').delete().eq('code', target.code);
      }
    }
  } catch (err) {
    console.warn('Supabase delete failed', err);
  }

  const cached = getCache<PromoCode[]>(LOCAL_STORAGE_PROMOS_KEY, DEFAULT_PROMO_CODES);
  const filtered = cached.filter((p) => p.id !== id);
  syncPromoCodesAcrossStorage(filtered);

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
      message: `Invalid or inactive coupon code "${inputCode}". Try WELCOME10, BACKTOSCHOOL, or KOSKOOL20`,
    };
  }

  const minOrder = Number(found.min_order_amount) || 0;
  if (minOrder > 0 && subtotal < minOrder) {
    return {
      valid: false,
      discount: 0,
      message: `Coupon "${found.code}" requires a minimum order of ₹${minOrder}. (Cart subtotal: ₹${subtotal})`,
    };
  }

  let calculatedDiscount = 0;
  if (found.discount_type === 'percentage') {
    calculatedDiscount = Math.round((subtotal * Number(found.discount_value)) / 100);
  } else {
    // Fixed amount (₹10, ₹20, ₹100, etc.)
    calculatedDiscount = Math.min(Number(found.discount_value), subtotal);
  }

  const maxCap = found.max_discount_amount && Number(found.max_discount_amount) > 0 ? Number(found.max_discount_amount) : null;
  if (maxCap !== null && calculatedDiscount > maxCap) {
    calculatedDiscount = maxCap;
  }
  calculatedDiscount = Math.max(0, Math.min(calculatedDiscount, subtotal));

  return {
    valid: true,
    discount: calculatedDiscount,
    promo: found,
    message: `Coupon "${found.code}" applied: ${
      found.discount_type === 'percentage'
        ? `${found.discount_value}% Off`
        : `₹${found.discount_value} Flat Off`
    }${maxCap ? ` (Max Cap: ₹${maxCap})` : ''}!`,
  };
}

// ==========================================
// 4. PROMOTIONAL BANNERS API
// ==========================================
export async function getPromotionalBanners(): Promise<PromotionalBanner[]> {
  try {
    const cached = getCache<PromotionalBanner[]>(LOCAL_STORAGE_BANNERS_KEY, [...DEFAULT_BANNERS]);
    if (cached && cached.length > 0) {
      return [...cached].sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
    }
  } catch {
    // ignore
  }

  return [...DEFAULT_BANNERS].sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
}

export async function createPromotionalBanner(banner: Partial<PromotionalBanner>) {
  const newId = `ban-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newBanner: PromotionalBanner = {
    id: newId,
    title: banner.title || 'Promotional Announcement',
    subtitle: banner.subtitle || '',
    badge: banner.badge || 'SPECIAL OFFER',
    image_url: banner.image_url || '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',
    primary_cta_text: banner.primary_cta_text || 'Shop Now',
    primary_cta_link: banner.primary_cta_link || '/collections/boys',
    secondary_cta_text: banner.secondary_cta_text || '',
    secondary_cta_link: banner.secondary_cta_link || '',
    display_order: Number(banner.display_order) || 1,
    is_active: banner.is_active !== false,
  };

  const current = getCache<PromotionalBanner[]>(LOCAL_STORAGE_BANNERS_KEY, [...DEFAULT_BANNERS]);
  const cached = [...current, newBanner];
  cached.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  setCache(LOCAL_STORAGE_BANNERS_KEY, cached);
  broadcastDataChange('banners');
  broadcastDataChange('promotional_banners');

  // Asynchronous non-blocking Supabase sync attempt
  try {
    Promise.resolve(supabase.from('promotional_banners').insert([newBanner])).catch(() => {});
  } catch {
    // ignore
  }

  return { success: true, data: newBanner };
}

export async function updatePromotionalBanner(id: string, updates: Partial<PromotionalBanner>) {
  const payload = {
    ...updates,
    ...(updates.display_order !== undefined ? { display_order: Number(updates.display_order) } : {}),
  };

  const current = getCache<PromotionalBanner[]>(LOCAL_STORAGE_BANNERS_KEY, [...DEFAULT_BANNERS]);
  const cached = current.map((b) => (b.id === id ? { ...b, ...payload } : b));
  cached.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  setCache(LOCAL_STORAGE_BANNERS_KEY, cached);
  broadcastDataChange('banners');
  broadcastDataChange('promotional_banners');

  try {
    Promise.resolve(supabase.from('promotional_banners').update(payload).eq('id', id)).catch(() => {});
  } catch {
    // ignore
  }

  return { success: true };
}

export async function reorderPromotionalBanners(reorderedList: { id: string; display_order: number }[]) {
  const current = getCache<PromotionalBanner[]>(LOCAL_STORAGE_BANNERS_KEY, [...DEFAULT_BANNERS]);
  const map = new Map(reorderedList.map((i) => [i.id, i.display_order]));
  const updated = current.map((b) => (map.has(b.id) ? { ...b, display_order: map.get(b.id)! } : b));
  updated.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
  setCache(LOCAL_STORAGE_BANNERS_KEY, updated);
  broadcastDataChange('banners');
  broadcastDataChange('promotional_banners');

  try {
    for (const item of reorderedList) {
      Promise.resolve(supabase.from('promotional_banners').update({ display_order: item.display_order }).eq('id', item.id)).catch(() => {});
    }
  } catch {
    // ignore
  }

  return { success: true };
}

export async function deletePromotionalBanner(id: string) {
  const current = getCache<PromotionalBanner[]>(LOCAL_STORAGE_BANNERS_KEY, [...DEFAULT_BANNERS]);
  const filtered = current.filter((b) => b.id !== id);
  setCache(LOCAL_STORAGE_BANNERS_KEY, filtered);
  broadcastDataChange('banners');
  broadcastDataChange('promotional_banners');

  try {
    Promise.resolve(supabase.from('promotional_banners').delete().eq('id', id)).catch(() => {});
  } catch {
    // ignore
  }

  return { success: true };
}

// ==========================================
// 5. CUSTOMER ADDRESSES & PROFILES API
// ==========================================
export async function getCustomerAddresses(userId: string): Promise<CustomerAddress[]> {
  if (!userId) return [];
  const localKey = `koskool_addresses_${userId}`;

  // 1. Try dedicated customer_addresses table
  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setCache(localKey, data);
      return data;
    }
  } catch {
    // ignore
  }

  // 2. Try profiles.addresses JSONB column
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('addresses')
      .eq('id', userId)
      .single();

    if (!error && profile?.addresses && Array.isArray(profile.addresses) && profile.addresses.length > 0) {
      setCache(localKey, profile.addresses);
      return profile.addresses;
    }
  } catch {
    // ignore
  }

  // 3. Fallback to localStorage cache
  return getCache<CustomerAddress[]>(localKey, []);
}

export async function saveCustomerAddress(
  userId: string,
  addressData: Partial<CustomerAddress>
): Promise<{ success: boolean; address: CustomerAddress }> {
  const localKey = `koskool_addresses_${userId}`;
  const now = new Date().toISOString();
  const addressId = addressData.id || `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const currentAddresses = await getCustomerAddresses(userId);

  // If new or updated address is set as default, unset other defaults
  const isDefault = Boolean(addressData.is_default) || currentAddresses.length === 0;

  const fullAddress: CustomerAddress = {
    id: addressId,
    user_id: userId,
    address_type: addressData.address_type || 'shipping',
    name: addressData.name || 'Student / Parent',
    phone: addressData.phone || '',
    house_flat: addressData.house_flat || '',
    street_area: addressData.street_area || '',
    landmark: addressData.landmark || '',
    city: addressData.city || 'Delhi',
    state: addressData.state || 'Delhi',
    pincode: addressData.pincode || '',
    country: addressData.country || 'India',
    latitude: addressData.latitude !== undefined ? addressData.latitude : null,
    longitude: addressData.longitude !== undefined ? addressData.longitude : null,
    formatted_address: addressData.formatted_address || '',
    is_default: isDefault,
    created_at: addressData.created_at || now,
    updated_at: now,
  };

  let updatedList: CustomerAddress[];
  const existingIdx = currentAddresses.findIndex((a) => a.id === addressId);
  if (existingIdx > -1) {
    updatedList = currentAddresses.map((a, idx) => {
      if (idx === existingIdx) return fullAddress;
      if (isDefault) return { ...a, is_default: false };
      return a;
    });
  } else {
    updatedList = isDefault
      ? [fullAddress, ...currentAddresses.map((a) => ({ ...a, is_default: false }))]
      : [fullAddress, ...currentAddresses];
  }

  // Save to local cache immediately
  setCache(localKey, updatedList);

  // Attempt sync to Supabase customer_addresses table
  try {
    if (isDefault) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }
    await supabase.from('customer_addresses').upsert([fullAddress], { onConflict: 'id' });
  } catch {
    // ignore
  }

  // Attempt sync to Supabase profiles.addresses JSONB column
  try {
    await supabase
      .from('profiles')
      .update({ addresses: updatedList, updated_at: now })
      .eq('id', userId);
  } catch {
    // ignore
  }

  broadcastDataChange('addresses');
  return { success: true, address: fullAddress };
}

export async function deleteCustomerAddress(
  userId: string,
  addressId: string
): Promise<{ success: boolean }> {
  const localKey = `koskool_addresses_${userId}`;
  const currentAddresses = await getCustomerAddresses(userId);
  const remaining = currentAddresses.filter((a) => a.id !== addressId);

  // If deleted was default and there are remaining addresses, set the first one as default
  if (currentAddresses.find((a) => a.id === addressId)?.is_default && remaining.length > 0) {
    remaining[0].is_default = true;
  }

  setCache(localKey, remaining);

  try {
    await supabase.from('customer_addresses').delete().eq('id', addressId).eq('user_id', userId);
  } catch {
    // ignore
  }

  try {
    await supabase
      .from('profiles')
      .update({ addresses: remaining, updated_at: new Date().toISOString() })
      .eq('id', userId);
  } catch {
    // ignore
  }

  broadcastDataChange('addresses');
  return { success: true };
}

export async function setDefaultCustomerAddress(
  userId: string,
  addressId: string
): Promise<{ success: boolean }> {
  const localKey = `koskool_addresses_${userId}`;
  const currentAddresses = await getCustomerAddresses(userId);
  const updated = currentAddresses.map((a) => ({
    ...a,
    is_default: a.id === addressId,
  }));

  setCache(localKey, updated);

  try {
    await supabase.from('customer_addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('customer_addresses').update({ is_default: true }).eq('id', addressId).eq('user_id', userId);
  } catch {
    // ignore
  }

  try {
    await supabase
      .from('profiles')
      .update({ addresses: updated, updated_at: new Date().toISOString() })
      .eq('id', userId);
  } catch {
    // ignore
  }

  broadcastDataChange('addresses');
  return { success: true };
}

// ==========================================
// 6. ORDERS & DELIVERIES API
// ==========================================
export async function getOrders(params?: {
  userId?: string;
  status?: string;
  search?: string;
}): Promise<Order[]> {
  try {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (params?.userId) {
      query = query.eq('user_id', params.userId);
    }
    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    if (params?.search && params.search.trim()) {
      query = query.or(`order_number.ilike.%${params.search}%,customer_name.ilike.%${params.search}%,customer_phone.ilike.%${params.search}%`);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      // Enrich with tracking updates if order_tracking_updates exists
      try {
        const orderIds = data.map((o: any) => o.id);
        const { data: trackData } = await supabase
          .from('order_tracking_updates')
          .select('*')
          .in('order_id', orderIds)
          .order('update_time', { ascending: true });

        if (trackData && trackData.length > 0) {
          const map = new Map<string, OrderTrackingUpdate[]>();
          for (const tr of trackData) {
            if (!map.has(tr.order_id)) map.set(tr.order_id, []);
            map.get(tr.order_id)!.push(tr);
          }
          data.forEach((o: any) => {
            o.tracking_history = map.get(o.id) || o.tracking_history || [];
          });
        }
      } catch {
        // ignore
      }

      setCache(LOCAL_STORAGE_ORDERS_KEY, data);
      return data;
    }
  } catch {
    // ignore
  }

  let cached = getCache<Order[]>(LOCAL_STORAGE_ORDERS_KEY, DEFAULT_ORDERS);
  if (params?.userId) {
    cached = cached.filter((o) => o.user_id === params.userId);
  }
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

export async function getOrderByIdOrNumber(
  idOrNumber: string,
  userId?: string
): Promise<Order | null> {
  if (!idOrNumber) return null;
  const clean = idOrNumber.trim();

  // Try fetching from Supabase
  try {
    let query = supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${clean},order_number.eq.${clean}`)
      .single();

    const { data, error } = await query;
    if (!error && data) {
      if (userId && data.user_id && data.user_id !== userId) {
        return null; // unauthorized access attempt
      }

      // Fetch tracking updates
      try {
        const { data: tracking } = await supabase
          .from('order_tracking_updates')
          .select('*')
          .eq('order_id', data.id)
          .order('update_time', { ascending: true });

        if (tracking && tracking.length > 0) {
          data.tracking_history = tracking;
        }
      } catch {
        // ignore
      }

      return data;
    }
  } catch {
    // ignore
  }

  // Fallback to cached orders
  const cached = getCache<Order[]>(LOCAL_STORAGE_ORDERS_KEY, DEFAULT_ORDERS);
  const found = cached.find(
    (o) => o.id === clean || o.order_number.toUpperCase() === clean.toUpperCase()
  );

  if (found) {
    if (userId && found.user_id && found.user_id !== userId) {
      return null;
    }
    return found;
  }

  return null;
}

export async function createOrder(
  orderPayload: Partial<Order>
): Promise<{ success: boolean; orderId: string; order: Order }> {
  const orderNumber = `KS-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = `ord-${Date.now()}`;
  const now = new Date().toISOString();

  // Create initial tracking record
  const initialTracking: OrderTrackingUpdate = {
    id: `trk-${Date.now()}`,
    order_id: orderId,
    status: 'Order Placed',
    notes: 'Order received and confirmed. Package queued for uniform quality inspection at Bawana facility.',
    update_time: now,
    created_at: now,
  };

  // Build immutable snapshot of addresses
  const shippingSnap = orderPayload.shipping_address || {
    name: orderPayload.customer_name || 'Valued Parent',
    phone: orderPayload.customer_phone || '',
    street_area: orderPayload.delivery_address || 'Delivery Address',
    city: orderPayload.city || 'Delhi',
    state: orderPayload.state || 'Delhi',
    pincode: orderPayload.pincode || '110001',
    country: 'India',
    latitude: orderPayload.latitude || null,
    longitude: orderPayload.longitude || null,
  };

  const billingSnap = orderPayload.billing_address || shippingSnap;

  const newOrder: Order = {
    id: orderId,
    order_number: orderNumber,
    user_id: orderPayload.user_id || null,
    customer_name: orderPayload.customer_name || 'Valued Parent',
    customer_email: orderPayload.customer_email || 'parent@example.com',
    customer_phone: orderPayload.customer_phone || '+91 98000 00000',
    delivery_address: orderPayload.delivery_address || shippingSnap.street_area || 'Address',
    shipping_address: shippingSnap,
    billing_address: billingSnap,
    city: orderPayload.city || shippingSnap.city || 'Delhi',
    state: orderPayload.state || shippingSnap.state || 'Delhi',
    pincode: orderPayload.pincode || shippingSnap.pincode || '110001',
    latitude: orderPayload.latitude !== undefined ? orderPayload.latitude : (shippingSnap.latitude || null),
    longitude: orderPayload.longitude !== undefined ? orderPayload.longitude : (shippingSnap.longitude || null),
    items: orderPayload.items || [],
    subtotal: orderPayload.subtotal || 0,
    discount_amount: orderPayload.discount_amount || 0,
    promo_code: orderPayload.promo_code,
    shipping_cost: orderPayload.shipping_cost || 0,
    total_amount: orderPayload.total_amount || 0,
    payment_method: orderPayload.payment_method || 'cod',
    payment_status: orderPayload.payment_method === 'cod' ? 'Pending' : 'Paid',
    status: 'Order Placed',
    tracking_notes: initialTracking.notes,
    tracking_history: [initialTracking],
    created_at: now,
    updated_at: now,
  };

  // 1. Insert order into Supabase orders table
  try {
    // Attempt insert with complete schema fields
    const { error: fullErr } = await supabase.from('orders').insert([newOrder]);

    if (fullErr) {
      console.warn('Orders insert full schema notice:', fullErr.message);
      // Fallback: insert with core fields if extra columns are not in schema cache yet
      const coreOrderPayload = {
        order_number: newOrder.order_number,
        user_id: newOrder.user_id,
        customer_name: newOrder.customer_name,
        customer_email: newOrder.customer_email,
        customer_phone: newOrder.customer_phone,
        delivery_address: newOrder.delivery_address,
        city: newOrder.city,
        state: newOrder.state,
        pincode: newOrder.pincode,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        discount_amount: newOrder.discount_amount,
        promo_code: newOrder.promo_code,
        shipping_cost: newOrder.shipping_cost,
        total_amount: newOrder.total_amount,
        payment_method: newOrder.payment_method,
        status: newOrder.status,
        tracking_notes: newOrder.tracking_notes,
      };
      await supabase.from('orders').insert([coreOrderPayload]);
    }
  } catch (err) {
    console.warn('Order database insert error:', err);
  }

  // 2. Insert items into order_items table (if table exists)
  try {
    if (newOrder.items && newOrder.items.length > 0) {
      const orderItemsToInsert = newOrder.items.map((item) => ({
        order_id: newOrder.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        selected_size: item.selectedSize || '',
        selected_colour: item.selectedColour || '',
        image_url: item.image || '',
      }));
      await supabase.from('order_items').insert(orderItemsToInsert);
    }
  } catch {
    // ignore
  }

  // 3. Insert initial tracking update into order_tracking_updates table
  try {
    await supabase.from('order_tracking_updates').insert([
      {
        order_id: newOrder.id,
        status: initialTracking.status,
        notes: initialTracking.notes,
        update_time: initialTracking.update_time,
      },
    ]);
  } catch {
    // ignore
  }

  // Update local cache
  const cached = getCache<Order[]>(LOCAL_STORAGE_ORDERS_KEY, DEFAULT_ORDERS);
  cached.unshift(newOrder);
  setCache(LOCAL_STORAGE_ORDERS_KEY, cached);
  broadcastDataChange('orders');

  return { success: true, orderId: orderNumber, order: newOrder };
}

export async function addOrderTrackingUpdate(
  orderId: string,
  updateData: {
    status: OrderStatus;
    courier_name?: string;
    tracking_id?: string;
    notes?: string;
    update_time?: string;
  }
): Promise<{ success: boolean; trackingRecord?: OrderTrackingUpdate }> {
  const now = updateData.update_time || new Date().toISOString();
  const trackingRecord: OrderTrackingUpdate = {
    id: `trk-${Date.now()}`,
    order_id: orderId,
    status: updateData.status,
    courier_name: updateData.courier_name || '',
    tracking_id: updateData.tracking_id || '',
    notes: updateData.notes || `Status updated to ${updateData.status}`,
    update_time: now,
    created_at: now,
  };

  // 1. Update orders table
  try {
    const orderUpdates: any = {
      status: updateData.status,
      updated_at: now,
    };
    if (updateData.notes) orderUpdates.tracking_notes = updateData.notes;
    if (updateData.tracking_id) orderUpdates.tracking_id = updateData.tracking_id;
    if (updateData.courier_name) orderUpdates.courier_name = updateData.courier_name;

    await supabase.from('orders').update(orderUpdates).eq('id', orderId);
  } catch (err) {
    console.warn('Orders update error:', err);
  }

  // 2. Insert into order_tracking_updates table
  try {
    await supabase.from('order_tracking_updates').insert([
      {
        order_id: orderId,
        status: updateData.status,
        courier_name: updateData.courier_name || null,
        tracking_id: updateData.tracking_id || null,
        notes: updateData.notes || null,
        update_time: now,
      },
    ]);
  } catch {
    // ignore
  }

  // 3. Update local cache
  const cached = getCache<Order[]>(LOCAL_STORAGE_ORDERS_KEY, DEFAULT_ORDERS);
  const idx = cached.findIndex((o) => o.id === orderId || o.order_number === orderId);
  if (idx > -1) {
    const existingHistory = cached[idx].tracking_history || [];
    cached[idx] = {
      ...cached[idx],
      status: updateData.status,
      tracking_id: updateData.tracking_id || cached[idx].tracking_id,
      courier_name: updateData.courier_name || cached[idx].courier_name,
      tracking_notes: updateData.notes || cached[idx].tracking_notes,
      updated_at: now,
      tracking_history: [...existingHistory, trackingRecord],
    };
    setCache(LOCAL_STORAGE_ORDERS_KEY, cached);
  }

  broadcastDataChange('orders');
  return { success: true, trackingRecord };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string,
  courier_name?: string,
  tracking_id?: string
) {
  return addOrderTrackingUpdate(orderId, {
    status,
    notes,
    courier_name,
    tracking_id,
  });
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

// ==========================================
// 8. HOMEPAGE & LAYOUT CUSTOMIZER API
// ==========================================

export interface HomepageSection {
  id: string;
  name: string;
  description: string;
  badge?: string;
  display_order: number;
  is_active: boolean;
}

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  { id: 'hero', name: 'Hero Banner Slideshow', description: 'Primary carousel with official 2026 uniform slides & action CTA buttons', badge: 'Hero Top', display_order: 1, is_active: true },
  { id: 'shop_footwear', name: 'Shop By Footwear Carousel', description: 'Interactive carousel of footwear categories with starting prices', badge: 'Category Showcase', display_order: 2, is_active: true },
  { id: 'school_level', name: 'Shop By School Level', description: 'Kindergarten, Middle Wing, and Senior Wing segmented cards', badge: 'Grade Levels', display_order: 3, is_active: true },
  { id: 'explore_accessories', name: 'Student Accessories Showcase', description: 'Boys, Girls, and Kids accessories cards & school essentials', badge: 'Accessories', display_order: 4, is_active: true },
  { id: 'popular_bags', name: 'Popular School Bags', description: 'Heavy-duty & ergonomic spinal support backpack carousel', badge: 'Backpacks', display_order: 5, is_active: true },
  { id: 'popular_picks', name: 'Popular School Picks', description: 'Interactive tabs (All, Boys, Girls, Bags) with product cards', badge: 'Trending', display_order: 6, is_active: true },
  { id: 'featured_spotlight', name: 'Trending Spotlight Product', description: 'Full sticky product detail view with multi-image gallery & sizing', badge: 'Spotlight', display_order: 7, is_active: true },
  { id: 'banner_showcase', name: 'Collection Banners & Grid', description: 'Walkaroo Bounceez & Bloomsy featured collection cards', badge: 'Banners', display_order: 8, is_active: true },
  { id: 'trust_reviews', name: 'School Trust & Reviews', description: 'Parent testimonials, verified school partner badges & metrics', badge: 'Social Proof', display_order: 9, is_active: true },
  { id: 'marquee', name: 'Announcement Ticker', description: 'Running school trust ticker & seasonal notices', badge: 'Ticker', display_order: 10, is_active: true },
];

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const sections = getCache<HomepageSection[]>(LOCAL_STORAGE_HOMEPAGE_SECTIONS_KEY, DEFAULT_HOMEPAGE_SECTIONS);
  return [...sections]
    .filter((sec) => sec.id !== 'school_bundles')
    .sort((a, b) => a.display_order - b.display_order);
}

export async function saveHomepageSections(sections: HomepageSection[]) {
  setCache(LOCAL_STORAGE_HOMEPAGE_SECTIONS_KEY, sections);
  broadcastDataChange('sections');
  return { success: true };
}

export async function reorderHomepageSections(reorderedList: { id: string; display_order: number }[]) {
  const sections = await getHomepageSections();
  const map = new Map(reorderedList.map((i) => [i.id, i.display_order]));
  const updated = sections.map((s) => (map.has(s.id) ? { ...s, display_order: map.get(s.id)! } : s));
  updated.sort((a, b) => a.display_order - b.display_order);
  setCache(LOCAL_STORAGE_HOMEPAGE_SECTIONS_KEY, updated);
  broadcastDataChange('sections');
  return { success: true };
}

export async function updateHomepageSection(id: string, updates: Partial<HomepageSection>) {
  const sections = await getHomepageSections();
  const idx = sections.findIndex((s) => s.id === id);
  if (idx > -1) {
    sections[idx] = { ...sections[idx], ...updates };
    setCache(LOCAL_STORAGE_HOMEPAGE_SECTIONS_KEY, sections);
    broadcastDataChange('sections');
  }
  return { success: true };
}

// ------------------------------------------
// 9. FOOTWEAR CAROUSEL CATEGORIES
// ------------------------------------------

export interface FootwearCategoryCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  href: string;
  features: string[];
  startingPrice: string; // e.g. "₹499"
  display_order: number;
  is_active: boolean;
  show_on_homepage?: boolean;
}

export const DEFAULT_FOOTWEAR_CATEGORIES: FootwearCategoryCard[] = [
  {
    id: 'school-shoes',
    title: 'School Shoes',
    subtitle: 'Uniform-ready black & white formal shoes engineered with scuff-resistant leather and anti-skid grip.',
    image: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
    tag: 'Morning Assembly Ready',
    href: '/collections/school-shoes',
    features: ['Velcro & Lace-Up', 'Cushioned Insoles', 'Scuff Resistant'],
    startingPrice: '₹499',
    display_order: 1,
    is_active: true,
    show_on_homepage: true,
  },
  {
    id: 'sports-shoes',
    title: 'PT & Sports Shoes',
    subtitle: 'All-white PT & athletic sneakers designed for playground speed, drill days, and physical training.',
    image: '/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg',
    tag: 'PT & Games Approved',
    href: '/collections/sports-shoes',
    features: ['Honeycomb Air-Mesh', 'Non-Marking Soles', 'EVA Cushioning'],
    startingPrice: '₹549',
    display_order: 2,
    is_active: true,
    show_on_homepage: true,
  },
  {
    id: 'fabric-shoes',
    title: 'Fabric & Canvas Shoes',
    subtitle: 'Pure cotton vulcanized canvas shoes built for drill exercises, march pasts, and summer breathability.',
    image: '/cdn/shop/files/WE1356-Black_3dd08639-1ba0-4c08-86fb-b5ddf6184a12.v_1781172079_width_1600.jpg',
    tag: 'Drill & Summer Comfort',
    href: '/collections/fabric-shoes',
    features: ['Washable Canvas', 'Flexible Gum Sole', 'Cool Airflow'],
    startingPrice: '₹399',
    display_order: 3,
    is_active: false,
    show_on_homepage: false,
  },
  {
    id: 'girls-ballerinas',
    title: 'Girls Uniform Ballerinas',
    subtitle: 'Classic Mary Jane slip-ons with secure buckle/velcro straps and memory foam footbed for all-day comfort.',
    image: '/cdn/shop/files/WE2362-Black-Ladies_37f3a155-dc4d-48d2-97a2-c5d95c6c7d49.v_1786512084_width_1600.jpg',
    tag: 'Girls Daily Assembly',
    href: '/collections/girls',
    features: ['Padded Collar', 'Arch Support', 'Non-Slip Sole'],
    startingPrice: '₹449',
    display_order: 4,
    is_active: false,
    show_on_homepage: false,
  },
  {
    id: 'kindergarten-velcro',
    title: 'Junior Easy-Strap Shoes',
    subtitle: 'Super lightweight self-fastening velcro shoes designed specifically for nursery and kindergarten students.',
    image: '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
    tag: 'Early Steps Special',
    href: '/collections/kindergarten',
    features: ['Dual Velcro', 'Under 200g Weight', 'Toe Protection'],
    startingPrice: '₹429',
    display_order: 5,
    is_active: false,
    show_on_homepage: false,
  },
];

export async function getFootwearCategories(): Promise<FootwearCategoryCard[]> {
  const items = getCache<FootwearCategoryCard[]>(LOCAL_STORAGE_FOOTWEAR_CATEGORIES_KEY, DEFAULT_FOOTWEAR_CATEGORIES);
  return [...items].sort((a, b) => a.display_order - b.display_order);
}

export async function saveFootwearCategories(items: FootwearCategoryCard[]) {
  setCache(LOCAL_STORAGE_FOOTWEAR_CATEGORIES_KEY, items);
  broadcastDataChange('footwear_categories');
  return { success: true };
}

export async function createFootwearCategory(card: Partial<FootwearCategoryCard>) {
  const items = await getFootwearCategories();
  const newCard: FootwearCategoryCard = {
    id: card.id || `footwear-cat-${Date.now()}`,
    title: card.title || 'New Footwear Category',
    subtitle: card.subtitle || 'Premium footwear engineered for student comfort.',
    image: card.image || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
    tag: card.tag || 'Popular Choice',
    href: card.href || '/collections/school-shoes',
    features: card.features || ['Cushioned Insole', 'Anti-Slip Sole'],
    startingPrice: card.startingPrice || '₹499',
    display_order: card.display_order || (items.length + 1),
    is_active: card.is_active !== undefined ? card.is_active : true,
    show_on_homepage: card.show_on_homepage !== undefined ? card.show_on_homepage : true,
  };
  items.push(newCard);
  await saveFootwearCategories(items);
  return { success: true, data: newCard };
}

export async function deleteFootwearCategory(id: string) {
  const items = await getFootwearCategories();
  const filtered = items.filter((c) => c.id !== id);
  await saveFootwearCategories(filtered);
  return { success: true };
}

export async function toggleFootwearCategoryHomepage(id: string) {
  const items = await getFootwearCategories();
  const idx = items.findIndex((c) => c.id === id);
  if (idx > -1) {
    const current = items[idx].show_on_homepage !== false && items[idx].is_active !== false;
    items[idx].show_on_homepage = !current;
    items[idx].is_active = !current;
    await saveFootwearCategories(items);
    return { success: true, is_active: !current };
  }
  return { success: false };
}

export async function updateFootwearCategory(id: string, updates: Partial<FootwearCategoryCard>) {
  const items = await getFootwearCategories();
  const idx = items.findIndex((i) => i.id === id);
  if (idx > -1) {
    items[idx] = { ...items[idx], ...updates };
    setCache(LOCAL_STORAGE_FOOTWEAR_CATEGORIES_KEY, items);
    broadcastDataChange('footwear_categories');
  }
  return { success: true };
}

export async function reorderFootwearCategories(reorderedList: { id: string; display_order: number }[]) {
  const items = await getFootwearCategories();
  const map = new Map(reorderedList.map((i) => [i.id, i.display_order]));
  const updated = items.map((c) => (map.has(c.id) ? { ...c, display_order: map.get(c.id)! } : c));
  updated.sort((a, b) => a.display_order - b.display_order);
  setCache(LOCAL_STORAGE_FOOTWEAR_CATEGORIES_KEY, updated);
  broadcastDataChange('footwear_categories');
  return { success: true };
}

// ------------------------------------------
// 10. HERO SLIDES MANAGER
// ------------------------------------------

export interface HeroSlide {
  id: number | string;
  desktopImage: string;
  mobileImage: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  tertiaryCtaText: string;
  tertiaryCtaLink: string;
  display_order: number;
  is_active: boolean;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    desktopImage: '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',
    mobileImage: '/cdn/shop/files/School-Mobile-Banner_fbefffb6-4e80-496e-83b5-bf4a835d0fad.v_1767783342_width_1000.jpg',
    badge: 'KOSKOOL OFFICIAL 2026',
    title: 'Every Step Begins with KOSKOOL.',
    subtitle: 'Discover school-ready footwear and everyday essentials for every stage of their school journey.',
    primaryCtaText: 'Shop Boys',
    primaryCtaLink: '/collections/boys',
    secondaryCtaText: 'Shop Girls',
    secondaryCtaLink: '/collections/girls',
    tertiaryCtaText: 'Explore Accessories',
    tertiaryCtaLink: '/collections/accessories',
    display_order: 1,
    is_active: true,
  },
  {
    id: 2,
    desktopImage: '/uploads/hero-slides/1794699795876-benjamin-voros-phIFdC6lA4E-unsplash.jpg',
    mobileImage: '/uploads/hero-slides/1794699795876-benjamin-voros-phIFdC6lA4E-unsplash.jpg',
    badge: 'AA OFFICIAL 2026',
    title: 'BrobbsuNew School Collection',
    subtitle: 'bro boomDiscover uniform compliant footwear and school essentials.',
    primaryCtaText: 'Hellp babu',
    primaryCtaLink: '/collections/boys',
    secondaryCtaText: 'good luck',
    secondaryCtaLink: '/collections/girls',
    tertiaryCtaText: 'Explore Accessories',
    tertiaryCtaLink: '/collections/accessories',
    display_order: 2,
    is_active: true,
  },
  {
    id: 3,
    desktopImage: '/cdn/shop/files/Sports-Shoe-Web-Banner_934e3fd0-00bd-4c35-a071-b8943d6e32a6.v_1778128141_width_5760.jpg',
    mobileImage: '/cdn/shop/files/Sports-Shoe-Mobile-Web-Banner_69c9e92b-1fbd-4f10-b3ec-b73554dfe45c.v_1778128140_width_1000.jpg',
    badge: 'PT & SPORTS UNIFORM',
    title: 'Built for High-Speed Drills & PT Days.',
    subtitle: 'Non-marking white sports soles with honeycomb shock-absorption for all sports grounds.',
    primaryCtaText: "Boys' Sports",
    primaryCtaLink: '/collections/boys-sports-shoes-middle-wing',
    secondaryCtaText: "Girls' Sports",
    secondaryCtaLink: '/collections/girls-sports-shoes-middle-wing',
    tertiaryCtaText: 'Explore Bags',
    tertiaryCtaLink: '/collections/bags',
    display_order: 3,
    is_active: true,
  },
  {
    id: 4,
    desktopImage: '/cdn/shop/files/Kids-Banner.v_1768369268_width_5760.jpg',
    mobileImage: '/cdn/shop/files/Kids-Mobile-Banner.v_1768369268_width_1000.jpg',
    badge: 'KINDERGARTEN SPECIAL',
    title: 'Tiny Steps, Sturdy Foundations.',
    subtitle: 'Easy-strap velcro shoes and lightweight bags engineered for nursery & junior students.',
    primaryCtaText: 'Kindergarten Footwear',
    primaryCtaLink: '/collections/kindergarten',
    secondaryCtaText: 'Kids Accessories',
    secondaryCtaLink: '/collections/kids-accessories',
    tertiaryCtaText: 'Junior Bags',
    tertiaryCtaLink: '/collections/kids-school-bags',
    display_order: 4,
    is_active: true,
  },
];

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const slides = getCache<HeroSlide[]>(LOCAL_STORAGE_HERO_SLIDES_KEY, DEFAULT_HERO_SLIDES);
  return [...slides].sort((a, b) => a.display_order - b.display_order);
}

export async function saveHeroSlides(slides: HeroSlide[]) {
  setCache(LOCAL_STORAGE_HERO_SLIDES_KEY, slides);
  broadcastDataChange('hero_slides');
  return { success: true };
}

export async function createHeroSlide(slide: Partial<HeroSlide>) {
  const slides = await getHeroSlides();
  const nextOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.display_order)) + 1 : 1;
  const newSlide: HeroSlide = {
    id: Date.now(),
    badge: slide.badge || 'SPECIAL FEATURE',
    title: slide.title || 'New Highlight Banner',
    subtitle: slide.subtitle || 'Shop student uniform and footwear collections with instant home delivery.',
    desktopImage: slide.desktopImage || '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',
    mobileImage: slide.mobileImage || slide.desktopImage || '/cdn/shop/files/School-Mobile-Banner_fbefffb6-4e80-496e-83b5-bf4a835d0fad.v_1767783342_width_1000.jpg',
    primaryCtaText: slide.primaryCtaText || 'Explore Now',
    primaryCtaLink: slide.primaryCtaLink || '/collections/boys',
    secondaryCtaText: slide.secondaryCtaText || 'Shop Collection',
    secondaryCtaLink: slide.secondaryCtaLink || '/collections/girls',
    tertiaryCtaText: slide.tertiaryCtaText || '',
    tertiaryCtaLink: slide.tertiaryCtaLink || '',
    display_order: slide.display_order || nextOrder,
    is_active: slide.is_active !== false,
  };
  slides.push(newSlide);
  setCache(LOCAL_STORAGE_HERO_SLIDES_KEY, slides);
  broadcastDataChange('hero_slides');
  return { success: true, data: newSlide };
}

export async function updateHeroSlide(id: number | string, updates: Partial<HeroSlide>) {
  const slides = await getHeroSlides();
  const idx = slides.findIndex((s) => String(s.id) === String(id));
  if (idx > -1) {
    slides[idx] = { ...slides[idx], ...updates };
    setCache(LOCAL_STORAGE_HERO_SLIDES_KEY, slides);
    broadcastDataChange('hero_slides');
  }
  return { success: true };
}

export async function deleteHeroSlide(id: number | string) {
  const slides = await getHeroSlides();
  const filtered = slides.filter((s) => String(s.id) !== String(id));
  setCache(LOCAL_STORAGE_HERO_SLIDES_KEY, filtered);
  broadcastDataChange('hero_slides');
  return { success: true };
}

export async function reorderHeroSlides(reorderedList: { id: number | string; display_order: number }[]) {
  const slides = await getHeroSlides();
  const map = new Map(reorderedList.map((i) => [String(i.id), i.display_order]));
  const updated = slides.map((s) => (map.has(String(s.id)) ? { ...s, display_order: map.get(String(s.id))! } : s));
  updated.sort((a, b) => a.display_order - b.display_order);
  setCache(LOCAL_STORAGE_HERO_SLIDES_KEY, updated);
  broadcastDataChange('hero_slides');
  return { success: true };
}

// ------------------------------------------
// 11. SCHOOL LEVEL CARDS
// ------------------------------------------

export interface SchoolLevelItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  color: string;
  href: string;
  points: string[];
  startingPrice?: string;
  display_order: number;
  is_active: boolean;
}

export const DEFAULT_SCHOOL_LEVELS: SchoolLevelItem[] = [
  {
    id: 'kindergarten',
    title: 'Kindergarten',
    subtitle: 'Nursery to Prep (Ages 3-6)',
    description: 'Ultra-cushioned shoes with self-fastening velcro straps, featherlight school bags, and spill-proof sipper bottles.',
    badge: 'Early Steps',
    color: 'from-amber-500 to-orange-600',
    href: '/collections/kindergarten',
    points: ['Easy-Strap Velcro', 'Lightweight Under 250g', 'Drop-Proof Bottles'],
    startingPrice: '₹399',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'middle-wing',
    title: 'Middle Wing',
    subtitle: 'Classes 1 to 8 (Ages 6-13)',
    description: 'Heavy-duty footwear built to withstand playground games, rigorous daily wear, sports periods, and heavy books.',
    badge: 'Core School Years',
    color: 'from-blue-600 to-navy-900',
    href: '/collections/middle-wing',
    points: ['Anti-Skid Traction', 'Multi-Pocket Backpacks', 'Math Geometry Kits'],
    startingPrice: '₹499',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'senior-wing',
    title: 'Senior Wing',
    subtitle: 'Classes 9 to 12 (Ages 14-18)',
    description: 'Sophisticated formal oxfords, ballerinas, high-rebound sports trainers, and 35L laptop & textbook backpacks.',
    badge: 'Senior & Boards',
    color: 'from-emerald-600 to-teal-900',
    href: '/collections/senior-wing',
    points: ['Assembly Polished Finish', 'Spine-Relief Back Padding', 'Athletic Court Traction'],
    startingPrice: '₹599',
    display_order: 3,
    is_active: true,
  },
];

export async function getSchoolLevels(): Promise<SchoolLevelItem[]> {
  const levels = getCache<SchoolLevelItem[]>(LOCAL_STORAGE_SCHOOL_LEVELS_KEY, DEFAULT_SCHOOL_LEVELS);
  return [...levels].sort((a, b) => a.display_order - b.display_order);
}

export async function saveSchoolLevels(items: SchoolLevelItem[]) {
  setCache(LOCAL_STORAGE_SCHOOL_LEVELS_KEY, items);
  broadcastDataChange('school_levels');
  return { success: true };
}

export async function updateSchoolLevel(id: string, updates: Partial<SchoolLevelItem>) {
  const items = await getSchoolLevels();
  const idx = items.findIndex((i) => i.id === id);
  if (idx > -1) {
    items[idx] = { ...items[idx], ...updates };
    setCache(LOCAL_STORAGE_SCHOOL_LEVELS_KEY, items);
    broadcastDataChange('school_levels');
  }
  return { success: true };
}

export async function reorderSchoolLevels(reorderedList: { id: string; display_order: number }[]) {
  const items = await getSchoolLevels();
  const map = new Map(reorderedList.map((i) => [i.id, i.display_order]));
  const updated = items.map((l) => (map.has(l.id) ? { ...l, display_order: map.get(l.id)! } : l));
  updated.sort((a, b) => a.display_order - b.display_order);
  setCache(LOCAL_STORAGE_SCHOOL_LEVELS_KEY, updated);
  broadcastDataChange('school_levels');
  return { success: true };
}

// ------------------------------------------
// 12. FEATURED SPOTLIGHT PRODUCT SETTING
// ------------------------------------------

export interface FeaturedSpotlightConfig {
  productSlug: string;
  badge: string;
  subtitle: string;
}

const DEFAULT_FEATURED_SPOTLIGHT: FeaturedSpotlightConfig = {
  productSlug: 'mens-daily-wear-sandals-wgp53410-tan',
  badge: 'Trending Product Spotlight',
  subtitle: 'Scroll images on left • Sticky order details on right',
};

export async function getFeaturedSpotlightConfig(): Promise<FeaturedSpotlightConfig> {
  return getCache<FeaturedSpotlightConfig>(LOCAL_STORAGE_FEATURED_PRODUCT_KEY, DEFAULT_FEATURED_SPOTLIGHT);
}

export async function saveFeaturedSpotlightConfig(cfg: FeaturedSpotlightConfig) {
  setCache(LOCAL_STORAGE_FEATURED_PRODUCT_KEY, cfg);
  broadcastDataChange('featured_spotlight');
  return { success: true };
}

// ------------------------------------------
// 13. BOTTOM BANNER SHOWCASE SECTIONS & PRODUCTS
// ------------------------------------------

export interface BannerShowcaseSection {
  id: string;
  title: string;
  bannerDesktop: string;
  bannerMobile: string;
  bannerAlt: string;
  bannerLink: string;
  productIds: string[];
  gridRows?: 1 | 2; // 1 row (4 products) or 2 rows (8 products)
  display_order: number;
  is_active: boolean;
}

export const DEFAULT_BANNER_SHOWCASE_SECTIONS: BannerShowcaseSection[] = [
  {
    id: 'bounceez',
    title: 'BOUNCEEZ - A Perfect Cushion For Your Foot',
    bannerDesktop: '/cdn/shop/files/Bounceez-Web-Banner-4_94081796-b190-48a0-a99c-0b229a04a5c0.v_1772773040_width_5760.jpg',
    bannerMobile: '/cdn/shop/files/Bounceez-Mobile-Banner-landscape_a1472114-8617-4595-ad17-ba9ae43b7635.v_1772773044_width_1000.jpg',
    bannerAlt: 'Bounceez - A Perfect Cushion For Your Foot',
    bannerLink: '/collections/walkaroo-bounceez',
    productIds: [
      'wgp53283-tan',
      'wgr53350-olive',
      'wgp53283-black',
      'wgr53512-olive',
      'wgp53410-tan',
      'wge53354-black',
      'w1030-black',
      'wv502-black',
    ],
    gridRows: 2,
    display_order: 1,
    is_active: true,
  },
  {
    id: 'bloomsy',
    title: 'Bloom-Ready Every Day - Walkaroo Bloomsy Collection',
    bannerDesktop: '/cdn/shop/files/Bloomsy-Web-Banner_47afcd51-e579-4b9f-a174-6a95c1fa1213.v_1781954684_width_5760.jpg',
    bannerMobile: '/cdn/shop/files/Bloomsy-Mobile-Banner-landscape_75038556-3611-48b3-8b03-a433059825ee.v_1781954947_width_1000.jpg',
    bannerAlt: 'Bloom-Ready Every Day - Walkaroo Bloomsy Collection',
    bannerLink: '/collections/bloomsy-collection',
    productIds: ['wle74035-mauve', 'wlr74019-green', 'wlr74019-plum', 'wle74035-black'],
    gridRows: 1,
    display_order: 2,
    is_active: true,
  },
];

const LOCAL_STORAGE_BANNER_SHOWCASE_KEY = 'koskool_banner_showcase_cache';

export async function getBannerShowcaseSections(): Promise<BannerShowcaseSection[]> {
  const items = getCache<BannerShowcaseSection[]>(LOCAL_STORAGE_BANNER_SHOWCASE_KEY, DEFAULT_BANNER_SHOWCASE_SECTIONS);
  return [...items].sort((a, b) => a.display_order - b.display_order);
}

export async function saveBannerShowcaseSections(items: BannerShowcaseSection[]) {
  setCache(LOCAL_STORAGE_BANNER_SHOWCASE_KEY, items);
  broadcastDataChange('banner_showcase');
  return { success: true };
}

export async function createBannerShowcaseSection(sec: Partial<BannerShowcaseSection>) {
  const items = await getBannerShowcaseSections();
  const newSec: BannerShowcaseSection = {
    id: sec.id || `showcase-${Date.now()}`,
    title: sec.title || 'Promotional Banner Showcase',
    bannerDesktop: sec.bannerDesktop || '/cdn/shop/files/Bounceez-Web-Banner-4_94081796-b190-48a0-a99c-0b229a04a5c0.v_1772773040_width_5760.jpg',
    bannerMobile: sec.bannerMobile || sec.bannerDesktop || '/cdn/shop/files/Bounceez-Mobile-Banner-landscape_a1472114-8617-4595-ad17-ba9ae43b7635.v_1772773044_width_1000.jpg',
    bannerAlt: sec.bannerAlt || sec.title || 'Walkaroo Collection Banner',
    bannerLink: sec.bannerLink || '/collections/walkaroo-bounceez',
    productIds: sec.productIds && sec.productIds.length > 0 ? sec.productIds : ['wgp53283-tan', 'wgr53350-olive', 'wgp53283-black', 'wgr53512-olive'],
    gridRows: (sec.gridRows === 1 || sec.gridRows === 2) ? sec.gridRows : 2,
    display_order: sec.display_order || (items.length + 1),
    is_active: sec.is_active !== undefined ? sec.is_active : true,
  };
  items.push(newSec);
  await saveBannerShowcaseSections(items);
  return { success: true, data: newSec };
}

export async function updateBannerShowcaseSection(id: string, updates: Partial<BannerShowcaseSection>) {
  const items = await getBannerShowcaseSections();
  const idx = items.findIndex((i) => i.id === id);
  if (idx > -1) {
    items[idx] = { ...items[idx], ...updates };
    await saveBannerShowcaseSections(items);
  }
  return { success: true };
}

export async function deleteBannerShowcaseSection(id: string) {
  const items = await getBannerShowcaseSections();
  const filtered = items.filter((i) => i.id !== id);
  await saveBannerShowcaseSections(filtered);
  return { success: true };
}

export async function reorderBannerShowcaseSections(reorderedList: { id: string; display_order: number }[]) {
  const items = await getBannerShowcaseSections();
  const map = new Map(reorderedList.map((i) => [i.id, i.display_order]));
  const updated = items.map((c) => (map.has(c.id) ? { ...c, display_order: map.get(c.id)! } : c));
  updated.sort((a, b) => a.display_order - b.display_order);
  await saveBannerShowcaseSections(updated);
  return { success: true };
}

export async function toggleProductHomepageShowcase(productId: string, sectionId?: string): Promise<{ success: boolean; isOnHomepage: boolean }> {
  const items = await getBannerShowcaseSections();
  if (items.length === 0) return { success: false, isOnHomepage: false };

  const target = sectionId ? items.find((s) => s.id === sectionId) : items[0];
  if (!target) return { success: false, isOnHomepage: false };

  const exists = target.productIds.includes(productId);
  if (exists) {
    target.productIds = target.productIds.filter((id) => id !== productId);
  } else {
    target.productIds.push(productId);
  }

  await saveBannerShowcaseSections(items);

  // Sync product showOnHomepage flag if possible
  try {
    await updateProduct(productId, { showOnHomepage: !exists } as any);
  } catch {
    // ignore
  }

  return { success: true, isOnHomepage: !exists };
}

export async function getHomepageProductIds(): Promise<string[]> {
  const items = await getBannerShowcaseSections();
  const set = new Set<string>();
  items.forEach((s) => {
    if (s.is_active) {
      s.productIds.forEach((id) => set.add(id));
    }
  });
  return Array.from(set);
}

// =========================================================================
// PRODUCT REVIEWS API & PERSISTENCE
// =========================================================================

export interface CreateReviewInput {
  product_id: string;
  product_slug?: string;
  product_name?: string;
  user_name: string;
  user_email?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  recommend?: boolean;
  verified_purchase?: boolean;
}

const LOCAL_STORAGE_REVIEWS_PREFIX = 'koskool_reviews_';
const LOCAL_STORAGE_ALL_REVIEWS_KEY = 'koskool_reviews_master';
const LOCAL_STORAGE_DELETED_REVIEWS_KEY = 'koskool_deleted_reviews_list';

function getDeletedReviewIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_REVIEWS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
}

function recordDeletedReviewId(reviewId: string) {
  if (typeof window === 'undefined') return;
  try {
    const ids = getDeletedReviewIds();
    ids.add(reviewId);
    localStorage.setItem(LOCAL_STORAGE_DELETED_REVIEWS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

/**
 * Normalizes an array of review records from DB or localStorage
 */
function normalizeReviewRecord(item: any): ProductReview {
  let images: string[] = [];
  if (Array.isArray(item.images)) {
    images = item.images;
  } else if (typeof item.images === 'string') {
    try {
      images = JSON.parse(item.images);
    } catch {
      images = item.images ? [item.images] : [];
    }
  }

  return {
    id: item.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    product_id: item.product_id,
    user_name: item.user_name || 'Customer',
    user_email: item.user_email || undefined,
    rating: Number(item.rating) || 5,
    title: item.title || '',
    comment: item.comment || '',
    images,
    verified_purchase: item.verified_purchase !== false,
    recommend: item.recommend !== false,
    helpful_count: Number(item.helpful_count) || 0,
    created_at: item.created_at || new Date().toISOString(),
    status: item.status || 'approved',
  };
}

/**
 * Get all reviews for a specific product
 */
export async function getProductReviews(
  productId: string,
  productSlug?: string,
  productName?: string
): Promise<ProductReview[]> {
  const pId = productId || '';
  const pSlug = productSlug || '';
  const deletedIds = getDeletedReviewIds();

  // 1. Try querying Supabase
  try {
    const filters: string[] = [];
    if (pId) filters.push(`product_id.eq.${pId}`);
    if (pSlug && pSlug !== pId) filters.push(`product_id.eq.${pSlug}`);

    if (filters.length > 0) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .or(filters.join(','))
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data
          .map(normalizeReviewRecord)
          .filter((r) => !deletedIds.has(r.id));
      }
    }
  } catch {
    // Supabase query error - fallback below
  }

  // 2. Try localStorage cache for this product
  if (typeof window !== 'undefined') {
    try {
      const storedKey = `${LOCAL_STORAGE_REVIEWS_PREFIX}${pId || pSlug}`;
      const raw = localStorage.getItem(storedKey);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed
            .map(normalizeReviewRecord)
            .filter((r) => !deletedIds.has(r.id));
        }
      }
    } catch {
      // localStorage error - fallback below
    }
  }

  // 3. Fallback to predefined seed reviews or dynamically generated authentic reviews
  const defaultList =
    DEFAULT_PRODUCT_REVIEWS[pId] ||
    (pSlug ? DEFAULT_PRODUCT_REVIEWS[pSlug] : null) ||
    generateSeedReviewsForProduct(pId || pSlug || 'prod', productName || 'Product');

  const filteredDefaultList = defaultList.filter((r) => !deletedIds.has(r.id));

  // Cache defaults in localStorage so user interactions persist
  if (typeof window !== 'undefined' && filteredDefaultList && filteredDefaultList.length > 0) {
    try {
      const storedKey = `${LOCAL_STORAGE_REVIEWS_PREFIX}${pId || pSlug}`;
      localStorage.setItem(storedKey, JSON.stringify(filteredDefaultList));
    } catch {
      // ignore
    }
  }

  return filteredDefaultList;
}

/**
 * Submits a new review for a product by any normal customer/visitor
 */
export async function createProductReview(
  input: CreateReviewInput
): Promise<{ success: boolean; data?: ProductReview; error?: string }> {
  try {
    const rating = Math.max(1, Math.min(5, Math.round(Number(input.rating) || 5)));
    const cleanName = input.user_name?.trim() || 'Verified Customer';
    const cleanTitle = input.title?.trim() || '';
    const cleanComment = input.comment?.trim() || '';
    const cleanImages = (input.images || []).filter((img) => typeof img === 'string' && img.length > 0);

    if (!cleanComment) {
      return { success: false, error: 'Please write a review comment.' };
    }

    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newReview: ProductReview = {
      id: reviewId,
      product_id: input.product_id,
      user_name: cleanName,
      user_email: input.user_email?.trim() || undefined,
      rating,
      title: cleanTitle,
      comment: cleanComment,
      images: cleanImages,
      verified_purchase: input.verified_purchase !== undefined ? input.verified_purchase : true,
      recommend: input.recommend !== undefined ? input.recommend : true,
      helpful_count: 0,
      created_at: nowIso,
      status: 'approved',
    };

    // 1. Save to Supabase if available
    try {
      const payload: any = {
        product_id: newReview.product_id,
        user_name: newReview.user_name,
        user_email: newReview.user_email || null,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        images: newReview.images,
        verified_purchase: newReview.verified_purchase,
        recommend: newReview.recommend,
        helpful_count: 0,
        status: 'approved',
      };
      await supabase.from('reviews').insert([payload]);
    } catch (dbErr) {
      console.warn('Supabase review insert warning (local fallback used):', dbErr);
    }

    // 2. Save to localStorage cache
    if (typeof window !== 'undefined') {
      try {
        // Product specific key
        const keys = [
          `${LOCAL_STORAGE_REVIEWS_PREFIX}${input.product_id}`,
          ...(input.product_slug ? [`${LOCAL_STORAGE_REVIEWS_PREFIX}${input.product_slug}`] : []),
        ];

        let currentReviews: ProductReview[] = [];
        const existingRaw = localStorage.getItem(keys[0]);
        if (existingRaw) {
          try {
            currentReviews = JSON.parse(existingRaw);
          } catch {
            currentReviews = [];
          }
        }
        if (currentReviews.length === 0) {
          currentReviews =
            DEFAULT_PRODUCT_REVIEWS[input.product_id] ||
            (input.product_slug ? DEFAULT_PRODUCT_REVIEWS[input.product_slug] : null) ||
            generateSeedReviewsForProduct(input.product_id, input.product_name || 'Product');
        }

        const updatedReviews = [newReview, ...currentReviews];
        keys.forEach((k) => localStorage.setItem(k, JSON.stringify(updatedReviews)));

        // Update Master list for Admin view
        const masterRaw = localStorage.getItem(LOCAL_STORAGE_ALL_REVIEWS_KEY);
        let masterList: ProductReview[] = [];
        if (masterRaw) {
          try {
            masterList = JSON.parse(masterRaw);
          } catch {
            masterList = [];
          }
        }
        masterList.unshift(newReview);
        localStorage.setItem(LOCAL_STORAGE_ALL_REVIEWS_KEY, JSON.stringify(masterList));

        // 3. Compute new average rating and review count
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvg = Number((totalRating / updatedReviews.length).toFixed(1));
        const newCount = updatedReviews.length;

        // Update product metadata in DB / cache
        try {
          await updateProduct(input.product_id, {
            rating: newAvg,
            reviewCount: newCount,
          } as any);
        } catch {
          // ignore
        }
      } catch (storageErr) {
        console.error('Failed to save review in localStorage:', storageErr);
      }
    }

    broadcastDataChange('reviews');
    broadcastDataChange('products');

    return { success: true, data: newReview };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to submit review' };
  }
}

/**
 * Vote a review as helpful
 */
export async function voteReviewHelpful(
  reviewId: string,
  productId?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  if (typeof window === 'undefined') return { success: false, count: 0 };

  const votedKey = `koskool_voted_rev_${reviewId}`;
  if (localStorage.getItem(votedKey)) {
    return { success: false, count: 0, error: 'You have already voted this review as helpful' };
  }

  let newCount = 1;

  // 1. Try Supabase rpc / update
  try {
    const { data } = await supabase
      .from('reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single();
    if (data) {
      newCount = (Number(data.helpful_count) || 0) + 1;
      await supabase
        .from('reviews')
        .update({ helpful_count: newCount })
        .eq('id', reviewId);
    }
  } catch {
    // fallback
  }

  // 2. Update localStorage
  if (productId) {
    const pKey = `${LOCAL_STORAGE_REVIEWS_PREFIX}${productId}`;
    const raw = localStorage.getItem(pKey);
    if (raw) {
      try {
        const list: ProductReview[] = JSON.parse(raw);
        const item = list.find((r) => r.id === reviewId);
        if (item) {
          item.helpful_count = (item.helpful_count || 0) + 1;
          newCount = item.helpful_count;
          localStorage.setItem(pKey, JSON.stringify(list));
        }
      } catch {
        // ignore
      }
    }
  }

  localStorage.setItem(votedKey, 'true');
  broadcastDataChange('reviews');
  return { success: true, count: newCount };
}

/**
 * Get all reviews across all products (for Admin)
 */
export async function getAllReviews(): Promise<ProductReview[]> {
  const deletedIds = getDeletedReviewIds();

  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data
        .map(normalizeReviewRecord)
        .filter((r) => !deletedIds.has(r.id));
    }
  } catch {
    // ignore
  }

  // 2. Gather from master localStorage + default reviews
  const allMap = new Map<string, ProductReview>();

  // Add default reviews
  Object.values(DEFAULT_PRODUCT_REVIEWS).forEach((list) => {
    list.forEach((r) => {
      if (!deletedIds.has(r.id)) {
        allMap.set(r.id, r);
      }
    });
  });

  if (typeof window !== 'undefined') {
    try {
      const masterRaw = localStorage.getItem(LOCAL_STORAGE_ALL_REVIEWS_KEY);
      if (masterRaw) {
        const masterList: ProductReview[] = JSON.parse(masterRaw);
        masterList.forEach((r) => {
          if (!deletedIds.has(r.id)) {
            allMap.set(r.id, r);
          }
        });
      }

      // Check all keys with prefix
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LOCAL_STORAGE_REVIEWS_PREFIX)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list: ProductReview[] = JSON.parse(raw);
            if (Array.isArray(list)) {
              list.forEach((r) => {
                if (!deletedIds.has(r.id)) {
                  allMap.set(r.id, r);
                }
              });
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  const results = Array.from(allMap.values()).filter((r) => !deletedIds.has(r.id));
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return results;
}

/**
 * Delete a review (for Admin)
 */
export async function deleteReview(reviewId: string): Promise<{ success: boolean }> {
  recordDeletedReviewId(reviewId);

  try {
    await supabase.from('reviews').delete().eq('id', reviewId);
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined') {
    try {
      // Remove from master
      const masterRaw = localStorage.getItem(LOCAL_STORAGE_ALL_REVIEWS_KEY);
      if (masterRaw) {
        const masterList: ProductReview[] = JSON.parse(masterRaw);
        const filtered = masterList.filter((r) => r.id !== reviewId);
        localStorage.setItem(LOCAL_STORAGE_ALL_REVIEWS_KEY, JSON.stringify(filtered));
      }

      // Remove from product keys
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LOCAL_STORAGE_REVIEWS_PREFIX)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list: ProductReview[] = JSON.parse(raw);
            if (Array.isArray(list)) {
              const filtered = list.filter((r) => r.id !== reviewId);
              localStorage.setItem(k, JSON.stringify(filtered));
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  broadcastDataChange('reviews');
  return { success: true };
}

