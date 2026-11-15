import React from 'react';

export default function HeroSkeleton() {
  return (
    <div
      aria-label="Loading hero banner..."
      className="relative w-full bg-gradient-to-b from-gray-50 via-rose-50/20 to-gray-50 select-none overflow-hidden border-b border-gray-100"
    >
      <div className="relative w-full aspect-[1000/1250] sm:aspect-[16/9] md:aspect-[5760/2345] max-h-[75vh] sm:max-h-[82vh] overflow-hidden bg-gradient-to-br from-gray-100 via-rose-50/30 to-gray-100">
        {/* Soft decorative red ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Animated shimmer sweep in clean white */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

        {/* Content placeholder area at bottom */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 md:p-16 pointer-events-none">
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            {/* Red accent badge pill */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-32 sm:w-44 bg-red-100 border border-red-200/80 rounded-full animate-pulse shadow-xs" />
            </div>

            {/* Title placeholders */}
            <div className="space-y-2">
              <div className="h-8 sm:h-12 w-3/4 max-w-lg bg-gray-200/90 rounded-xl animate-pulse" />
              <div className="h-6 sm:h-8 w-1/2 max-w-sm bg-gray-200/60 rounded-lg animate-pulse" />
            </div>

            {/* Subtitle placeholder */}
            <div className="h-4 sm:h-5 w-2/3 max-w-md bg-gray-200/50 rounded-md animate-pulse hidden sm:block" />

            {/* CTA Buttons in brand red and white */}
            <div className="flex gap-3 pt-2 sm:pt-4">
              <div className="h-10 sm:h-12 w-28 sm:w-36 bg-gradient-to-r from-brand-500 to-red-600 rounded-full animate-pulse shadow-sm shadow-red-500/20" />
              <div className="h-10 sm:h-12 w-28 sm:w-36 bg-white border border-gray-200 rounded-full animate-pulse shadow-xs" />
            </div>
          </div>
        </div>

        {/* Slide Indicator Dots skeleton */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 sm:py-1.5 rounded-full border border-gray-200/70 shadow-xs">
          <div className="w-6 h-2 bg-brand-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
