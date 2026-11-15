'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account/login?redirect=/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
        Redirecting to Login...
      </p>
    </div>
  );
}
