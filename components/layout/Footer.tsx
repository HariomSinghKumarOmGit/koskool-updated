'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-navy-950 text-gray-300 pt-16 pb-12 border-t border-navy-900">
      {/* Trust Highlights Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-navy-900">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Uniform Compliant</h4>
              <p className="text-xs text-gray-400 mt-0.5">Meets CBSE, ICSE &amp; State school regulations.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Heavy-Duty Tested</h4>
              <p className="text-xs text-gray-400 mt-0.5">Scuff-resistant soles made for playground stamina.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast All-India Shipping</h4>
              <p className="text-xs text-gray-400 mt-0.5">Direct dispatch from Bawana Industrial Area, Delhi.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy Size Exchanges</h4>
              <p className="text-xs text-gray-400 mt-0.5">Hassle-free 7-day size replacement for growing feet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Column 1: Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-wider">KOSKOOL</span>
              <span className="text-[11px] font-bold text-brand-400 tracking-widest uppercase">
                Aaao School Chale Hum
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed pr-4">
              KOSKOOL is India’s dedicated brand for durable, comfortable school footwear and everyday student accessories. Engineered to support children from kindergarten steps through high school milestones.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Factory:</strong> Sector 2, Bawana Industrial Area, Delhi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium pl-6">Owner:</span>
                <span className="text-gray-300">Vipul Singla</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+918130458265" className="hover:text-white transition">
                  +91 8130458265
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:Koskoolshoes@gmail.com" className="hover:text-white transition">
                  Koskoolshoes@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: ABOUT KOSKOOL */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-navy-800 pb-2">
              ABOUT KOSKOOL
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#story" className="hover:text-white transition">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/about#factory" className="hover:text-white transition">
                  Factory &amp; Manufacturing
                </Link>
              </li>
              <li>
                <Link href="/about#contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: SHOP FOOTWEAR */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-navy-800 pb-2">
              SHOP FOOTWEAR
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections/boys" className="hover:text-white transition">
                  Boys Footwear
                </Link>
              </li>
              <li>
                <Link href="/collections/girls" className="hover:text-white transition">
                  Girls Footwear
                </Link>
              </li>
              <li>
                <Link href="/collections/school-shoes" className="hover:text-white transition">
                  School Shoes
                </Link>
              </li>
              <li>
                <Link href="/collections/sports-shoes" className="hover:text-white transition">
                  Sports Shoes
                </Link>
              </li>
              <li>
                <Link href="/collections/fabric-shoes" className="hover:text-white transition">
                  Fabric Shoes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: ACCESSORIES & BAGS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-navy-800 pb-2">
              ACCESSORIES &amp; BAGS
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collections/boys-accessories" className="hover:text-white transition">
                  Boys Accessories
                </Link>
              </li>
              <li>
                <Link href="/collections/girls-accessories" className="hover:text-white transition">
                  Girls Accessories
                </Link>
              </li>
              <li>
                <Link href="/collections/kids-accessories" className="hover:text-white transition">
                  Kids Accessories
                </Link>
              </li>
              <li>
                <Link href="/collections/school-backpacks" className="hover:text-white transition">
                  School Backpacks
                </Link>
              </li>
              <li>
                <Link href="/collections/multi-compartment-bags" className="hover:text-white transition">
                  Multi-Compartment Bags
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: SCHOOL COLLECTIONS & SUPPORT */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-navy-800 pb-2">
              CUSTOMER SUPPORT
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-order" className="hover:text-white transition">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/refund" className="hover:text-white transition">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-white transition">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/faqs" className="hover:text-white transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-navy-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-bold text-white">Join the KOSKOOL School Club</h4>
            <p className="text-xs text-gray-400">
              Get back-to-school discount codes, size guides &amp; uniform tips straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="px-4 py-2 text-xs rounded-xl bg-navy-900 border border-navy-800 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 flex-1 md:w-64"
            />
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow flex items-center gap-1 shrink-0"
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
              {!subscribed && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        {/* Bottom copyright & Socials */}
        <div className="mt-10 pt-6 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 KOSKOOL. Owner: Vipul Singla. Factory: Sector 2, Bawana Industrial Area, Delhi. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/918130458265"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-emerald-400 transition"
              title="WhatsApp KOSKOOL"
            >
              WhatsApp
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-400 transition"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition"
            >
              Facebook
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-red-400 transition"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
