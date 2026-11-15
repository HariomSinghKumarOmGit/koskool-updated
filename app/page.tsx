'use client';

import React, { useState, useEffect } from 'react';
import HeroSlideshow from '@/components/home/HeroSlideshow';
import MarqueeTicker from '@/components/home/MarqueeTicker';
import ShopByFootwear from '@/components/home/ShopByFootwear';
import ShopBySchoolLevel from '@/components/home/ShopBySchoolLevel';
import ExploreAccessories from '@/components/home/ExploreAccessories';
import PopularBags from '@/components/home/PopularBags';
import PopularSchoolPicks from '@/components/home/PopularSchoolPicks';
import FeaturedProductShowcase from '@/components/home/FeaturedProductShowcase';
import BannerSectionShowcase from '@/components/home/BannerSectionShowcase';
import SchoolTrustReviews from '@/components/home/SchoolTrustReviews';
import HomePageSkeleton from '@/components/home/HomePageSkeleton';
import { getHomepageSections, HomepageSection, DEFAULT_HOMEPAGE_SECTIONS } from '@/services/api';

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: HeroSlideshow,
  marquee: MarqueeTicker,
  shop_footwear: ShopByFootwear,
  school_level: ShopBySchoolLevel,
  explore_accessories: ExploreAccessories,
  popular_bags: PopularBags,
  popular_picks: PopularSchoolPicks,
  featured_spotlight: FeaturedProductShowcase,
  banner_showcase: BannerSectionShowcase,
  trust_reviews: SchoolTrustReviews,
};

export default function HomePage() {
  const [sections, setSections] = useState<HomepageSection[]>(DEFAULT_HOMEPAGE_SECTIONS);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSections = async () => {
      try {
        const secs = await getHomepageSections();
        if (isMounted && secs && secs.length > 0) {
          setSections(secs);
        }
      } catch (err) {
        console.error('Failed to load dynamic homepage sections:', err);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    fetchSections();

    // Listen for live updates from Admin Panel
    const handleUpdate = () => {
      fetchSections();
    };

    window.addEventListener('koskool_homepage_config_updated', handleUpdate);
    window.addEventListener('koskool_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('koskool_homepage_config_updated', handleUpdate);
      window.removeEventListener('koskool_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (isInitializing) {
    return <HomePageSkeleton />;
  }

  // Filter only active sections and render in ordered sequence
  const activeSections = sections
    .filter((sec) => sec.is_active !== false)
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full max-w-full animate-fadeIn">
      {activeSections.map((sec) => {
        const Component = SECTION_COMPONENTS[sec.id];
        if (!Component) return null;
        return <Component key={sec.id} />;
      })}
    </div>
  );
}
