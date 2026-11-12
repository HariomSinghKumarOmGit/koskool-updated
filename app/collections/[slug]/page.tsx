'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { getProductsByCollection, getCollectionTitle } from '@/data/products';
import CategoryTemplate from '@/components/product/CategoryTemplate';

export default function CollectionPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'boys';

  const collectionInfo = getCollectionTitle(slug);
  const products = getProductsByCollection(slug);

  return (
    <CategoryTemplate
      title={collectionInfo.title}
      subtitle={collectionInfo.subtitle}
      category={collectionInfo.category}
      badge="Official Walkaroo & KOSKOOL"
      products={products}
      showBanner={true}
    />
  );
}
