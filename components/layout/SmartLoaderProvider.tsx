'use client';

/**
 * SmartLoaderProvider.tsx
 * ─────────────────────────────────────────────────────────────
 * Root-level provider that:
 *  1. Listens to Next.js route changes via window.history
 *  2. Listens to Page Visibility API (tab switch / lock screen)
 *  3. Delegates to smartLoader.ts to evict stale caches
 *
 * Wrap your <body> content with this in app/layout.tsx
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  onRouteChange,
  onVisibilityHidden,
  onVisibilityVisible,
} from '@/lib/smartLoader';

export default function SmartLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1. React to route changes
  useEffect(() => {
    onRouteChange(pathname ?? '/');
  }, [pathname]);

  // 2. React to tab visibility
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'hidden') {
        onVisibilityHidden();
      } else {
        onVisibilityVisible();
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <>{children}</>;
}
