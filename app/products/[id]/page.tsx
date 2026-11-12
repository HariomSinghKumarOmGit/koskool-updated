'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PRODUCTS, Product } from '@/data/products';
import ProductDetailView from '@/components/product/ProductDetailView';
import { getProductBySlugOrId } from '@/services/api';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = (params?.id as string) || '';

  // Initial immediate fallback for instant rendering
  const initialFallback =
    PRODUCTS.find((p) => p.slug === slug || p.id === slug) ||
    PRODUCTS[0];

  const [product, setProduct] = useState<Product>(initialFallback);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const liveProduct = await getProductBySlugOrId(slug);
        if (isMounted && liveProduct) {
          setProduct(liveProduct);
        }
      } catch (err) {
        console.warn('Could not load dynamic product from Supabase:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return <ProductDetailView product={product} isHomePage={false} />;
}
