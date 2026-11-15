import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Award, Compass, ShieldCheck, MapPin, ExternalLink, Navigation, Building2 } from 'lucide-react';
import QuotationInquiryForm from '@/components/home/QuotationInquiryForm';

export const metadata = {
  title: 'About KOSKOOL | Dedicated School Footwear & Accessories',
  description:
    'Learn about KOSKOOL — India’s dedicated brand for comfortable, durable, uniform-compliant school shoes and student accessories. Factory based in Bawana Industrial Area, Delhi.',
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Header */}
      <div className="relative bg-navy-950 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Every Step Begins with KOSKOOL.
          </h1>
          <p className="text-base sm:text-xl text-gray-300 font-normal max-w-2xl mx-auto leading-relaxed">
            A dedicated brand committed to empowering school students with footwear and accessories that combine all-day comfort, extreme durability, and strict school uniform compliance.
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Brand Introduction Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-brand-600">
                Welcome to KOSKOOL
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-navy-950 leading-tight">
                Designed for the Demands of Everyday School Life
              </h2>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              At <strong className="text-navy-950">KOSKOOL</strong>, we understand that school shoes aren’t just footwear—they are the silent companions to eight hours of standing at morning assembly, sprinting on dusty playgrounds, walking to the bus stop, and concentrating in classrooms.
            </p>

            <p className="text-sm text-gray-600 leading-relaxed">
              Unlike generic adult shoe brands that simply scale down adult shoes, KOSKOOL engineers footwear from scratch for growing anatomical arches. Our motto, <em className="text-navy-950 font-semibold">&quot;Aaao School Chale Hum&quot;</em>, encapsulates our mission to make every school morning exciting, pain-free, and full of confidence.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-2xl font-black text-brand-600">100%</span>
                <p className="text-xs font-bold text-navy-950 mt-1">School Uniform Compliant</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Approved across CBSE, ICSE &amp; State Boards</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-2xl font-black text-navy-950">1,000+</span>
                <p className="text-xs font-bold text-navy-950 mt-1">Hours Playground Tested</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Heavy-duty scuff-resistant materials</p>
              </div>
            </div>
          </div>

          <div className="relative h-96 lg:h-[460px] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-gray-100">
            <Image
              src="/cdn/shop/files/School-Banner_ed631f12-33bd-4c6d-94df-a5ffd9f8ba73.v_1767783342_width_5760.jpg"
              alt="KOSKOOL School Experience"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
              <div className="text-white space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-400">Aaao School Chale Hum</p>
                <h3 className="text-xl font-bold">From First Steps to Board Exams</h3>
                <p className="text-xs text-gray-300">Dedicated footwear for Kindergarten, Middle Wing, and Senior Wing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of KOSKOOL */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-brand-600">
              The KOSKOOL Difference
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-navy-950">
              Built on Comfort, Practicality &amp; Durability
            </h2>
            <p className="text-sm text-gray-600">
              Every design decision is guided by real school-ground testing and feedback from parents, teachers, and physical education instructors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-brand-600 flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-950">Orthopedic Comfort</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                High-rebound EVA footbeds, padded heel counters, and anti-bite collars safeguard soft ankles against blisters during 8+ hour school schedules.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-950">Rugged Durability</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Reinforced toe bumpers and high-abrasion TPR outsoles withstand football kicks, rainy puddles, and gravel assembly grounds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-950">Practical Everyday Use</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Quick-fasten dual velcro for kindergarteners learning self-reliance, and clean-lace oxfords for senior wing students. Easy to clean and polish.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-950">Parent-Friendly Pricing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Factory-direct pricing ensures parents never have to compromise on child foot health or uniform quality when kids outgrow sizes each term.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Factory & Manufacturing Heritage */}
      <section id="factory" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden relative shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Factory Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-brand-600/30 text-brand-300 text-xs font-bold px-3 py-1 rounded-full border border-brand-500/40">
                <Building2 className="w-3.5 h-3.5" />
                Direct Manufacturing Unit &amp; Plant
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Crafted with Precision at Our Delhi Manufacturing Facility
              </h2>

              <p className="text-sm text-gray-300 leading-relaxed">
                Every pair of KOSKOOL shoes is manufactured under stringent quality controls at our industrial plant located in <strong className="text-white">Sector 2, Bawana Industrial Area, Delhi</strong>. Under the guidance of owner <strong className="text-white">Vipul Singla</strong>, our factory uses modern molding and vulcanization technology to ensure consistent stitching, non-toxic glues, and superior bonding strength.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <strong className="block text-white font-bold text-sm">Factory Location</strong>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-brand-300 mt-1 block underline underline-offset-2 transition"
                    title="Open in Google Maps"
                  >
                    Sector 2, Bawana Industrial Area, Delhi ↗
                  </a>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <strong className="block text-white font-bold text-sm">Owner &amp; Founder</strong>
                  <span className="text-gray-300 mt-1 block">Vipul Singla</span>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <strong className="block text-white font-bold text-sm">Bulk &amp; Institutional Sales</strong>
                  <a href="tel:+918130458265" className="text-brand-300 hover:text-white mt-1 block font-bold">
                    +91 8130458265
                  </a>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3.5">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Factory in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
                <Link
                  href="/collections/boys"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-3 rounded-xl border border-white/20 transition flex items-center gap-2"
                >
                  Shop School Shoes
                </Link>
                <a
                  href="https://wa.me/918130458265?text=Hello%20KOSKOOL%2C%20I%20want%20to%20inquire%20about%20factory%20supply%20and%20location"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold px-5 py-3 rounded-xl border border-emerald-500/40 transition flex items-center gap-2"
                >
                  WhatsApp Direct Support
                </a>
              </div>
            </div>

            {/* Google Map Embedded Iframe Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-navy-900 group">
                {/* Header */}
                <div className="bg-navy-950 px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center gap-2 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span className="truncate">Sector 2, Bawana, Delhi</span>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 font-bold inline-flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Map iframe */}
                <div className="relative w-full h-72 sm:h-80 bg-navy-950">
                  <iframe
                    title="KOSKOOL Manufacturing Plant - Bawana Delhi"
                    src="https://maps.google.com/maps?q=Sector%202%2C%20Bawana%20Industrial%20Area%2C%20Delhi&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>

                {/* Footer bar */}
                <div className="bg-navy-950 px-4 py-2 text-[11px] text-gray-400 border-t border-white/10 flex items-center justify-between">
                  <span>Factory Direct Dispatch Unit</span>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Sector+2,+Bawana+Industrial+Area,+Delhi+110039"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* Institutional Quotation & Inquiry Form */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuotationInquiryForm />
      </section>
    </div>
  );
}
