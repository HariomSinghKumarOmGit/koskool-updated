'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getProductsByCollection, filterProductsByCollection, getCollectionTitle, Product, PRODUCTS } from '@/data/products';
import { getAllCatalogProducts, getCategories, getFootwearCategories } from '@/services/api';
import CategoryTemplate from '@/components/product/CategoryTemplate';

export default function CollectionPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'boys';

  const collectionInfo = getCollectionTitle(slug);
  const [dynamicCategory, setDynamicCategory] = useState<{ title: string; subtitle: string; badge?: string } | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);

  const loadCategoryMeta = useCallback(async () => {
    try {
      const [cats, fCats] = await Promise.all([getCategories(), getFootwearCategories()]);
      const match = cats.find((c) => c.slug === slug || c.id === slug);
      if (match) {
        setDynamicCategory({
          title: match.name,
          subtitle: match.description || (match.starting_price ? `Starts from ${match.starting_price}` : collectionInfo.subtitle),
          badge: match.badge || (match.starting_price ? `From ${match.starting_price}` : undefined),
        });
        return;
      }
      const fMatch = fCats.find((f) => f.id === slug || f.href.endsWith(`/${slug}`));
      if (fMatch) {
        setDynamicCategory({
          title: fMatch.title,
          subtitle: fMatch.subtitle,
          badge: fMatch.startingPrice ? `From ${fMatch.startingPrice}` : fMatch.tag,
        });
      }
    } catch {}
  }, [slug, collectionInfo.subtitle]);

  const loadProducts = useCallback(() => {
    getAllCatalogProducts().then((allDbProducts) => {
      if (allDbProducts && allDbProducts.length > 0) {
        setAllProducts(allDbProducts);
      }
    });
  }, []);

  useEffect(() => {
    loadCategoryMeta();
    loadProducts();

    const handleUpdate = () => {
      loadCategoryMeta();
      loadProducts();
    };

    window.addEventListener('koskool_products_updated', handleUpdate);
    window.addEventListener('koskool_categories_updated', handleUpdate);
    window.addEventListener('koskool_homepage_config_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('koskool_products_updated', handleUpdate);
      window.removeEventListener('koskool_categories_updated', handleUpdate);
      window.removeEventListener('koskool_homepage_config_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadCategoryMeta, loadProducts, slug]);

  // Initial filter criteria based on collection URL slug
  let initialGender: string | undefined = undefined;
  if (slug === 'boys' || slug.startsWith('boys-')) initialGender = 'boys';
  else if (slug === 'girls' || slug.startsWith('girls-')) initialGender = 'girls';
  else if (slug === 'kids' || slug.startsWith('kids-')) initialGender = 'kids';

  let initialProductType: string | undefined = undefined;
  if (slug.includes('school-shoes')) initialProductType = 'school-shoes';
  else if (slug.includes('sports-shoes')) initialProductType = 'sports-shoes';
  else if (slug.includes('fabric-shoes') || slug.includes('canvas')) initialProductType = 'fabric-shoes';
  else if (slug.includes('bag')) initialProductType = 'bags';
  else if (slug.includes('accessories')) initialProductType = 'accessories';

  let initialSchoolLevel: string | undefined = undefined;
  if (slug.includes('kindergarten')) initialSchoolLevel = 'kindergarten';
  else if (slug.includes('middle-wing')) initialSchoolLevel = 'middle-wing';
  else if (slug.includes('senior-wing')) initialSchoolLevel = 'senior-wing';

  const currentCollectionProducts = filterProductsByCollection(allProducts, slug);
  const displayProducts = currentCollectionProducts.length > 0
    ? currentCollectionProducts
    : allProducts.filter((p) => p.productType === slug || p.gender === slug || (p as any).category === slug);

  const displayTitle = dynamicCategory?.title || collectionInfo.title;
  const displaySubtitle = dynamicCategory?.subtitle || collectionInfo.subtitle;
  const displayBadge = dynamicCategory?.badge || 'Official Walkaroo & KOSKOOL';

  return (
    <CategoryTemplate
      title={displayTitle}
      subtitle={displaySubtitle}
      category={collectionInfo.category}
      badge={displayBadge}
      products={displayProducts}
      allCatalogProducts={allProducts}
      initialGender={initialGender}
      initialProductType={initialProductType}
      initialSchoolLevel={initialSchoolLevel}
      showBanner={true}
    />
  );
}
