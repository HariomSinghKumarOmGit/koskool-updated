'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';
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
  const { addToCart, openCartDrawer } = useCart();

  // Find featured or requested product
  const defaultProduct = PRODUCTS.find((p) => p.slug === 'mens-daily-wear-sandals-wgp53410-tan') || PRODUCTS[0];
  const product = initialProduct || defaultProduct;

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

  // Accordion state: by default closed as in screenshot 3 (+ icons)
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: false,
    additional: false,
    shipping: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColour, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyItNow = () => {
    addToCart(product, selectedSize, selectedColour, quantity);
    openCartDrawer();
  };

  // Color variants setup: use product variants, colours, or primaryColour without hardcoded fallbacks
  const colorVariants = React.useMemo(() => {
    if (product.colorVariants && product.colorVariants.length > 0) {
      return product.colorVariants;
    }
    if (product.colours && product.colours.length > 0) {
      return product.colours.map((name, i) => ({
        name,
        image: product.images[i] || product.images[0] || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
      }));
    }
    if (product.primaryColour) {
      return [{
        name: product.primaryColour,
        image: product.images[0] || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
      }];
    }
    return [];
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
    <div className={`bg-white ${isHomePage ? '' : 'min-h-screen'}`}>
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
          
          {/* ================= LEFT GALLERY: SCROLLABLE IMAGE LIST ================= */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
              <div className="flex items-center gap-1.5 pt-0.5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : i < (product.rating || 5)
                          ? 'fill-amber-300 text-amber-300'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-700 font-semibold ml-1">
                  {product.reviewCount ?? 100} reviews
                </span>
              </div>
            </div>

            {/* 4. Colour Swatches */}
            {colorVariants.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-xs text-gray-900 font-medium">
                  Colour: <span className="font-semibold text-gray-950">{selectedColour}</span>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {colorVariants.map((variant) => {
                    const isSelected = selectedColour.toLowerCase() === variant.name.toLowerCase();
                    return (
                      <button
                        key={variant.name}
                        type="button"
                        onClick={() => setSelectedColour(variant.name)}
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden bg-white p-1 transition-all flex items-center justify-center ${
                          isSelected
                            ? 'border-gray-900 shadow-sm ring-1 ring-gray-900'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        aria-label={`Select colour ${variant.name}`}
                        title={variant.name}
                      >
                        {variant.image ? (
                          <Image
                            src={variant.image}
                            alt={variant.name}
                            fill
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-gray-800 text-center px-1">
                            {variant.name}
                          </span>
                        )}
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
                className="flex-1 py-2.5 px-6 rounded-full border border-[#f05a50] text-[#f05a50] hover:bg-[#fff5f5] text-xs font-bold tracking-wide transition text-center flex items-center justify-center gap-1.5"
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
                className="w-full bg-[#f07167] hover:bg-[#e75a50] active:scale-[0.99] text-white font-bold text-sm py-3.5 px-6 rounded-full shadow-md hover:shadow-lg transition text-center tracking-wide"
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
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
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
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} on Walkaroo: ` + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-emerald-600 transition"
                  aria-label="Share on WhatsApp"
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

            {/* 10. Opening Tabs (Accordions): Description, Additional Information, Shipping & Returns */}
            <div className="divide-y divide-gray-200 border-t border-gray-200 pt-1">
              
              {/* Tab 1: Description */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-900 hover:text-[#f05a50] transition py-1"
                >
                  <span>Description</span>
                  <span className="text-gray-500 font-bold text-base">
                    {openAccordions.description ? '−' : '+'}
                  </span>
                </button>
                {openAccordions.description && (
                  <div className="pt-3 pb-2 text-xs text-gray-600 leading-relaxed space-y-3">
                    <p className="whitespace-pre-line">{product.description}</p>
                    {product.features && product.features.length > 0 && (
                      <div className="pt-2">
                        <strong className="text-gray-900 block pb-1">Key Features:</strong>
                        <ul className="list-disc pl-5 space-y-1">
                          {product.features.map((feat, i) => (
                            <li key={i}>{feat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tab 2: Additional Information */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('additional')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-900 hover:text-[#f05a50] transition py-1"
                >
                  <span>Additional Information</span>
                  <span className="text-gray-500 font-bold text-base">
                    {openAccordions.additional ? '−' : '+'}
                  </span>
                </button>
                {openAccordions.additional && (
                  <div className="pt-3 pb-2 text-xs text-gray-600 leading-relaxed space-y-2">
                    <p className="whitespace-pre-line">
                      {product.additionalInfo ||
                        'Manufactured by: Walkaroo International Pvt Ltd. Plot No 10-12, SIDCO Industrial Estate, Malumichampatti, Coimbatore - 641050 India\nCommodity - Footwear\nNumber of Commodity - 2N (1 Pair)\nCountry of Origin - India\nCustomer Care: 011-6119-7311 customercare@walkaroo.in'}
                    </p>
                  </div>
                )}
              </div>

              {/* Tab 3: Shipping and Returns */}
              <div className="py-3 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-900 hover:text-[#f05a50] transition py-1"
                >
                  <span>Shipping and Returns</span>
                  <span className="text-gray-500 font-bold text-base">
                    {openAccordions.shipping ? '−' : '+'}
                  </span>
                </button>
                {openAccordions.shipping && (
                  <div className="pt-3 pb-2 text-xs text-gray-600 leading-relaxed space-y-2">
                    <p className="whitespace-pre-line">
                      {product.shippingInfo ||
                        'This item is eligible for our 7 day easy return policy. No questions asked.\nEstimated time of delivery: 2 to 6 working days.\nFree shipping on prepaid orders over ₹499.'}
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

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
    </div>
  );
}
