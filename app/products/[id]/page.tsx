'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { PRODUCTS, Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';
import {
  Star,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Plus,
  Minus,
  Ruler,
  Building,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = (params?.id as string) || '';

  const product = PRODUCTS.find((p) => p.slug === slug || p.id === slug) || PRODUCTS[0];
  const { addToCart } = useCart();

  const [activeImage, setActiveImage] = useState(product.images[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.productType === product.productType || p.gender === product.gender)
  ).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, product.primaryColour, quantity);
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-600 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href={`/collections/${product.gender}`} className="capitalize hover:text-brand-600 transition">
            {product.gender}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href={`/collections/${product.productType}`} className="capitalize hover:text-brand-600 transition">
            {product.productType.replace('-', ' ')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-navy-950 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Gallery Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Image Preview */}
            <div className="relative aspect-square sm:aspect-[4/3] bg-gray-50 rounded-3xl overflow-hidden border border-gray-200 flex items-center justify-center p-8 shadow-sm">
              <Image
                src={activeImage || product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-contain p-6"
              />
              {product.discountPercent && (
                <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-black px-3 py-1 rounded-full shadow">
                  {product.discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-xl bg-gray-50 border-2 overflow-hidden shrink-0 transition ${
                      activeImage === img ? 'border-brand-600 shadow-md' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Actions & Specs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-900">
                  {product.brand}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Uniform Approved
                </span>
                {product.schoolLevel.map((lvl) => (
                  <span
                    key={lvl}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 capitalize"
                  >
                    {lvl.replace('-', ' ')}
                  </span>
                ))}
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl font-black text-navy-950 leading-snug">
                {product.name}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-xs font-bold text-gray-900">{product.rating}</span>
                </div>
                <span className="text-xs text-gray-500">{product.reviewCount} verified school reviews</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-3xl font-black text-navy-950">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-gray-400 line-through">₹{product.originalPrice}</span>
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                    Save ₹{product.originalPrice - product.price}
                  </span>
                </>
              )}
              <span className="text-[11px] text-gray-500 block ml-auto">Inclusive of all taxes</span>
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Select Size (UK/India)
                </span>
                <button
                  onClick={() => setShowSizeModal(true)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold border transition ${
                      selectedSize === sz
                        ? 'bg-navy-950 text-white border-navy-950 shadow-md'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-600 hover:bg-gray-100 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-gray-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-gray-600 hover:bg-gray-100 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white text-sm font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-brand-600/30 transition flex items-center justify-center gap-2 transform active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to School Cart</span>
                </button>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="space-y-2.5 pt-4 border-t border-gray-200 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Free delivery on orders over ₹999</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-brand-600 shrink-0" />
                <span>7-Day Hassle-Free Size Exchange for Growing Feet</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Factory Dispatch: Sector 2, Bawana Industrial Area, Delhi</span>
              </div>
            </div>

            {/* Description & Specs Tabs */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
                Product Details
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.description}
              </p>

              <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div>
                  <strong className="text-navy-950">Material:</strong>{' '}
                  <span className="text-gray-600">{product.material}</span>
                </div>
                {product.closureType && (
                  <div>
                    <strong className="text-navy-950">Closure:</strong>{' '}
                    <span className="text-gray-600">{product.closureType}</span>
                  </div>
                )}
                {product.capacity && (
                  <div>
                    <strong className="text-navy-950">Volume:</strong>{' '}
                    <span className="text-gray-600">{product.capacity}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related School Items */}
        {relatedProducts.length > 0 && (
          <div className="pt-16 border-t border-gray-200 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-navy-950">
              Recommended School Footwear &amp; Gear
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
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
              <h3 className="text-lg font-bold text-navy-950">KOSKOOL Footwear Size Chart</h3>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Measure your child’s foot length from heel to longest toe in centimeters.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-navy-950 text-white">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">UK/India</th>
                    <th className="p-2.5">Euro</th>
                    <th className="p-2.5">Foot Length (cm)</th>
                    <th className="p-2.5 rounded-r-lg">Recommended Wing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-2 font-bold">9C - 10C</td>
                    <td className="p-2">26 - 27</td>
                    <td className="p-2">16.5 - 17.2 cm</td>
                    <td className="p-2 text-brand-600 font-semibold">Kindergarten</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">11C - 13C</td>
                    <td className="p-2">28 - 30</td>
                    <td className="p-2">17.8 - 19.1 cm</td>
                    <td className="p-2 text-brand-600 font-semibold">Kindergarten</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">1 - 3</td>
                    <td className="p-2">32 - 35</td>
                    <td className="p-2">20.5 - 22.0 cm</td>
                    <td className="p-2 text-blue-600 font-semibold">Middle Wing</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">4 - 6</td>
                    <td className="p-2">36 - 39</td>
                    <td className="p-2">22.8 - 24.5 cm</td>
                    <td className="p-2 text-blue-600 font-semibold">Middle Wing</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">7 - 10</td>
                    <td className="p-2">40 - 44</td>
                    <td className="p-2">25.4 - 28.0 cm</td>
                    <td className="p-2 text-emerald-600 font-semibold">Senior Wing</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowSizeModal(false)}
              className="w-full bg-navy-950 text-white text-xs font-bold py-2.5 rounded-xl shadow"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
