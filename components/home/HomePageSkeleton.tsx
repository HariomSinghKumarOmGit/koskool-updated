import React from 'react';
import HeroSkeleton from './HeroSkeleton';

export default function HomePageSkeleton() {
  return (
    <div
      aria-label="Loading homepage..."
      className="flex flex-col min-h-screen overflow-x-hidden w-full max-w-full bg-white select-none animate-fadeIn"
    >
      {/* 1. Hero Slideshow Skeleton */}
      <HeroSkeleton />

      {/* 2. Marquee Ticker Skeleton */}
      <div className="w-full bg-brand-600/90 py-2.5 px-4 overflow-hidden">
        <div className="h-4 w-2/3 max-w-xl mx-auto bg-white/20 rounded-full animate-pulse" />
      </div>

      {/* 3. Shop by Footwear Category Skeleton */}
      <section className="py-8 sm:py-12 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="h-4 w-28 bg-gray-200 rounded-full animate-pulse mb-2" />
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-gray-100 rounded-md animate-pulse hidden sm:block" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center space-y-3"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-3 w-12 bg-gray-100 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Shop by School Level Skeleton */}
      <section className="py-8 sm:py-12 bg-gray-50 border-y border-gray-100 px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-8">
            <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse mx-auto mb-2" />
            <div className="h-8 w-72 bg-gray-200 rounded-lg animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4"
              >
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-44 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-12 w-full bg-gray-100 rounded-md animate-pulse" />
                <div className="h-40 w-full bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured / Popular Products Grid Skeleton */}
      <section className="py-8 sm:py-12 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse mb-2" />
            <div className="h-8 w-60 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col space-y-3"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-3 w-12 bg-gray-100 rounded-md animate-pulse" />
              </div>
              <div className="h-9 w-full bg-gray-100 rounded-xl animate-pulse mt-auto" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
