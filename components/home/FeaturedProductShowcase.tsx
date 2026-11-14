'use client';

import React, { useState, useEffect } from 'react';
import { PRODUCTS, Product } from '@/data/products';
import ProductDetailView from '@/components/product/ProductDetailView';
import { getFeaturedSpotlightConfig, getProductById, FeaturedSpotlightConfig } from '@/services/api';

export default function FeaturedProductShowcase() {
  const [product, setProduct] = useState<Product>(() =>
    PRODUCTS.find((p) => p.slug === 'mens-daily-wear-sandals-wgp53410-tan') || PRODUCTS[0]
  );
  const [config, setConfig] = useState<FeaturedSpotlightConfig>({
    productSlug: 'mens-daily-wear-sandals-wgp53410-tan',
    badge: 'Trending Product Spotlight',
    subtitle: 'Scroll images on left • Sticky order details on right',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadSpotlight() {
      try {
        const cfg = await getFeaturedSpotlightConfig();
        if (isMounted && cfg) {
          setConfig(cfg);
          if (cfg.productSlug) {
            const found = await getProductById(cfg.productSlug);
            if (isMounted && found) {
              setProduct(found);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load spotlight product:', e);
      }
    }

    loadSpotlight();

    const handleUpdate = () => {
      loadSpotlight();
    };

    window.addEventListener('koskool_homepage_config_updated', handleUpdate);
    window.addEventListener('koskool_data_updated', handleUpdate);
    window.addEventListener('koskool_products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('koskool_homepage_config_updated', handleUpdate);
      window.removeEventListener('koskool_data_updated', handleUpdate);
      window.removeEventListener('koskool_products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <section className="py-12 bg-white border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
          Featured Product
        </h2>
      </div>

      <ProductDetailView product={product} isHomePage={true} />
    </section>
  );
}
