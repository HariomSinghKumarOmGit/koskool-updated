'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import ProductDetailView from '@/components/product/ProductDetailView';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = (params?.id as string) || '';

  const product =
    PRODUCTS.find((p) => p.slug === slug || p.id === slug) ||
    PRODUCTS.find((p) => p.slug === 'mens-daily-wear-sandals-wgp53410-tan') ||
    PRODUCTS[0];

  return <ProductDetailView product={product} isHomePage={false} />;
}
