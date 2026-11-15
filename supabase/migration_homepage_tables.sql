-- ============================================================
-- MIGRATION: Homepage Admin Panel Tables
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- This creates the tables needed to persist homepage layout
-- changes across all devices (laptop, phone, etc.)
-- ============================================================

-- -------------------------------------------------------
-- TABLE 1: homepage_sections
-- Stores the order and visibility of homepage sections
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    section_id  VARCHAR(100) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    badge       VARCHAR(100),
    display_order INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: publicly readable, anyone can write (admin panel is client-side)
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read homepage_sections" ON public.homepage_sections;
CREATE POLICY "Public read homepage_sections" ON public.homepage_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write homepage_sections" ON public.homepage_sections;
CREATE POLICY "Public write homepage_sections" ON public.homepage_sections FOR ALL USING (true) WITH CHECK (true);

-- Seed default section order
INSERT INTO public.homepage_sections (section_id, name, description, badge, display_order, is_active)
VALUES
  ('hero',                'Hero Banner Slideshow',         'Primary carousel with official 2026 uniform slides & action CTA buttons', 'Hero Top',         1,  true),
  ('shop_footwear',       'Shop By Footwear Carousel',     'Interactive carousel of footwear categories with starting prices',         'Category Showcase',2,  true),
  ('school_level',        'Shop By School Level',          'Kindergarten, Middle Wing, and Senior Wing segmented cards',               'Grade Levels',     3,  true),
  ('explore_accessories', 'Student Accessories Showcase',  'Boys, Girls, and Kids accessories cards & school essentials',             'Accessories',      4,  true),
  ('popular_bags',        'Popular School Bags',           'Heavy-duty & ergonomic spinal support backpack carousel',                 'Backpacks',        5,  true),
  ('popular_picks',       'Popular School Picks',          'Interactive tabs (All, Boys, Girls, Bags) with product cards',            'Trending',         6,  true),
  ('featured_spotlight',  'Trending Spotlight Product',    'Full sticky product detail view with multi-image gallery & sizing',       'Spotlight',        7,  true),
  ('banner_showcase',     'Collection Banners & Grid',     'Walkaroo Bounceez & Bloomsy featured collection cards',                  'Banners',          8,  true),
  ('trust_reviews',       'School Trust & Reviews',        'Parent testimonials, verified school partner badges & metrics',           'Social Proof',     9,  true),
  ('marquee',             'Announcement Ticker',           'Running school trust ticker & seasonal notices',                          'Ticker',           10, true)
ON CONFLICT (section_id) DO NOTHING;

-- -------------------------------------------------------
-- TABLE 2: footwear_categories
-- Stores the footwear carousel categories with pricing
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.footwear_categories (
    category_id    VARCHAR(100) PRIMARY KEY,
    title          VARCHAR(255) NOT NULL,
    subtitle       TEXT,
    image          TEXT,
    tag            VARCHAR(100),
    href           VARCHAR(255),
    features       TEXT[] DEFAULT '{}',
    starting_price VARCHAR(50) DEFAULT '₹499',
    display_order  INT DEFAULT 0,
    is_active      BOOLEAN DEFAULT true,
    show_on_homepage BOOLEAN DEFAULT true,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.footwear_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read footwear_categories" ON public.footwear_categories;
CREATE POLICY "Public read footwear_categories" ON public.footwear_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write footwear_categories" ON public.footwear_categories;
CREATE POLICY "Public write footwear_categories" ON public.footwear_categories FOR ALL USING (true) WITH CHECK (true);

-- Seed default footwear categories
INSERT INTO public.footwear_categories
  (category_id, title, subtitle, image, tag, href, features, starting_price, display_order, is_active, show_on_homepage)
VALUES
  ('school-shoes',      'School Shoes',               'Uniform-ready black & white formal shoes engineered with scuff-resistant leather and anti-skid grip.',              '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg', 'Morning Assembly Ready',    '/collections/school-shoes',   '{Velcro & Lace-Up,Cushioned Insoles,Scuff Resistant}',         '₹499', 1, true, true),
  ('sports-shoes',      'PT & Sports Shoes',          'All-white PT & athletic sneakers designed for playground speed, drill days, and physical training.',                '/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg',             'PT & Games Approved',       '/collections/sports-shoes',   '{Honeycomb Air-Mesh,Non-Marking Soles,EVA Cushioning}',         '₹549', 2, true, true),
  ('fabric-shoes',      'Fabric & Canvas Shoes',      'Pure cotton vulcanized canvas shoes built for drill exercises, march pasts, and summer breathability.',             '/cdn/shop/files/WE1356-Black_3dd08639-1ba0-4c08-86fb-b5ddf6184a12.v_1781172079_width_1600.jpg',                   'Drill & Summer Comfort',    '/collections/fabric-shoes',   '{Washable Canvas,Flexible Gum Sole,Cool Airflow}',              '₹399', 3, true, true),
  ('girls-ballerinas',  'Girls Uniform Ballerinas',   'Classic Mary Jane slip-ons with secure buckle/velcro straps and memory foam footbed for all-day comfort.',          '/cdn/shop/files/WE2362-Black-Ladies_37f3a155-dc4d-48d2-97a2-c5d95c6c7d49.v_1786512084_width_1600.jpg',            'Girls Uniform Approved',    '/collections/girls',          '{Buckle & Velcro,Memory Foam Footbed,Comfortable Fit}',         '₹449', 4, true, true),
  ('bags',              'School Backpacks',           'Ergonomic dual-compartment school bags with spinal support system built for heavy textbooks.',                      '/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg',                   'Spine Support Design',      '/collections/bags',           '{Spinal Support,Dual Compartment,Water Resistant}',             '₹649', 5, true, true)
ON CONFLICT (category_id) DO NOTHING;

-- -------------------------------------------------------
-- TABLE 3: school_levels
-- Stores the school level cards with pricing
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.school_levels (
    level_id      VARCHAR(100) PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    subtitle      VARCHAR(255),
    badge         VARCHAR(100),
    description   TEXT,
    color         VARCHAR(255),
    href          VARCHAR(255),
    starting_price VARCHAR(50) DEFAULT '₹399',
    points        TEXT[] DEFAULT '{}',
    display_order INT DEFAULT 0,
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.school_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read school_levels" ON public.school_levels;
CREATE POLICY "Public read school_levels" ON public.school_levels FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write school_levels" ON public.school_levels;
CREATE POLICY "Public write school_levels" ON public.school_levels FOR ALL USING (true) WITH CHECK (true);

-- Seed default school levels
INSERT INTO public.school_levels
  (level_id, title, subtitle, badge, description, color, href, starting_price, points, display_order, is_active)
VALUES
  ('kindergarten', 'Kindergarten', 'Nursery to Prep (Ages 3-6)',   'Early Steps',      'Ultra-cushioned shoes with self-fastening velcro straps, featherlight school bags, and spill-proof sipper bottles.',                                   'from-amber-500 to-orange-600',   '/collections/kindergarten', '₹399', '{Easy-Strap Velcro,Lightweight Under 250g,Drop-Proof Bottles}',              1, true),
  ('middle-wing',  'Middle Wing',  'Classes 1 to 8 (Ages 6-13)',  'Core School Years', 'Heavy-duty footwear built to withstand playground games, rigorous daily wear, sports periods, and heavy books.',                                          'from-blue-600 to-navy-900',      '/collections/middle-wing',  '₹499', '{Anti-Skid Traction,Multi-Pocket Backpacks,Math Geometry Kits}',             2, true),
  ('senior-wing',  'Senior Wing',  'Classes 9 to 12 (Ages 14-18)', 'Senior & Boards',  'Sophisticated formal oxfords, ballerinas, high-rebound sports trainers, and 35L laptop & textbook backpacks.',                                           'from-emerald-600 to-teal-900',   '/collections/senior-wing',  '₹599', '{Assembly Polished Finish,Spine-Relief Back Padding,Athletic Court Traction}', 3, true)
ON CONFLICT (level_id) DO NOTHING;

-- -------------------------------------------------------
-- TABLE 4: app_settings (key-value store for misc config)
-- Used for spotlight product, and future settings
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    key        VARCHAR(100) PRIMARY KEY,
    value      JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings" ON public.app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write app_settings" ON public.app_settings;
CREATE POLICY "Public write app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- Seed default spotlight config
INSERT INTO public.app_settings (key, value)
VALUES (
  'featured_spotlight',
  '{"productSlug": "mens-daily-wear-sandals-wgp53410-tan", "badge": "Trending Product Spotlight", "subtitle": "Scroll images on left • Sticky order details on right"}'
)
ON CONFLICT (key) DO NOTHING;
