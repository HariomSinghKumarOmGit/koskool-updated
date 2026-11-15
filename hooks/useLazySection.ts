'use client';

/**
 * hooks/useLazySection.ts
 * ─────────────────────────────────────────────────────────────
 * Returns [ref, isVisible] where isVisible becomes true once the
 * element enters the viewport.  After it has been visible for
 * `unloadAfterMs` milliseconds of continuous INVISIBILITY it
 * resets to false so the section can unmount itself and free memory.
 *
 * Usage:
 *   const [ref, isVisible] = useLazySection<HTMLDivElement>();
 *   return <div ref={ref}>{isVisible && <HeavyContent />}</div>
 */

import { useEffect, useRef, useState, RefObject } from 'react';

interface Options {
  /** Root margin for the IntersectionObserver – defaults to '200px 0px' so we start loading slightly before the element enters view */
  rootMargin?: string;
  /** After how many ms of being off-screen should we unload? Set 0 to never unload. Default: 120_000 (2 min) */
  unloadAfterMs?: number;
  /** Percentage of element visible before triggering. Default: 0 */
  threshold?: number;
}

export function useLazySection<T extends HTMLElement = HTMLDivElement>(
  options: Options = {}
): [RefObject<T>, boolean] {
  const {
    rootMargin = '200px 0px',
    unloadAfterMs = 120_000,
    threshold = 0,
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const unloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBeenVisible = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // SSR / no support: just show everything
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Cancel any scheduled unload
          if (unloadTimer.current) {
            clearTimeout(unloadTimer.current);
            unloadTimer.current = null;
          }
          hasBeenVisible.current = true;
          setIsVisible(true);
        } else if (hasBeenVisible.current && unloadAfterMs > 0) {
          // Schedule unload only after the user has scrolled it away
          if (!unloadTimer.current) {
            unloadTimer.current = setTimeout(() => {
              setIsVisible(false);
              unloadTimer.current = null;
            }, unloadAfterMs);
          }
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (unloadTimer.current) {
        clearTimeout(unloadTimer.current);
        unloadTimer.current = null;
      }
    };
  }, [rootMargin, threshold, unloadAfterMs]);

  return [ref, isVisible];
}
