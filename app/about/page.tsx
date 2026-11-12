import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Heart,
  Target,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';

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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/30 text-brand-300 text-xs font-black uppercase tracking-wider border border-brand-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            Our Mission &amp; Purpose
          </div>
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
        <div className="bg-navy-950 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-brand-600/30 text-brand-300 text-xs font-bold px-3 py-1 rounded-full border border-brand-500/40">
              <MapPin className="w-3.5 h-3.5" />
              Direct Manufacturing Unit
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Crafted with Precision at Our Delhi Manufacturing Facility
            </h2>

            <p className="text-sm text-gray-300 leading-relaxed">
              Every pair of KOSKOOL shoes is manufactured under stringent quality controls at our industrial plant located in <strong className="text-white">Sector 2, Bawana Industrial Area, Delhi</strong>. Under the guidance of owner <strong className="text-white">Vipul Singla</strong>, our factory uses modern molding and vulcanization technology to ensure consistent stitching, non-toxic glues, and superior bonding strength.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <strong className="block text-white font-bold text-sm">Factory Location</strong>
                <span className="text-gray-300 mt-1 block">Sector 2, Bawana Industrial Area, Delhi</span>
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

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/collections/boys"
                className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg transition"
              >
                Shop School Shoes
              </Link>
              <a
                href="https://wa.me/918130458265"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-6 py-3 rounded-xl border border-white/20 transition"
              >
                WhatsApp Direct Support
              </a>
            </div>
          </div>

          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
