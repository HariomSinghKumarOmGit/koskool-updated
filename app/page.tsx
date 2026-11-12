import HeroSlideshow from '@/components/home/HeroSlideshow';
import MarqueeTicker from '@/components/home/MarqueeTicker';
import ShopByFootwear from '@/components/home/ShopByFootwear';
import QuickAddToCartSection from '@/components/home/QuickAddToCartSection';
import ShopBySchoolLevel from '@/components/home/ShopBySchoolLevel';
import SchoolBundlesSection from '@/components/home/SchoolBundlesSection';
import ExploreAccessories from '@/components/home/ExploreAccessories';
import PopularBags from '@/components/home/PopularBags';
import PopularSchoolPicks from '@/components/home/PopularSchoolPicks';
import SchoolTrustReviews from '@/components/home/SchoolTrustReviews';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* 1. Hero Banner Slideshow */}
      <HeroSlideshow />

      {/* 2. Marquee Ticker */}
      <MarqueeTicker />

      {/* 3. Shop by Footwear (Interactive Left/Right Arrow Carousel) */}
      <ShopByFootwear />

      {/* 4. Dedicated Add to Cart Section with Live Admin Promo Code Discounts */}
      <QuickAddToCartSection />

      {/* 5. Shop by School Level (Interactive Left/Right Arrow Carousel) */}
      <ShopBySchoolLevel />

      {/* 6. Curated Uniform Bundles (1-Click Add Complete Kit to Cart) */}
      <SchoolBundlesSection />

      {/* 7. Explore Accessories (Interactive Left/Right Arrow Carousel) */}
      <ExploreAccessories />

      {/* 8. Popular School Bags (Interactive Left/Right Arrow Carousel) */}
      <PopularBags />

      {/* 9. Popular School Picks (Interactive Tabs & Left/Right Arrow Carousel) */}
      <PopularSchoolPicks />

      {/* 10. School Trust & Parent Reviews */}
      <SchoolTrustReviews />
    </div>
  );
}
