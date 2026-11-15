import React from 'react';
import HeroSkeleton from './HeroSkeleton';

export default function HomePageSkeleton() {
  return (
    <div
      aria-label="Loading homepage..."
      className="flex flex-col min-h-screen overflow-x-hidden w-full max-w-full bg-white select-none animate-fadeIn"
    >
      {/* 1. Hero Slideshow Skeleton (Light with white/gray and red highlights) */}
      <HeroSkeleton />

      {/* 2. Marquee Ticker Skeleton (Red Bar with white/pink shimmer) */}
      <div className="w-full bg-gradient-to-r from-brand-600 via-red-500 to-brand-600 py-2.5 px-4 overflow-hidden shadow-xs">
        <div className="h-4 w-2/3 max-w-xl mx-auto bg-white/35 rounded-full animate-pulse" />
      </div>

      {/* 3. Shop by Footwear Category Skeleton */}
      <section className="py-8 sm:py-12 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="h-4 w-28 bg-red-100 border border-red-200/60 rounded-full animate-pulse mb-2" />
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-gray-100 rounded-md animate-pulse hidden sm:block" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 shadow-xs hover:border-red-100 transition-colors"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-gray-100 via-rose-50/40 to-gray-50 border border-gray-100 animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-12 bg-red-100 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Shop by School Level Skeleton */}
      <section className="py-8 sm:py-12 bg-gray-50/70 border-y border-gray-100 px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-8">
            <div className="h-4 w-32 bg-red-100 border border-red-200/60 rounded-full animate-pulse mx-auto mb-2" />
            <div className="h-8 w-72 bg-gray-200 rounded-lg animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs space-y-4"
              >
                <div className="h-6 w-24 bg-red-100 border border-red-200/70 rounded-full animate-pulse" />
                <div className="h-6 w-44 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
                <div className="h-40 w-full bg-gradient-to-br from-gray-100 via-rose-50/30 to-gray-100 rounded-xl animate-pulse border border-gray-100" />
                <div className="h-10 w-full bg-gradient-to-r from-brand-500 to-red-600 rounded-xl animate-pulse shadow-xs" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured / Popular Products Grid Skeleton */}
      <section className="py-8 sm:py-12 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="h-4 w-32 bg-red-100 border border-red-200/60 rounded-full animate-pulse mb-2" />
            <div className="h-8 w-60 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse hidden sm:block" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col space-y-3 shadow-xs hover:border-red-100 transition-colors"
            >
              {/* Product image placeholder with red discount tag */}
              <div className="w-full aspect-square bg-gradient-to-br from-gray-100 via-rose-50/30 to-gray-50 rounded-xl animate-pulse relative border border-gray-100 overflow-hidden">
                <div className="absolute top-2 left-2 h-5 w-12 bg-red-500/80 rounded-md animate-pulse" />
              </div>
              <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-red-100 rounded-md animate-pulse" />
                <div className="h-3 w-12 bg-gray-200 rounded-md animate-pulse" />
              </div>
              <div className="h-9 w-full bg-red-50 border border-red-200/80 rounded-xl animate-pulse mt-auto" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
