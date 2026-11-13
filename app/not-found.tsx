import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-50 text-brand-600 font-black text-3xl">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-gray-500">
            Sorry, we couldn&apos;t find the school shoe, accessory, or page you were looking for.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/collections/boys"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Footwear</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
