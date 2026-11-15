-- ========================================================
-- KOSKOOL E-COMMERCE & ADMIN PANEL - SUPABASE SQL SCHEMA
-- Execute this file in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Paste & Run
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE (Syncs with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    auth_user_id UUID,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'staff')),
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. CUSTOMER ADDRESSES TABLE (Separate Shipping & Billing Addresses)
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing', 'both')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    house_flat VARCHAR(255),
    street_area TEXT NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    formatted_address TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON public.customer_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default ON public.customer_addresses(user_id, is_default);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(100) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) DEFAULT 'KOSKOOL',
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    discount_percent INT,
    gender VARCHAR(20) CHECK (gender IN ('boys', 'girls', 'kids', 'unisex')),
    school_level TEXT[] DEFAULT '{}',
    product_type VARCHAR(50) NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    accessory_category VARCHAR(50),
    bag_category VARCHAR(50),
    sizes TEXT[] DEFAULT '{}',
    colours TEXT[] DEFAULT '{}',
    primary_colour VARCHAR(50),
    capacity VARCHAR(100),
    images TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 1) DEFAULT 4.8,
    review_count INT DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    features TEXT[] DEFAULT '{}',
    description TEXT,
    additional_info TEXT,
    shipping_info TEXT,
    color_variants JSONB DEFAULT '[]'::jsonb,
    category_options TEXT[] DEFAULT '{}',
    material TEXT,
    closure_type VARCHAR(100),
    in_stock BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PROMOTIONAL BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.promotional_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    badge VARCHAR(100),
    image_url TEXT NOT NULL,
    primary_cta_text VARCHAR(100),
    primary_cta_link VARCHAR(255),
    secondary_cta_text VARCHAR(100),
    secondary_cta_link VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROMO CODES / COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL, -- e.g. 10, 20, 50 (%) or 10, 20, 100 (₹)
    min_order_amount NUMERIC(10, 2) DEFAULT 0,
    max_discount_amount NUMERIC(10, 2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS TABLE (Immutable Address Snapshots & Geo Coordinates)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    promo_code VARCHAR(50),
    shipping_cost NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cod',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    status VARCHAR(50) DEFAULT 'Order Placed',
    tracking_id VARCHAR(100),
    courier_name VARCHAR(100),
    tracking_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upgrade existing orders columns if needed
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_address JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'Pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(100);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 8. ORDER ITEMS TABLE (Relational Product Details)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    selected_size VARCHAR(50),
    selected_colour VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 9. ORDER TRACKING UPDATES TABLE (Manual Shipment Timeline History)
CREATE TABLE IF NOT EXISTS public.order_tracking_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    courier_name VARCHAR(100),
    tracking_id VARCHAR(100),
    notes TEXT,
    update_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON public.order_tracking_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_created_at ON public.order_tracking_updates(created_at);

-- 10. CUSTOMER INQUIRIES & QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    inquiry_type VARCHAR(50) DEFAULT 'General',
    subject VARCHAR(255),
    message TEXT NOT NULL,
    quotation_details JSONB,
    is_read BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PRODUCT REVIEWS TABLE (Customer feedback with star ratings and photos)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    verified_purchase BOOLEAN DEFAULT false,
    recommend BOOLEAN DEFAULT true,
    helpful_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- 12. AUTOMATIC USER PROFILE SYNC TRIGGER (auth.users -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, email, name, phone, role)
  VALUES (
    new.id,
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    CASE WHEN new.email = 'admin@gmail.com' THEN 'admin' ELSE 'customer' END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('promotions', 'promotions', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
DROP POLICY IF EXISTS "Public can view product-images" ON storage.objects;
CREATE POLICY "Public can view product-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public can view promotions" ON storage.objects;
CREATE POLICY "Public can view promotions" ON storage.objects
    FOR SELECT USING (bucket_id = 'promotions');

DROP POLICY IF EXISTS "Public can upload to product-images" ON storage.objects;
CREATE POLICY "Public can upload to product-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public can upload to promotions" ON storage.objects;
CREATE POLICY "Public can upload to promotions" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'promotions');

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'admin@gmail.com');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id OR id IS NOT NULL);

DROP POLICY IF EXISTS "Admin can do all on profiles" ON public.profiles;
CREATE POLICY "Admin can do all on profiles" ON public.profiles
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- Customer Addresses Policies
DROP POLICY IF EXISTS "Users can view own addresses" ON public.customer_addresses;
CREATE POLICY "Users can view own addresses" ON public.customer_addresses
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'admin@gmail.com');

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.customer_addresses;
CREATE POLICY "Users can insert own addresses" ON public.customer_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.customer_addresses;
CREATE POLICY "Users can update own addresses" ON public.customer_addresses
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.customer_addresses;
CREATE POLICY "Users can delete own addresses" ON public.customer_addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Orders Policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'admin@gmail.com');

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Admin can manage all orders" ON public.orders;
CREATE POLICY "Admin can manage all orders" ON public.orders
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- Order Items Policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@gmail.com')
        )
    );

DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
CREATE POLICY "Users can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id
        )
    );

-- Order Tracking Updates Policies
DROP POLICY IF EXISTS "Users can view own order tracking" ON public.order_tracking_updates;
CREATE POLICY "Users can view own order tracking" ON public.order_tracking_updates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_tracking_updates.order_id 
            AND (orders.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@gmail.com')
        )
    );

DROP POLICY IF EXISTS "Admin can manage tracking updates" ON public.order_tracking_updates;
CREATE POLICY "Admin can manage tracking updates" ON public.order_tracking_updates
    FOR ALL USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- Public Catalog Policies (Read-Only)
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read banners" ON public.promotional_banners;
CREATE POLICY "Public read banners" ON public.promotional_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read promo codes" ON public.promo_codes;
CREATE POLICY "Public read promo codes" ON public.promo_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read inquiries" ON public.inquiries;
CREATE POLICY "Public read inquiries" ON public.inquiries FOR ALL USING (true);

-- Product Reviews Policies
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Public can submit reviews" ON public.reviews;
CREATE POLICY "Public can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update reviews" ON public.reviews;
CREATE POLICY "Public can update reviews" ON public.reviews FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can do all on reviews" ON public.reviews;
CREATE POLICY "Admin can do all on reviews" ON public.reviews FOR ALL USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- 10. INITIAL SEED PROMO CODES
INSERT INTO public.promo_codes (code, description, discount_type, discount_value, min_order_amount, is_active)
VALUES
    ('KOSKOOL10', '10% School Uniform Discount', 'percentage', 10, 499, true),
    ('KOSKOOL20', '20% Back to School Special', 'percentage', 20, 999, true),
    ('KOSKOOL50', '50% Mega Clearance Sale', 'percentage', 50, 1999, true),
    ('SAVE10', '₹10 Instant School Savings', 'fixed', 10, 199, true),
    ('FIRSTSTEP', '₹100 Flat Off on First Order', 'fixed', 100, 599, true),
    ('SUPER200', '₹200 Flat Off on Orders above ₹1500', 'fixed', 200, 1500, true)
ON CONFLICT (code) DO NOTHING;

-- INITIAL SEED CATEGORIES
INSERT INTO public.categories (slug, name, description, display_order)
VALUES
    ('school-shoes', 'School Uniform Shoes', 'Official uniform-compliant black and white school shoes', 1),
    ('sports-shoes', 'PT & Sports Shoes', 'Non-marking sports sneakers and PT running shoes', 2),
    ('fabric-shoes', 'Fabric & Canvas Shoes', 'Lightweight breathable canvas footwear for daily drills', 3),
    ('bags', 'School Backpacks', 'Ergonomic dual-compartment heavy duty bags', 4),
    ('accessories', 'Student Accessories', 'Water bottles, pencil boxes, socks, and essentials', 5)
ON CONFLICT (slug) DO NOTHING;

-- 11. SEED 30 KOSKOOL PRODUCTS
INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-b-sch-01',
  'koskool-boys-velcro-primary-school-shoes-black',
  'KOSKOOL Boys Easy-Strap Velcro School Shoes - Black',
  'KOSKOOL',
  499,
  699,
  28,
  'boys',
  '{"kindergarten","middle-wing"}'::TEXT[],
  'school-shoes',
  NULL,
  NULL,
  '{"9C","10C","11C","12C","13C","1","2","3"}'::TEXT[],
  '{"Black"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg","/cdn/shop/files/wv502-black-kids_2_1_1_cfc2bfd3-3fbc-4a7e-b6ec-b0fb79d563ee-xllili.v_1786513107_width_1200.jpg","/cdn/shop/files/wv502-black-kids_3_1_1_b78da248-35cc-4ce4-93f8-d30088c45e81-gyn8mu.v_1786513107_width_1200.jpg"}'::TEXT[],
  4.8,
  320,
  true,
  false,
  '{"High-Traction Anti-Skid Sole","Cushioned Padded Collar","Breathable Lining","Reinforced Scuff-Resistant Toe Guard"}'::TEXT[],
  'Specially engineered for active kindergarten and junior boys. Features effortless dual-strap velcro for quick wear, impact-absorbing insoles, and water-resistant synthetic upper.',
  'High-Density Water-Resistant PU Upper + TPR Anti-Slip Outsole',
  1
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-b-sch-02',
  'koskool-boys-derby-lace-up-senior-school-shoes-black',
  'KOSKOOL Boys Classic Derby Lace-Up School Shoes - Deep Black',
  'KOSKOOL',
  649,
  899,
  27,
  'boys',
  '{"middle-wing","senior-wing"}'::TEXT[],
  'school-shoes',
  NULL,
  NULL,
  '{"3","4","5","6","7","8","9","10"}'::TEXT[],
  '{"Black"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/WGE53354-BLACK-GENTS_4d4814a1-64d8-45b9-a7b8-722cf22d3c8e.v_1786511261_width_1600.jpg","/cdn/shop/files/W1030-BLACK-GENTS_37127caa-12a4-4e9c-914b-f06d017577a5.v_1786513424_width_1600.jpg"}'::TEXT[],
  4.9,
  412,
  true,
  false,
  '{"Standard School Uniform Compliant","Memory Foam Heel Pad","Flexible Lightweight Sole","Breathable Anti-Sweat Lining"}'::TEXT[],
  'The definitive formal school shoe for middle and senior wing boys. Designed for mandatory assembly inspections and all-day classroom comfort.',
  'Premium Synthetic Leather with High-Grip Rubber Sole',
  2
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-b-sch-03',
  'koskool-boys-slip-on-kindergarten-junior-school-shoes',
  'KOSKOOL Boys Junior Elastic Gusset Slip-On School Shoes',
  'KOSKOOL',
  449,
  599,
  25,
  'boys',
  '{"kindergarten"}'::TEXT[],
  'school-shoes',
  NULL,
  NULL,
  '{"9C","10C","11C","12C","13C","1","2"}'::TEXT[],
  '{"Black"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/wv502-black-kids_4_1_1_28dd9409-7b94-4c81-b85b-01d9daa1bd06-18er2km.v_1786513107_width_1200.jpg","/cdn/shop/files/wv502-black-kids_5_1_1_9bcd70d3-22e9-4b4b-b284-4ab342eee4d2-1parwzm.v_1786513107_width_1200.jpg"}'::TEXT[],
  4.7,
  185,
  false,
  false,
  '{"Ultra-Flexible Sole for Toddlers","Zero-Hassle Elastic Sides","Scuff Resistant","Featherweight Design"}'::TEXT[],
  'Perfect for nursery and kindergarten boys learning self-sufficiency. Flexible construction supports natural foot arch development.',
  'Durable Faux Leather + Soft PU Cushion Sole',
  3
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-b-sch-04',
  'koskool-boys-formal-oxford-senior-wing-black',
  'KOSKOOL Boys Senior Wing High-Gloss Oxford Shoes',
  'KOSKOOL',
  799,
  1099,
  27,
  'boys',
  '{"senior-wing"}'::TEXT[],
  'school-shoes',
  NULL,
  NULL,
  '{"6","7","8","9","10","11"}'::TEXT[],
  '{"Black"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg","/cdn/shop/files/WGP58090-BLACK-GENTS_b5b4c509-016f-4659-b460-d6d86ffac5b8.v_1787997065_width_1600.jpg"}'::TEXT[],
  4.9,
  248,
  true,
  false,
  '{"Polished Finish for Assemblies","Arch Support Arch-Fit System","Heavy-Duty Shock Absorption","Abrasion-Resistant Rubber Outsole"}'::TEXT[],
  'Engineered specifically for Senior Wing students (classes 9 to 12) demanding exceptional polish retention, structural support, and long walking endurance.',
  'High-Grade Synthetic Patent Leather',
  4
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-b-spt-01',
  'koskool-boys-speed-track-all-white-pt-shoes',
  'KOSKOOL Boys SpeedTrack PT & Sports Shoes - Pure White',
  'KOSKOOL',
  549,
  799,
  31,
  'boys',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'sports-shoes',
  NULL,
  NULL,
  '{"10C","11C","12C","13C","1","2","3","4","5","6","7","8","9"}'::TEXT[],
  '{"White"}'::TEXT[],
  'White',
  NULL,
  '{"/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg","/cdn/shop/files/SGE24001-whitegrey_8d131c0b-ba2c-4914-9b46-5378bf6091c3.v_1786512160_width_416.jpg"}'::TEXT[],
  4.8,
  510,
  true,
  false,
  '{"Mandatory Uniform Approved All-White","High-Airflow Honeycomb Mesh","Non-Marking Court Rubber Outsole","EVA Cushion Midsole"}'::TEXT[],
  'The quintessential white sports shoe approved by top CBSE and ICSE schools for sports days, PT sessions, running, and athletic activities.',
  'Breathable Sports Mesh + Lightweight EVA Shock-Absorb Midsole',
  5
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-b-spt-02',
  'koskool-boys-junior-sprint-velcro-white-sports-shoes',
  'KOSKOOL Boys Junior Sprint Strap Sports Shoes - White & Blue',
  'KOSKOOL',
  499,
  699,
  28,
  'boys',
  '{"kindergarten","middle-wing"}'::TEXT[],
  'sports-shoes',
  NULL,
  NULL,
  '{"9C","10C","11C","12C","13C","1","2"}'::TEXT[],
  '{"White","Navy Blue"}'::TEXT[],
  'White',
  NULL,
  '{"/cdn/shop/files/WY3466-Blue-White_1606e288-e9a8-4a20-9203-90a9ca24920b.v_1786512467_width_416.jpg","/cdn/shop/files/WY3344-White-blue_cce8c41e-7c58-45c5-b7a9-d0531217be94.v_1786512863_width_416.jpg"}'::TEXT[],
  4.7,
  160,
  false,
  false,
  '{"Dual Fast-Strap Velcro","Bouncy EVA Midsole","Mud and Stain Resistant Upper","Grippy Tread Pattern"}'::TEXT[],
  'Built for spirited playground playtime and gym class. Easy-on hook and loop straps allow little boys to gear up independently.',
  'Synthetic Leather + Breathable Mesh Panels',
  6
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-b-spt-03',
  'koskool-boys-senior-aeroflight-white-sports-trainer',
  'KOSKOOL Boys AeroFlight Senior PT Trainer - Solid White',
  'KOSKOOL',
  699,
  999,
  30,
  'boys',
  '{"senior-wing"}'::TEXT[],
  'sports-shoes',
  NULL,
  NULL,
  '{"6","7","8","9","10","11"}'::TEXT[],
  '{"White"}'::TEXT[],
  'White',
  NULL,
  '{"/cdn/shop/files/SGE24001-White-tan_f13bbfa4-938d-45d7-89f9-cf9748dde12a.v_1786511603_width_1600.jpg","/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg"}'::TEXT[],
  4.9,
  380,
  true,
  false,
  '{"High-Performance Torsion Control","Dual-Density Cushioning","Reinforced Heel Counter","Anti-Odor Insole"}'::TEXT[],
  'Engineered for senior school athletics, track events, football turf practice, and strict uniform code PT periods.',
  'Aerated Knit Mesh + Durable Rubber Outsole',
  7
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-b-fab-01',
  'koskool-boys-heavy-duty-canvas-black-fabric-shoes',
  'KOSKOOL Boys Heavy-Duty Vulcanized Canvas Shoes - Black',
  'KOSKOOL',
  399,
  549,
  27,
  'boys',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'fabric-shoes',
  NULL,
  NULL,
  '{"11C","12C","13C","1","2","3","4","5","6","7","8","9"}'::TEXT[],
  '{"Black"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/WE1356-Black_3dd08639-1ba0-4c08-86fb-b5ddf6184a12.v_1781172079_width_1600.jpg","/cdn/shop/files/WE1347-BLACK-GENTS_48ae184d-5dcd-408d-b3a0-9ca582f7c6e0.v_1786511741_width_1600.jpg"}'::TEXT[],
  4.6,
  290,
  true,
  false,
  '{"100% Breathable Duck Canvas","Vulcanized Skid-Proof Sole","Machine Washable Fabric","Reinforced Metal Eyelets"}'::TEXT[],
  'The timeless breathable cotton fabric shoe for Indian summers. Keeps active feet sweat-free and comfortable during long school hours.',
  'Heavy 12oz Pure Cotton Canvas + Vulcanized Rubber Sole',
  8
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-b-fab-02',
  'koskool-boys-white-canvas-drill-fabric-shoes',
  'KOSKOOL Boys White Canvas Drill & PT Fabric Shoes',
  'KOSKOOL',
  389,
  499,
  22,
  'boys',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'fabric-shoes',
  NULL,
  NULL,
  '{"10C","11C","12C","13C","1","2","3","4","5","6","7","8"}'::TEXT[],
  '{"White"}'::TEXT[],
  'White',
  NULL,
  '{"/cdn/shop/files/SGE24001-whitegrey_8d131c0b-ba2c-4914-9b46-5378bf6091c3.v_1786512160_width_416.jpg","/cdn/shop/files/WY3466-Blue-White_1606e288-e9a8-4a20-9203-90a9ca24920b.v_1786512467_width_416.jpg"}'::TEXT[],
  4.7,
  340,
  false,
  false,
  '{"Easy Chalk Washable Fabric","Non-Yellowing Rubber Toe Cap","Super Flexible Step","Lightweight Feel"}'::TEXT[],
  'Classic school drill and march-past canvas shoes. Easy to clean with white shoe whitener or regular wash.',
  'Breathable White Duck Fabric + Durable Rubber Rim',
  9
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-g-sch-01',
  'koskool-girls-mary-jane-velcro-buckle-school-shoes-black',
  'KOSKOOL Girls Classic Mary Jane School Shoes - Deep Black',
  'KOSKOOL',
  499,
  699,
  28,
  'girls',
  '{"kindergarten","middle-wing"}'::TEXT[],
  'school-shoes',
  NULL,
  NULL,
  '{"9C","10C","11C","12C","13C","1","2","3","4"}'::TEXT[],
  '{"Black"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/WE2362-Black-Ladies_37f3a155-dc4d-48d2-97a2-c5d95c6c7d49.v_1786512084_width_1600.jpg","/cdn/shop/files/WLP72046-BLACK-LADIES_41b98928-a58a-4372-9e7a-51b28c1dd8f1.v_1786511270_width_1600.jpg"}'::TEXT[],
  4.9,
  420,
  true,
  false,
  '{"Single Touch-Strap Mary Jane Closure","Padded Cushioned Ankle Collar","Scuff-Resistant Synthetic Leather","Anti-Slip Ribbed Sole"}'::TEXT[],
  'The quintessential girls school shoe with the beloved Mary Jane silhouette. Designed for kindergarten and middle wing girls with high-grip soles.',
  'High-Density Water-Resistant PU Leather + Flexible Rubber Outsole',
  10
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-g-sch-02',
  'koskool-girls-senior-ballerina-moc-school-shoes-black',
  'KOSKOOL Girls Senior Wing Comfort Ballerina School Shoes',
  'KOSKOOL',
  599,
  849,
  29,
  'girls',
  '{"middle-wing","senior-wing"}'::TEXT[],
  'school-shoes',
  NULL,
  NULL,
  '{"3","4","5","6","7","8"}'::TEXT[],
  '{"Black"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/WLP74038-BLACK-LADIES_d907da5e-41b3-4f74-bb9a-6930ae5ba1df.v_1786511253_width_416.jpg","/cdn/shop/files/WS9166-Black_47efd3ba-3c7a-4204-96bc-eabc164ccfd3.v_1786511809_width_416.jpg"}'::TEXT[],
  4.8,
  310,
  true,
  false,
  '{"Elegant Minimalist Uniform Look","Orthopedic Cushion Insole","Anti-Bite Soft Heel Notch","Quiet Step Sound-Dampening Sole"}'::TEXT[],
  'Specifically crafted for senior school girls needing a dressy yet deeply supportive shoe for assemblies, lab work, and daily classes.',
  'Matte Finish Synthetic Leather',
  11
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-g-sch-03',
  'koskool-girls-derby-lace-up-formal-school-shoes-black',
  'KOSKOOL Girls Uniform Lace-Up Oxford School Shoes - Black',
  'KOSKOOL',
  629,
  899,
  30,
  'girls',
  '{"middle-wing","senior-wing"}'::TEXT[],
  'school-shoes',
  NULL,
  NULL,
  '{"3","4","5","6","7","8"}'::TEXT[],
  '{"Black"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/W1030-BLACK-GENTS_37127caa-12a4-4e9c-914b-f06d017577a5.v_1786513424_width_1600.jpg","/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg"}'::TEXT[],
  4.7,
  195,
  false,
  false,
  '{"CBSE/ICSE Uniform Approved","Reinforced Toe Box","Sweat-Absorbing Antibacterial Sock Liner","Non-Slip Heel Base"}'::TEXT[],
  'For schools specifying lace-up formal footwear for girls. Built to withstand extensive wear throughout the academic year.',
  'High-Durability Faux Leather',
  12
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-g-spt-01',
  'koskool-girls-aerorun-white-sports-shoes',
  'KOSKOOL Girls AeroRun All-White PT & Sports Shoes',
  'KOSKOOL',
  549,
  799,
  31,
  'girls',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'sports-shoes',
  NULL,
  NULL,
  '{"10C","11C","12C","13C","1","2","3","4","5","6","7","8"}'::TEXT[],
  '{"White"}'::TEXT[],
  'White',
  NULL,
  '{"/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg","/cdn/shop/files/SGE24001-White-tan_f13bbfa4-938d-45d7-89f9-cf9748dde12a.v_1786511603_width_1600.jpg"}'::TEXT[],
  4.9,
  460,
  true,
  false,
  '{"100% Solid White Uniform Approved","Featherlight Shock Absorbing Sole","Breathable Upper Mesh","Easy Wipe-Clean Trim"}'::TEXT[],
  'Approved for sports day, aerobics, PT drills, and playground activities. Provides superior bounce and arch protection.',
  'Engineered Air-Mesh + EVA Soft Compound',
  13
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-g-spt-02',
  'koskool-girls-junior-velcro-white-sports-sneakers',
  'KOSKOOL Girls Junior Touch-Strap White PT Sneakers',
  'KOSKOOL',
  499,
  699,
  28,
  'girls',
  '{"kindergarten","middle-wing"}'::TEXT[],
  'sports-shoes',
  NULL,
  NULL,
  '{"9C","10C","11C","12C","13C","1","2"}'::TEXT[],
  '{"White"}'::TEXT[],
  'White',
  NULL,
  '{"/cdn/shop/files/WY3344-White-blue_cce8c41e-7c58-45c5-b7a9-d0531217be94.v_1786512863_width_416.jpg","/cdn/shop/files/SGE24001-whitegrey_8d131c0b-ba2c-4914-9b46-5378bf6091c3.v_1786512160_width_416.jpg"}'::TEXT[],
  4.8,
  220,
  false,
  false,
  '{"Dual Quick-Fasten Straps","Cushioned Footbed","Anti-Slip Rubber Grooves","Lightweight Play Structure"}'::TEXT[],
  'Specially fitted for young girls in kindergarten and junior classes. Easy to fasten and take off without teacher assistance.',
  'Durable Polyurethane Mesh Upper',
  14
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-g-fab-01',
  'koskool-girls-mary-jane-black-canvas-fabric-shoes',
  'KOSKOOL Girls Cotton Canvas Mary Jane Shoes - Black',
  'KOSKOOL',
  379,
  499,
  24,
  'girls',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'fabric-shoes',
  NULL,
  NULL,
  '{"10C","11C","12C","13C","1","2","3","4","5","6","7"}'::TEXT[],
  '{"Black"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/WE1356-Black_3dd08639-1ba0-4c08-86fb-b5ddf6184a12.v_1781172079_width_1600.jpg","/cdn/shop/files/WE2362-Black-Ladies_37f3a155-dc4d-48d2-97a2-c5d95c6c7d49.v_1786512084_width_1600.jpg"}'::TEXT[],
  4.6,
  175,
  false,
  false,
  '{"100% Breathable Pure Cotton Canvas","Elastic Step-In Band","Machine Wash Safe","Flexible Vulcanized Sole"}'::TEXT[],
  'Soft, airy canvas footwear for everyday school sessions, cultural activities, and hot humid climate.',
  'Fine Weave Cotton Canvas + Non-Slip Rubber Base',
  15
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-g-fab-02',
  'koskool-girls-white-canvas-drill-pt-fabric-shoes',
  'KOSKOOL Girls White Drill & PT Canvas Fabric Shoes',
  'KOSKOOL',
  379,
  499,
  24,
  'girls',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'fabric-shoes',
  NULL,
  NULL,
  '{"10C","11C","12C","13C","1","2","3","4","5","6","7"}'::TEXT[],
  '{"White"}'::TEXT[],
  'White',
  NULL,
  '{"/cdn/shop/files/SGE24001-whitegrey_8d131c0b-ba2c-4914-9b46-5378bf6091c3.v_1786512160_width_416.jpg","/cdn/shop/files/WY3466-Blue-White_1606e288-e9a8-4a20-9203-90a9ca24920b.v_1786512467_width_416.jpg"}'::TEXT[],
  4.7,
  230,
  false,
  false,
  '{"Traditional March-Past & Drill Spec","Breathable Heavy Fabric","Durable Rubber Cap","Easy to Whitewash"}'::TEXT[],
  'School assembly and parade standard white canvas shoe with high stitch density and grip.',
  'Natural Cotton Canvas + Gum Rubber Sole',
  16
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-acc-bot-01',
  'koskool-stainless-steel-insulated-school-water-bottle-750ml',
  'KOSKOOL Insulated Stainless Steel School Water Bottle (750ml)',
  'KOSKOOL',
  349,
  499,
  30,
  'unisex',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'accessories',
  'water-bottles',
  NULL,
  '{"750ml"}'::TEXT[],
  '{"Navy Blue","Silver","Black","Pastel Pink"}'::TEXT[],
  'Navy Blue',
  NULL,
  '{"/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg","/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg"}'::TEXT[],
  4.9,
  520,
  true,
  false,
  '{"Keeps Cold for 18h / Hot for 12h","100% Leak-Proof Push Lock Cap","Food-Grade 304 Stainless Steel","Durable Powder Coat Finish"}'::TEXT[],
  'Built tough to endure rough school days. Double-wall vacuum insulation keeps drinking water crisp and cool through afternoon classes.',
  'Food-Grade SS 304 + BPA-Free Sipper Lid',
  17
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-acc-pen-01',
  'koskool-multi-tier-hardtop-school-pencil-case',
  'KOSKOOL Multi-Tier Embossed Hardtop School Pencil Case',
  'KOSKOOL',
  299,
  449,
  33,
  'unisex',
  '{"kindergarten","middle-wing"}'::TEXT[],
  'accessories',
  'pencil-cases',
  NULL,
  '{"Standard"}'::TEXT[],
  '{"Navy Blue","Deep Black","Pastel Pink"}'::TEXT[],
  'Navy Blue',
  NULL,
  '{"/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg","/cdn/shop/files/WK473-PINK_KIDS_ea22c13b-148c-4214-8320-c907acb7d395.v_1786512672_width_1600.jpg"}'::TEXT[],
  4.8,
  380,
  true,
  false,
  '{"Shock-Absorbent Hard EVA Shell","Mesh Zipper Compartment","Pen Slot Organizer Loops","Smooth Heavy-Duty Metal Zippers"}'::TEXT[],
  'Keeps pens, pencils, erasers, compasses, and rulers neatly organized and protected against accidental drops in school.',
  'Shockproof EVA + Scratch-Resistant Fabric Lining',
  18
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-acc-geo-01',
  'koskool-precision-mathematical-geometry-box-set',
  'KOSKOOL Precision Mathematical Geometry Instrument Box',
  'KOSKOOL',
  199,
  299,
  33,
  'boys',
  '{"middle-wing","senior-wing"}'::TEXT[],
  'accessories',
  'geometry-accessories',
  NULL,
  '{"Standard Set"}'::TEXT[],
  '{"Silver","Navy Blue"}'::TEXT[],
  'Silver',
  NULL,
  '{"/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg","/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg"}'::TEXT[],
  4.8,
  260,
  false,
  false,
  '{"Rust-Resistant Die-Cast Zinc Instruments","Transparent Acrylic Set Squares & Protractor","Self-Centering Compass Mechanism","Sturdy Tin Case"}'::TEXT[],
  'Designed for engineering drawing, CBSE mathematics, and geometry practicals with ultra-precise graduation markings.',
  'Zinc Alloy + Optical-Grade Clear Acrylic',
  19
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-acc-hair-01',
  'koskool-girls-uniform-hair-ribbon-bands-combo-pack',
  'KOSKOOL Girls School Uniform Ribbon & Hair Bands Combo Pack',
  'KOSKOOL',
  149,
  229,
  35,
  'girls',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'accessories',
  'hair-accessories',
  NULL,
  '{"Free Size (Pack of 6)"}'::TEXT[],
  '{"Black","White","Navy Blue","Red"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/WK473-PINK_KIDS_ea22c13b-148c-4214-8320-c907acb7d395.v_1786512672_width_1600.jpg","/cdn/shop/files/WK388-BEIGEPINK-KIDS_b512b642-18fc-430d-b9bf-2420aabca356.v_1786511561_width_1600.jpg"}'::TEXT[],
  4.9,
  310,
  true,
  false,
  '{"Snag-Free Elastic Grip","Durable Satin Ribbon Finish","Standard School Uniform Approved Colors","Crease-Resistant"}'::TEXT[],
  'Approved for school morning inspection guidelines. Pack includes matching satin ribbons, non-slip hair ties, and hair pins.',
  'High-Stretch Elastic + Premium Satin Ribbons',
  20
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-acc-ess-01',
  'koskool-all-weather-shoe-polish-brush-care-kit',
  'KOSKOOL Complete School Shoe Care & High-Shine Polish Kit',
  'KOSKOOL',
  249,
  349,
  29,
  'unisex',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'accessories',
  'school-essentials',
  NULL,
  '{"Care Kit Set"}'::TEXT[],
  '{"Black","Neutral"}'::TEXT[],
  'Black',
  NULL,
  '{"/cdn/shop/files/WGP58090-BLACK-GENTS_b5b4c509-016f-4659-b460-d6d86ffac5b8.v_1787997065_width_1600.jpg","/cdn/shop/files/WGE53354-BLACK-GENTS_4d4814a1-64d8-45b9-a7b8-722cf22d3c8e.v_1786511261_width_1600.jpg"}'::TEXT[],
  4.9,
  440,
  true,
  false,
  '{"Natural Carnauba Wax Polish (Black)","Pure Horsehair Buffing Brush","White Canvas Whitener Sponge","Microfiber Polishing Cloth"}'::TEXT[],
  'Everything students need for mirror-shine shoes and clean white PT shoes every morning. Nourishes synthetic and genuine leathers.',
  'Wax Emulsion + Wood Grip Bristle Brush',
  21
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-acc-bagacc-01',
  'koskool-reflective-rain-cover-school-bag-accessory',
  'KOSKOOL High-Visibility Reflective Rain Cover for School Bags',
  'KOSKOOL',
  189,
  299,
  37,
  'unisex',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'accessories',
  'bag-accessories',
  NULL,
  '{"Fits 20L - 35L Bags"}'::TEXT[],
  '{"Fluorescent Yellow","Navy Blue","Silver"}'::TEXT[],
  'Fluorescent Yellow',
  NULL,
  '{"/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg","/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg"}'::TEXT[],
  4.8,
  195,
  false,
  false,
  '{"100% Waterproof PU Coated Polyester","3M Reflective Safety Strips for Low Light","Elastic Hem for Snug Fit","Compact Foldable Pouch"}'::TEXT[],
  'Keeps textbooks and homework completely dry during monsoon downpours while keeping students visible to oncoming traffic on early mornings.',
  '210T Waterproof Ripstop Polyester',
  22
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-acc-dress-01',
  'koskool-girls-cotton-rich-school-uniform-socks-pack-of-3',
  'KOSKOOL Girls Cushion-Sole School Uniform Socks (Pack of 3)',
  'KOSKOOL',
  199,
  299,
  33,
  'girls',
  '{"kindergarten","middle-wing","senior-wing"}'::TEXT[],
  'accessories',
  'dress-accessories',
  NULL,
  '{"Small (4-7 yrs)","Medium (8-12 yrs)","Large (13+ yrs)"}'::TEXT[],
  '{"White","Navy Blue","Black"}'::TEXT[],
  'White',
  NULL,
  '{"/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg","/cdn/shop/files/WY3466-Blue-White_1606e288-e9a8-4a20-9203-90a9ca24920b.v_1786512467_width_416.jpg"}'::TEXT[],
  4.9,
  380,
  true,
  false,
  '{"Terry Cushion Heel & Toe Support","Seamless Toe Closure (No Blistering)","Stay-Up Ribbed Calf Cuff","Odor-Control Silver Tech"}'::TEXT[],
  'Super-soft combed cotton school socks designed to eliminate shoe rubbing, blister discomfort, and unpleasant odor.',
  '82% Combed Cotton, 15% Polyamide, 3% Elastane',
  23
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-acc-head-01',
  'koskool-kids-sun-protective-school-sports-cap',
  'KOSKOOL Kids Sun-Shield Uniform Sports Cap - Navy',
  'KOSKOOL',
  179,
  249,
  28,
  'kids',
  '{"kindergarten","middle-wing"}'::TEXT[],
  'accessories',
  'head-accessories',
  NULL,
  '{"Adjustable Free Size"}'::TEXT[],
  '{"Navy Blue","White","Maroon"}'::TEXT[],
  'Navy Blue',
  NULL,
  '{"/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg","/cdn/shop/files/WK722-MAROON-KIDS.v_1786511451_width_1600.jpg"}'::TEXT[],
  4.7,
  140,
  false,
  false,
  '{"UPF 50+ Sun Protection","Moisture-Wicking Inner Sweatband","Adjustable Rear Strap","Pre-Curved Sturdy Visor"}'::TEXT[],
  'Shields young students from harsh sunlight during assembly and outdoor sports periods.',
  '100% Breathable Cotton Twill',
  24
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-acc-face-01',
  'koskool-kids-breathable-protective-school-mask-pack-of-3',
  'KOSKOOL Kids Comfort-Fit Breathable School Mask (Pack of 3)',
  'KOSKOOL',
  129,
  199,
  35,
  'kids',
  '{"kindergarten","middle-wing"}'::TEXT[],
  'accessories',
  'face-accessories',
  NULL,
  '{"Kids Fit (Pack of 3)"}'::TEXT[],
  '{"Navy Blue","Grey","Black"}'::TEXT[],
  'Navy Blue',
  NULL,
  '{"/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg","/cdn/shop/files/WK722-MAROON-KIDS.v_1786511451_width_1600.jpg"}'::TEXT[],
  4.7,
  110,
  false,
  false,
  '{"3-Layer Meltblown Filtration","Ultra-Soft Elastic Ear Loops","Washable & Reusable Up to 30 Times","School Color Coded"}'::TEXT[],
  'Designed specifically for children’s facial contours to ensure unhindered breathing while protecting against school bus dust and allergens.',
  'Organic Cotton Outer + Non-Woven Filter Layer',
  25
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-bag-01',
  'koskool-ergonomic-multi-compartment-school-backpack-32l',
  'KOSKOOL Pro-Spine Multi-Compartment School Backpack (32L)',
  'KOSKOOL',
  999,
  1499,
  33,
  'unisex',
  '{"middle-wing","senior-wing"}'::TEXT[],
  'bags',
  NULL,
  'multi-compartment-bags',
  '{"32 Litres"}'::TEXT[],
  '{"Navy Blue","Deep Black","Slate Grey"}'::TEXT[],
  'Navy Blue',
  '32 Litres',
  '{"/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg","/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg"}'::TEXT[],
  4.9,
  680,
  true,
  false,
  '{"Orthopedic Spine-Relief Back Padding","4 Large Organized Zipper Compartments","Padded 15.6\" Laptop/Tablet Sleeve","Dual Umbrella & Bottle Pockets","Water-Repellent Dobby Shell"}'::TEXT[],
  'Engineered to reduce shoulder fatigue caused by heavy textbooks. Tested to withstand up to 15 kg of weight with bar-tack reinforced load points.',
  '900D Heavy-Duty Water-Repellent Dobby Polyester',
  26
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-bag-02',
  'koskool-boys-heavy-duty-school-backpack-28l',
  'KOSKOOL Boys ToughGear School Backpack (28L) - Black & Blue',
  'KOSKOOL',
  849,
  1299,
  35,
  'boys',
  '{"middle-wing","senior-wing"}'::TEXT[],
  'bags',
  NULL,
  'boys-school-bags',
  '{"28 Litres"}'::TEXT[],
  '{"Black","Navy Blue"}'::TEXT[],
  'Black',
  '28 Litres',
  '{"/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg","/cdn/shop/files/WGE53354-BLACK-GENTS_4d4814a1-64d8-45b9-a7b8-722cf22d3c8e.v_1786511261_width_1600.jpg"}'::TEXT[],
  4.8,
  420,
  true,
  false,
  '{"Reinforced Rubberized Base","Wide Ergonomic S-Shaped Shoulder Straps","Stationery Organizer Pocket","Sturdy SBS Zippers"}'::TEXT[],
  'Rugged build made for energetic school boys. Includes reinforced corners, durable grab handle, and balanced weight distribution.',
  '600D Tear-Resistant Polyester',
  27
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-bag-03',
  'koskool-girls-pastelle-cushioned-school-backpack-26l',
  'KOSKOOL Girls Pastelle Ergonomic School Backpack (26L)',
  'KOSKOOL',
  899,
  1349,
  33,
  'girls',
  '{"middle-wing","senior-wing"}'::TEXT[],
  'bags',
  NULL,
  'girls-school-bags',
  '{"26 Litres"}'::TEXT[],
  '{"Pastel Pink","Lilac","Sky Blue","Teal"}'::TEXT[],
  'Pastel Pink',
  '26 Litres',
  '{"/cdn/shop/files/WK473-PINK_KIDS_ea22c13b-148c-4214-8320-c907acb7d395.v_1786512672_width_1600.jpg","/cdn/shop/files/WK388-BEIGEPINK-KIDS_b512b642-18fc-430d-b9bf-2420aabca356.v_1786511561_width_1600.jpg"}'::TEXT[],
  4.9,
  390,
  true,
  false,
  '{"Lightweight Construction (Only 480g)","Breathable Honeycomb Mesh Back Padding","Secret Anti-Theft Back Pocket","Keyclip & Pen Holders"}'::TEXT[],
  'A stylish, elegant school bag for girls packed with ergonomic comfort. Soft padded shoulder cushions safeguard posture while commuting.',
  'Waterproof Jacquard Weave Nylon + Memory Foam Straps',
  28
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-bag-04',
  'koskool-kids-junior-playgroup-school-bag-16l',
  'KOSKOOL Kids TinySteps Kindergarten School Bag (16L)',
  'KOSKOOL',
  499,
  749,
  33,
  'kids',
  '{"kindergarten"}'::TEXT[],
  'bags',
  NULL,
  'kids-school-bags',
  '{"16 Litres"}'::TEXT[],
  '{"Yellow & Blue","Red & Navy","Pink"}'::TEXT[],
  'Yellow & Blue',
  '16 Litres',
  '{"/cdn/shop/files/WK722-MAROON-KIDS.v_1786511451_width_1600.jpg","/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg"}'::TEXT[],
  4.8,
  275,
  false,
  false,
  '{"Ultra-Lightweight (Under 300g)","Chest Buckle to Prevent Slipping Off Small Shoulders","Easy Pull-Ring Zippers for Little Hands","Name Tag Badge Holder"}'::TEXT[],
  'Specially created for nursery and kindergarten students. Comfortably accommodates tiffin box, bottle, diary, and coloring books.',
  'Soft Non-Toxic BPA-Free Oxford Fabric',
  29
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;

INSERT INTO public.products (
  id, slug, name, brand, price, original_price, discount_percent,
  gender, school_level, product_type, accessory_category, bag_category,
  sizes, colours, primary_colour, capacity, images, rating,
  review_count, is_popular, is_new_arrival, features, description, material,
  display_order
) VALUES (
  'ks-bag-05',
  'koskool-heavy-duty-all-rounder-school-backpack-35l',
  'KOSKOOL All-Rounder Senior High School Backpack (35L)',
  'KOSKOOL',
  1149,
  1699,
  32,
  'unisex',
  '{"senior-wing"}'::TEXT[],
  'bags',
  NULL,
  'school-backpacks',
  '{"35 Litres"}'::TEXT[],
  '{"Solid Black","Charcoal Grey","Navy Blue"}'::TEXT[],
  'Solid Black',
  '35 Litres',
  '{"/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg","/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg"}'::TEXT[],
  4.9,
  512,
  true,
  false,
  '{"Massive 35L Capacity with 5 Compartments","Padded Base with Raised Rubber Feet","Luggage Pass-Through Strap","Night Safety Reflective Piping"}'::TEXT[],
  'Designed for high schoolers carrying heavy science practical manuals, sports gear, and laptops. Built like a fortress for year-round durability.',
  'High-Tensile Ballistic Nylon',
  30
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  discount_percent = EXCLUDED.discount_percent,
  gender = EXCLUDED.gender,
  school_level = EXCLUDED.school_level,
  product_type = EXCLUDED.product_type,
  accessory_category = EXCLUDED.accessory_category,
  bag_category = EXCLUDED.bag_category,
  sizes = EXCLUDED.sizes,
  colours = EXCLUDED.colours,
  primary_colour = EXCLUDED.primary_colour,
  capacity = EXCLUDED.capacity,
  images = EXCLUDED.images,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_popular = EXCLUDED.is_popular,
  is_new_arrival = EXCLUDED.is_new_arrival,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  material = EXCLUDED.material,
  display_order = EXCLUDED.display_order;


-- ============================================================
-- ADDITION: Homepage Admin Panel Tables (cross-device sync)
-- ============================================================

-- homepage_sections
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
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read homepage_sections" ON public.homepage_sections;
CREATE POLICY "Public read homepage_sections" ON public.homepage_sections FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write homepage_sections" ON public.homepage_sections;
CREATE POLICY "Public write homepage_sections" ON public.homepage_sections FOR ALL USING (true) WITH CHECK (true);

-- footwear_categories
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

-- school_levels
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

-- app_settings (key-value store for spotlight config etc.)
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

-- hero_slides (homepage hero slideshow slides)
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id             BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    slide_id       VARCHAR(100) UNIQUE,
    badge          VARCHAR(255),
    title          TEXT,
    subtitle       TEXT,
    desktop_image  TEXT,
    mobile_image   TEXT,
    primary_cta_text    VARCHAR(100),
    primary_cta_link    VARCHAR(255),
    secondary_cta_text  VARCHAR(100),
    secondary_cta_link  VARCHAR(255),
    tertiary_cta_text   VARCHAR(100),
    tertiary_cta_link   VARCHAR(255),
    display_order  INT DEFAULT 0,
    is_active      BOOLEAN DEFAULT true,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read hero_slides" ON public.hero_slides;
CREATE POLICY "Public read hero_slides" ON public.hero_slides FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public write hero_slides" ON public.hero_slides;
CREATE POLICY "Public write hero_slides" ON public.hero_slides FOR ALL USING (true) WITH CHECK (true);
