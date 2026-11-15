/**
 * smartLoader.ts
 * ─────────────────────────────────────────────────────────────
 * Intelligent lazy-loading / unloading system for walkaroo.in
 *
 * Strategy:
 *  • Tracks the current "context" (page type + visible section) so that
 *    only the data the user is likely to need RIGHT NOW is kept in memory.
 *  • When the user leaves a page (visibility hidden or route change) a
 *    cleanup timer fires and clears everything that is off-screen.
 *  • When the user returns the data is re-fetched on demand from the
 *    existing Supabase cache layer (3-min TTL already in api.ts).
 *
 * Gender-aware unloading:
 *  boys  page → keep boys,  unload girls / kids / accessories
 *  girls page → keep girls, unload boys  / kids
 *  kids  page → keep kids,  unload boys  / girls
 *  home        → keep only preview (first image) products
 */

export type PageContext =
  | 'home'
  | 'boys'
  | 'girls'
  | 'kids'
  | 'bags'
  | 'accessories'
  | 'product'
  | 'cart'
  | 'other';

// ── in-memory module-level store ─────────────────────────────
let currentContext: PageContext = 'home';
let cleanupTimer: ReturnType<typeof setTimeout> | null = null;
const CLEANUP_DELAY_MS = 90_000; // 90 s after user leaves

// Which caches belong to which context
const CONTEXT_CACHE_KEYS: Record<PageContext, string[]> = {
  home: ['preview_all_all_8', 'preview_popular_all_8', 'preview_newArrival_all_8'],
  boys: ['preview_all_boys_12', 'koskool_products_cache'],
  girls: ['preview_all_girls_12', 'koskool_products_cache'],
  kids: ['preview_all_kids_12', 'koskool_products_cache'],
  bags: ['preview_all_bags_8'],
  accessories: ['preview_all_accessories_8'],
  product: ['koskool_products_cache'],
  cart: [],
  other: [],
};

// Keys that should NEVER be evicted (user data, settings)
const PROTECTED_KEYS = new Set([
  'koskool_cart',
  'koskool_homepage_sections_cache_v3',
  'koskool_hero_slides_cache',
  'koskool_categories_cache',
  'koskool_footwear_categories_cache',
  'koskool_school_levels_cache',
  'koskool_featured_product_cache',
  'koskool_promos_cache',
]);

// ── helpers ───────────────────────────────────────────────────

function safeRemove(key: string) {
  if (PROTECTED_KEYS.has(key)) return;
  try {
    if (typeof window !== 'undefined') localStorage.removeItem(key);
  } catch {}
}

/**
 * Returns all localStorage keys that match a prefix filter
 */
function lsKeysMatching(prefix: string): string[] {
  if (typeof window === 'undefined') return [];
  const result: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) result.push(k);
    }
  } catch {}
  return result;
}

/**
 * Evict cache entries that are NOT needed for the given context.
 * Runs after CLEANUP_DELAY_MS when the user navigates away.
 */
export function evictOffContextCaches(keepContext: PageContext) {
  if (typeof window === 'undefined') return;

  const keepKeys = new Set<string>(CONTEXT_CACHE_KEYS[keepContext] ?? []);

  // Also keep protected keys always
  PROTECTED_KEYS.forEach((k) => keepKeys.add(k));

  // Enumerate and evict anything that is a preview_ cache not in keep set
  const previewKeys = lsKeysMatching('preview_');
  previewKeys.forEach((k) => {
    if (!keepKeys.has(k)) safeRemove(k);
  });

  // Evict the full products cache when user is on home (we don't need it)
  if (keepContext === 'home') {
    safeRemove('koskool_products_cache');
    safeRemove('koskool_orders_cache');
  }

  // On product/cart pages we don't need the homepage hero refresh cache
  if (keepContext === 'cart' || keepContext === 'product') {
    safeRemove('koskool_banner_showcase_cache');
  }
}

/**
 * Derive page context from a Next.js pathname.
 */
export function deriveContext(pathname: string): PageContext {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/products/')) return 'product';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.includes('/boys')) return 'boys';
  if (pathname.includes('/girls')) return 'girls';
  if (pathname.includes('/kids')) return 'kids';
  if (pathname.includes('/bags')) return 'bags';
  if (pathname.includes('/accessories')) return 'accessories';
  return 'other';
}

/**
 * Call this whenever the route changes.
 * Schedules cleanup of the OLD context, and primes the new one.
 */
export function onRouteChange(newPathname: string) {
  const newCtx = deriveContext(newPathname);

  // If same context, nothing to do
  if (newCtx === currentContext) return;

  // Cancel any in-flight cleanup for the previous context
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }

  const oldCtx = currentContext;
  currentContext = newCtx;

  // Delay eviction so back-navigation feels instant
  cleanupTimer = setTimeout(() => {
    evictOffContextCaches(newCtx);
    cleanupTimer = null;
  }, CLEANUP_DELAY_MS);
}

/**
 * Call when the tab becomes hidden (user switches tab / locks phone).
 * Immediately schedules cleanup of everything except protected keys.
 */
export function onVisibilityHidden() {
  if (cleanupTimer) clearTimeout(cleanupTimer);
  // Use a shorter delay when hidden
  cleanupTimer = setTimeout(() => {
    evictOffContextCaches(currentContext);
    cleanupTimer = null;
  }, 30_000); // 30 s when hidden
}

/**
 * Call when the tab becomes visible again (user returns).
 * Cancels any pending cleanup.
 */
export function onVisibilityVisible() {
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }
}

export function getCurrentContext(): PageContext {
  return currentContext;
}
