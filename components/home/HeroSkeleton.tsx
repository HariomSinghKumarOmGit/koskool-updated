import React from 'react';

export default function HeroSkeleton() {
  return (
    <div
      aria-label="Loading hero banner..."
      className="relative w-full bg-navy-950 select-none overflow-hidden"
    >
      <div className="relative w-full aspect-[1000/1250] sm:aspect-[16/9] md:aspect-[5760/2345] max-h-[75vh] sm:max-h-[82vh] overflow-hidden bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
        {/* Animated shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

        {/* Content placeholder area at bottom */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 md:p-16 pointer-events-none">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            {/* Badge pill */}
            <div className="h-6 w-32 sm:w-44 bg-white/10 rounded-full animate-pulse backdrop-blur-sm" />
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 sm:h-12 w-3/4 max-w-lg bg-white/10 rounded-xl animate-pulse" />
              <div className="h-6 sm:h-8 w-1/2 max-w-sm bg-white/5 rounded-lg animate-pulse" />
            </div>
            {/* Subtitle */}
            <div className="h-4 sm:h-5 w-2/3 max-w-md bg-white/10 rounded-md animate-pulse hidden sm:block" />
            {/* Buttons */}
            <div className="flex gap-3 pt-2 sm:pt-4">
              <div className="h-10 sm:h-12 w-28 sm:w-36 bg-brand-500/30 rounded-full animate-pulse" />
              <div className="h-10 sm:h-12 w-28 sm:w-36 bg-white/10 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Slide Indicator Dots skeleton */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1 sm:py-1.5 rounded-full">
          <div className="w-6 h-2 bg-brand-500/50 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
