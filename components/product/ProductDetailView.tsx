'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';
import ProductReviewsSection from '@/components/product/ProductReviewsSection';
import { getColorStyle } from '@/data/colors';
import {
  Star,
  Ruler,
  Plus,
  Minus,
  HelpCircle,
  Mail,
  ChevronRight,
  ShieldCheck,
  Check,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface ProductDetailViewProps {
  product?: Product;
  isHomePage?: boolean;
}

export default function ProductDetailView({ product: initialProduct, isHomePage = false }: ProductDetailViewProps) {
  const router = useRouter();
  const { addToCart, removePromoCode } = useCart();

  // Find featured or requested product
  const defaultProduct = PRODUCTS.find((p) => p.slug === 'mens-daily-wear-sandals-wgp53410-tan') || PRODUCTS[0];
  const product = initialProduct || defaultProduct;

  const [liveStats, setLiveStats] = useState<{ rating: number; reviewCount: number } | null>(null);
  const displayRating = liveStats?.rating ?? product.rating ?? 4.8;
  const displayReviewCount = liveStats?.reviewCount ?? product.reviewCount ?? 100;

  const categoryOptions = React.useMemo(() => {
    if (product.categoryOptions && product.categoryOptions.length > 0) {
      return product.categoryOptions;
    }
    const g = product.gender?.toLowerCase();
    if (g === 'women' || g === 'womens') return ['WOMENS', 'GIRLS'];
    if (g === 'girls') return ['GIRLS', 'WOMENS'];
    if (g === 'boys') return ['BOYS', 'MENS'];
    if (g === 'mens') return ['MENS', 'BOYS'];
    if (g === 'kids') return ['KIDS', 'BOYS', 'GIRLS'];
    if (g === 'unisex') return ['UNISEX', 'BOYS', 'GIRLS'];
    return [product.gender?.toUpperCase() || 'GENERAL'];
  }, [product]);

  const [selectedColour, setSelectedColour] = useState<string>(product.primaryColour || 'Tan');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (product.categoryOptions?.[0]) return product.categoryOptions[0];
    const g = product.gender?.toLowerCase();
    if (g === 'women' || g === 'womens') return 'WOMENS';
    if (g === 'girls') return 'GIRLS';
    if (g === 'boys') return 'BOYS';
    if (g === 'mens') return 'MENS';
    if (g === 'kids') return 'KIDS';
    return product.gender?.toUpperCase() || 'BOYS';
  });

  React.useEffect(() => {
    if (product) {
      setSelectedColour(product.primaryColour || 'Tan');
      const g = product.gender?.toLowerCase();
      const defaultCat = product.categoryOptions?.[0] || 
        (g === 'women' || g === 'womens' ? 'WOMENS' :
         g === 'girls' ? 'GIRLS' :
         g === 'boys' ? 'BOYS' :
         g === 'mens' ? 'MENS' :
         g === 'kids' ? 'KIDS' : (product.gender?.toUpperCase() || 'BOYS'));
      setSelectedCategory(defaultCat);
      setSelectedSize(product.sizes?.[0] || '6');
    }
  }, [product]);

  React.useEffect(() => {
    if (categoryOptions.length > 0 && !categoryOptions.includes(selectedCategory)) {
      setSelectedCategory(categoryOptions[0]);
    }
  }, [categoryOptions, selectedCategory]);

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '6');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeModal, setShowSizeModal] = useState<boolean>(false);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [activeMobileImg, setActiveMobileImg] = useState<number>(0);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isFooterVisible, setIsFooterVisible] = useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Hide sticky mobile buy bar when footer is in view
  React.useEffect(() => {
    if (isHomePage) return;

    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '20px 0px 0px 0px',
        threshold: 0,
      }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [isHomePage]);

  // Mobile image touch swipe handling
  const touchStartRef = React.useRef<number | null>(null);
  const touchEndRef = React.useRef<number | null>(null);

  const handleMobileTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
    touchEndRef.current = null;
  };

  const handleMobileTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleMobileTouchEnd = (totalImgs: number) => {
    if (touchStartRef.current !== null && touchEndRef.current !== null) {
      const diff = touchStartRef.current - touchEndRef.current;
      if (diff > 40) {
        setActiveMobileImg((prev) => (prev + 1) % totalImgs);
      } else if (diff < -40) {
        setActiveMobileImg((prev) => (prev - 1 + totalImgs) % totalImgs);
      }
    }
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColour, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyItNow = () => {
    removePromoCode();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('reset_cart_promocode'));
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    addToCart(product, selectedSize, selectedColour, quantity);
    router.push('/checkout');
  };

  // Color variants setup: use product variants, colours, or primaryColour without hardcoded fallbacks
  const colorVariants = React.useMemo(() => {
    const list: { name: string; image?: string }[] = [];
    const seen = new Set<string>();

    if (product.colorVariants && product.colorVariants.length > 0) {
      product.colorVariants.forEach((v) => {
        const key = v.name.trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push(v);
        }
      });
    }

    if (product.colours && product.colours.length > 0) {
      product.colours.forEach((c, i) => {
        const key = c.trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            name: c.trim(),
            image: product.images[i] || product.images[0],
          });
        }
      });
    }

    if (list.length === 0 && product.primaryColour) {
      list.push({
        name: product.primaryColour,
        image: product.images[0],
      });
    }

    return list;
  }, [product]);

  // Images for current selection
  const galleryImages = product.images.length > 0 ? product.images : [
    '/cdn/shop/files/WGP53410-TAN-GENTS_7608173e-b30c-4214-ad1d-02182418d1a2.v_1786511338_width_1600.jpg',
    '/cdn/shop/files/2_jpg_aa2d262c-cae2-4472-9629-a19d0d14dafa.v_1786511338_width_1600.jpg',
    '/cdn/shop/files/3_jpg_f0a2d306-79d9-48b3-8474-fd7f5b3b2e9b.v_1786511338_width_1600.jpg',
    '/cdn/shop/files/4_jpg_6888c3dd-6316-46eb-8bf8-bf550a997916.v_1786511338_width_1600.jpg',
    '/cdn/shop/files/5_jpg_e833f12d-4312-4d71-a966-a93cedf1f630.v_1786511338_width_1600.jpg',
  ];

  const recommendedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.gender === product.gender || p.productType === product.productType)
  ).slice(0, 4);

  return (
    <div className={`bg-white overflow-x-hidden w-full max-w-full ${isHomePage ? '' : 'min-h-screen pb-16 lg:pb-0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Breadcrumb Navigation */}
        {!isHomePage && (
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-brand-600 transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href={`/collections/${product.gender}`} className="capitalize hover:text-brand-600 transition">
              {product.gender}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-900 truncate max-w-xs">{product.name}</span>
          </nav>
        )}

        {/* 2-Column Product Section:
            Left: Image Gallery (scrolling naturally)
            Right: Sticky Product Information (pinned until last image is scrolled) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          
          {/* ================= LEFT GALLERY: MOBILE CAROUSEL & DESKTOP GRID ================= */}
          <div className="lg:col-span-7">
            {/* Mobile View: Single hero image with touch swipe & thumbnail row */}
            <div className="lg:hidden space-y-3">
              <div
                className="relative aspect-square bg-[#fbfbfb] rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-4 shadow-sm touch-pan-y"
                onTouchStart={handleMobileTouchStart}
                onTouchMove={handleMobileTouchMove}
                onTouchEnd={() => handleMobileTouchEnd(galleryImages.length)}
              >
                <Image
                  src={galleryImages[activeMobileImg] || galleryImages[0]}
                  alt={`${product.name} view ${activeMobileImg + 1}`}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 500px"
                  className="object-contain p-3"
                />
                {product.discountPercent && (
                  <span className="absolute top-3 left-3 bg-[#e86b62] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow">
                    {product.discountPercent}% OFF
                  </span>
                )}
                {/* Photo counter */}
                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {activeMobileImg + 1} / {galleryImages.length}
                </span>

                {/* Mobile Prev / Next Buttons */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveMobileImg((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow border border-gray-200 flex items-center justify-center text-gray-800 active:scale-95 transition"
                      aria-label="Previous Image"
                    >
                      &lsaquo;
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMobileImg((prev) => (prev + 1) % galleryImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow border border-gray-200 flex items-center justify-center text-gray-800 active:scale-95 transition"
                      aria-label="Next Image"
                    >
                      &rsaquo;
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row for Mobile - Wrapping cleanly, zero horizontal scroll */}
              {galleryImages.length > 1 && (
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {galleryImages.map((imgSrc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveMobileImg(idx)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 overflow-hidden bg-[#fbfbfb] shrink-0 p-1 transition-all ${
                        activeMobileImg === idx
                          ? 'border-gray-950 ring-1 ring-gray-950 scale-105'
                          : 'border-gray-200 hover:border-gray-400 opacity-70'
                      }`}
                    >
                      <Image
                        src={imgSrc}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-contain p-0.5"
                        sizes="56px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop View: 2-column image grid */}
            <div className="hidden lg:grid grid-cols-2 gap-3 sm:gap-4">
              {galleryImages.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square bg-[#fbfbfb] rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-3 sm:p-4 group shadow-sm hover:shadow-md transition-shadow"
                >
                  <Image
                    src={imgSrc}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    priority={idx < 2}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 35vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                  {idx === 0 && product.discountPercent && (
                    <span className="absolute top-3 left-3 bg-[#e86b62] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STICKY PRODUCT INFO & TABS ================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5 self-start bg-white z-10 pb-6">
            
            {/* 1. Brand Tag */}
            <div className="text-xs uppercase tracking-wider text-gray-700 font-bold">
              {product.brand}
            </div>

            {/* 2. Title & Pricing (Real Price and Crossed-out Original MRP matching Image 3) */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 flex-wrap pt-0.5">
                {/* Real / Selling Price */}
                <div className="flex items-baseline font-black text-gray-950">
                  <span className="text-xl sm:text-2xl font-bold mr-0.5 leading-none">₹</span>
                  <span className="text-3xl sm:text-4xl tracking-tight leading-none">
                    {Math.floor(product.price) === product.price
                      ? product.price.toLocaleString('en-IN')
                      : product.price.toFixed(2)}
                  </span>
                </div>

                {/* Strikethrough / Crossed-out Original Price as shown in Image 3 */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-lg sm:text-xl text-gray-500 line-through font-semibold decoration-gray-600 decoration-[1.5px]">
                    ₹{Math.floor(product.originalPrice) === product.originalPrice
                      ? product.originalPrice.toLocaleString('en-IN')
                      : product.originalPrice.toFixed(2)}
                  </span>
                )}

                {/* Discount Percentage Badge */}
                {(product.discountPercent || (product.originalPrice && product.originalPrice > product.price)) && (
                  <span className="text-xs font-black text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md uppercase">
                    {product.discountPercent || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}

                <span className="text-xs text-gray-500 font-normal">
                  (Inclusive of all taxes)
                </span>
              </div>

              {/* 3. Star Reviews */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('product-reviews');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('koskool_expand_reviews'));
                  }
                }}
                className="flex items-center gap-1.5 pt-0.5 group cursor-pointer text-left focus:outline-none"
                title="Click to view all ratings & customer reviews"
              >
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 transition ${
                        i < Math.floor(displayRating)
                          ? 'fill-amber-400 text-amber-400'
                          : i < displayRating
                          ? 'fill-amber-300 text-amber-300'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-700 font-semibold ml-1 group-hover:text-brand-600 transition">
                  {displayRating} ({displayReviewCount} reviews)
                </span>
                <span className="text-[11px] text-brand-600 font-bold underline ml-1 hidden sm:inline">
                  Customer Reviews &rarr;
                </span>
              </button>
            </div>

            {/* 4. Colour Swatches */}
            {colorVariants.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs text-gray-900 font-medium">
                  Colour: <span className="font-semibold text-gray-950">{selectedColour}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorVariants.map((variant) => {
                    const isSelected = selectedColour.toLowerCase() === variant.name.toLowerCase();
                    return (
                      <button
                        key={variant.name}
                        type="button"
                        onClick={() => setSelectedColour(variant.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'border-black bg-gray-50 font-bold shadow-sm ring-1 ring-black/10'
                            : 'border-gray-200 bg-white hover:border-gray-400 text-gray-700'
                        }`}
                        aria-label={`Select colour ${variant.name}`}
                        title={variant.name}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0 shadow-xs"
                          style={getColorStyle(variant.name)}
                        />
                        <span>{variant.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Category Selection */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                CATEGORY: {selectedCategory}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {categoryOptions.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2 text-xs font-bold rounded-md transition-all ${
                        isSelected
                          ? 'bg-[#374151] text-white shadow-sm ring-1 ring-[#374151]'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Size Chart Link & Size Selector */}
            <div className="space-y-2.5 pt-1">
              <div>
                <button
                  type="button"
                  onClick={() => setShowSizeModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:text-brand-600 transition underline underline-offset-4"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div className="text-xs text-gray-900 font-medium">
                Select a Size:
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`w-11 h-11 rounded-md text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center ${
                        isSelected
                          ? 'border-2 border-gray-950 bg-white text-gray-950 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Quantity Stepper & Select An Option (Add To Cart) */}
            <div className="flex items-center gap-3 pt-2">
              {/* Stepper < 1 > */}
              <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 bg-white text-gray-800">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-500 hover:text-gray-950 text-sm font-bold px-1 transition"
                  aria-label="Decrease quantity"
                >
                  &lsaquo;
                </button>
                <span className="px-3 text-xs font-bold text-gray-900 min-w-[24px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-gray-500 hover:text-gray-950 text-sm font-bold px-1 transition"
                  aria-label="Increase quantity"
                >
                  &rsaquo;
                </button>
              </div>

              {/* Select an option Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-2.5 px-6 rounded-full border border-red-600 text-red-600 hover:bg-red-50 text-xs font-bold tracking-wide transition text-center flex items-center justify-center gap-1.5"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <span>Add to Cart</span>
                )}
              </button>
            </div>

            {/* 8. Full-width "Buy It Now" Button */}
            <div>
              <button
                type="button"
                onClick={handleBuyItNow}
                className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm py-3.5 px-6 rounded-full shadow-md hover:shadow-lg transition text-center tracking-wide"
              >
                Buy It Now
              </button>
            </div>

            {/* 9. Share Links & Need Help */}
            <div className="flex items-center justify-between text-xs text-gray-700 pt-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-700">Share:</span>
                
                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition font-bold"
                  aria-label="Share on Facebook"
                  suppressHydrationWarning
                >
                  f
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-black transition font-bold"
                  aria-label="Share on X"
                >
                  &#120143;
                </a>

                {/* Pinterest */}
                <a
                  href={`https://pinterest.com/pin/create/button/?description=${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-red-600 transition font-bold"
                  aria-label="Share on Pinterest"
                >
                  p
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} on Walkaroo: ` + currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-emerald-600 transition"
                  aria-label="Share on WhatsApp"
                  suppressHydrationWarning
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.697.073-2.127-.518-1.74-.72-2.883-2.482-2.97-2.597-.087-.116-.708-.941-.708-1.792s.448-1.27.607-1.444c.159-.175.348-.217.464-.217.116 0 .232.001.333.006.106.005.249-.04.39.299.144.348.492 1.2.535 1.287.043.087.072.189.014.305-.058.116-.087.189-.174.29-.087.102-.182.227-.26.305-.089.088-.182.184-.078.363.104.179.462.763.992 1.235.683.608 1.26.797 1.439.885.179.088.283.073.388-.047.106-.119.454-.529.576-.711.12-.181.242-.152.406-.091.164.061 1.04.49 1.218.578.179.089.298.132.342.207.044.075.044.436-.1.841z"/>
                  </svg>
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent('Check out this product: ' + product.name)}`}
                  className="text-gray-600 hover:text-gray-950 transition"
                  aria-label="Share via Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>

              {/* Need help? */}
              <a
                href="https://wa.me/918130458265"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-950 font-semibold"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need help?</span>
              </a>
            </div>

          </div>

        </div>

        {/* ================= PRODUCT REVIEWS & COMMENTS SECTION ================= */}
        <ProductReviewsSection
          product={product}
          onReviewStatsChange={(stats) => setLiveStats(stats)}
        />

        {/* ================= RECOMMENDED PRODUCTS SECTION ================= */}
        {/* Appears after the last image when scrolling down as requested */}
        {!isHomePage && recommendedProducts.length > 0 && (
          <div className="pt-16 border-t border-gray-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
                  Recommended For You
                </h2>
                <p className="text-xs text-gray-500 pt-1">
                  Popular daily comfort wear, school footwear, and accessories
                </p>
              </div>
              <Link
                href="/collections/boys"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 transition"
              >
                Explore More &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Size Chart Modal */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm" onClick={() => setShowSizeModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-navy-950">Walkaroo Urbanoz Size Chart</h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Measure your foot length in centimeters from heel to longest toe to choose the perfect fit.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-navy-950 text-white">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">India / UK Size</th>
                    <th className="p-2.5">Euro Size</th>
                    <th className="p-2.5">Foot Length (cm)</th>
                    <th className="p-2.5 rounded-r-lg">Foot Length (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-2.5 font-bold">6</td>
                    <td className="p-2.5">40</td>
                    <td className="p-2.5">25.0 cm</td>
                    <td className="p-2.5">9.8 in</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">7</td>
                    <td className="p-2.5">41</td>
                    <td className="p-2.5">25.8 cm</td>
                    <td className="p-2.5">10.1 in</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">8</td>
                    <td className="p-2.5">42</td>
                    <td className="p-2.5">26.6 cm</td>
                    <td className="p-2.5">10.5 in</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">9</td>
                    <td className="p-2.5">43</td>
                    <td className="p-2.5">27.5 cm</td>
                    <td className="p-2.5">10.8 in</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">10</td>
                    <td className="p-2.5">44</td>
                    <td className="p-2.5">28.3 cm</td>
                    <td className="p-2.5">11.1 in</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowSizeModal(false)}
              className="w-full bg-navy-950 text-white text-xs font-bold py-2.5 rounded-xl shadow"
            >
              Close Size Chart
            </button>
          </div>
        </div>
      )}

      {/* ================= STICKY MOBILE ORDER BAR ================= */}
      {/* Provides 1-tap ordering on phone screens as user scrolls through details; hides automatically when coming to the footer */}
      {!isHomePage && (
        <div
          className={`lg:hidden fixed inset-x-0 z-30 bg-white/85 backdrop-blur-xl backdrop-saturate-150 border-t border-white/60 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transform transition-all duration-300 ease-in-out ${
            isFooterVisible
              ? 'translate-y-28 opacity-0 pointer-events-none'
              : 'translate-y-0 opacity-100'
          }`}
          style={{
            bottom: 'calc(4rem + max(0.5rem, env(safe-area-inset-bottom, 0px)))',
          }}
        >
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-gray-950">
                ₹{Math.floor(product.price) === product.price
                  ? product.price.toLocaleString('en-IN')
                  : product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{Math.floor(product.originalPrice) === product.originalPrice
                    ? product.originalPrice.toLocaleString('en-IN')
                    : product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 font-medium truncate">
              Size: <strong className="text-gray-800">{selectedSize}</strong> • {selectedColour}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleAddToCart}
              className="py-2 px-3.5 rounded-full border border-red-600 bg-white/80 hover:bg-red-50 text-red-600 active:scale-95 text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              {addedToCart ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{addedToCart ? 'Added' : 'Add to Cart'}</span>
            </button>
            <button
              type="button"
              onClick={handleBuyItNow}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs py-2 px-4 rounded-full shadow-md transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
