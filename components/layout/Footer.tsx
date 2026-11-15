'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Building2,
  Navigation,
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
    <footer className="bg-navy-950 text-gray-300 pt-16 pb-12 border-t border-navy-900 w-full max-w-full overflow-hidden">
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
                <div>
                  <span className="text-white font-semibold">Factory Address:</span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-300 hover:text-brand-400 transition underline underline-offset-2 mt-0.5"
                    title="Open Factory in Google Maps"
                  >
                    Sector 2, Bawana Industrial Area, Delhi - 110039 ↗
                  </a>
                </div>
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
                <Link href="/account" className="hover:text-white transition">
                  My Account
                </Link>
              </li>
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

        {/* Factory Location & Interactive Google Map Showcase */}
        <div className="mt-12 pt-8 border-t border-navy-900">
          <div className="bg-navy-900/60 border border-navy-800/80 rounded-2xl p-5 sm:p-7 backdrop-blur-sm shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Factory Address and Info */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-400 text-xs font-bold px-3 py-1 rounded-full border border-brand-500/20">
                    <Building2 className="w-3.5 h-3.5" />
                    Factory &amp; Manufacturing Unit
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Direct Dispatch
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Visit or Locate Our Factory
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    All KOSKOOL school shoes, sports footwear, and student backpacks are manufactured and dispatched directly from our Bawana Industrial Unit in Delhi.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs bg-navy-950/60 border border-navy-800/60 rounded-xl p-3.5">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-bold block">Factory Address:</span>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-brand-400 transition font-medium inline-flex items-center gap-1 mt-0.5 group"
                      >
                        <span>Sector 2, Bawana Industrial Area, Delhi - 110039, India</span>
                        <ExternalLink className="w-3 h-3 text-brand-400 opacity-80 group-hover:opacity-100 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1 border-t border-navy-800/60">
                    <span className="text-white font-semibold">Owner &amp; Operations:</span>
                    <span className="text-gray-300">Vipul Singla</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span className="text-white font-semibold">Inquiries / Dispatch:</span>
                    <a href="tel:+918130458265" className="text-gray-300 hover:text-white transition font-medium">
                      +91 8130458265
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                  <a
                    href="https://wa.me/918130458265?text=Hello%20KOSKOOL%2C%20I%20am%20inquiring%20about%20the%20factory%20location%20and%20orders."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                  >
                    <span>WhatsApp Factory</span>
                  </a>
                </div>
              </div>

              {/* Google Maps Embed with Click-to-Open Overlay */}
              <div className="lg:col-span-7">
                <div className="relative rounded-xl overflow-hidden border border-navy-700/80 shadow-2xl bg-navy-950 group">
                  {/* Top Bar on Map */}
                  <div className="bg-navy-950 px-4 py-2.5 border-b border-navy-800 flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center gap-2 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                      <span className="truncate">Sector 2, Bawana Industrial Area, Delhi</span>
                    </div>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 hover:text-brand-300 font-bold inline-flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>Open Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Responsive Iframe */}
                  <div className="relative w-full h-64 sm:h-72 bg-navy-950">
                    <iframe
                      title="KOSKOOL Factory Location Map - Bawana Industrial Area"
                      src="https://maps.google.com/maps?q=Sector%202%2C%20Bawana%20Industrial%20Area%2C%20Delhi&t=&z=14&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full border-0"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>

                  {/* Map Footer Bar with Direct Link */}
                  <div className="bg-navy-950/90 px-4 py-2 border-t border-navy-800/80 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Click map or button to get live directions</span>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <span>View in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
          <p>
            © 2026 KOSKOOL. Owner: Vipul Singla. Factory:{' '}
            <a
              href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-brand-400 underline underline-offset-2 transition"
              title="Open factory in Google Maps"
            >
              Sector 2, Bawana Industrial Area, Delhi
            </a>
            . All rights reserved.
          </p>

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
