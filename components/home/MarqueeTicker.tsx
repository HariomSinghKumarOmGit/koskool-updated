'use client';

import React from 'react';
import { ShieldCheck, Award, Heart, CheckCircle2 } from 'lucide-react';

export default function MarqueeTicker() {
  const items = [
    { text: 'AAAO SCHOOL CHALE HUM', icon: Heart },
    { text: 'KOSKOOL PREMIUM SCHOOL FOOTWEAR', icon: ShieldCheck },
    { text: 'CBSE & ICSE UNIFORM COMPLIANT', icon: Award },
    { text: 'HEAVY DUTY ANTI-SKID SOLES', icon: CheckCircle2 },
    { text: 'KINDERGARTEN • MIDDLE WING • SENIOR WING', icon: ShieldCheck },
    { text: 'ALL-INDIA FACTORY DISPATCH FROM DELHI', icon: Award },
  ];

  return (
    <div className="bg-brand-600 text-white py-3 overflow-hidden select-none border-y border-brand-700 shadow-inner">
      <div className="animate-marquee-scroll flex items-center whitespace-nowrap">
        {/* Double the list to ensure infinite seamless loop */}
        {[...items, ...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center mx-6 gap-3">
              <span className="font-black text-xs sm:text-sm tracking-widest uppercase">
                {item.text}
              </span>
              <Icon className="w-4 h-4 text-white/80 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
