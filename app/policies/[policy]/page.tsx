'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShieldCheck, Truck, RotateCcw, HelpCircle, FileText, ChevronRight } from 'lucide-react';

export default function PolicyPage() {
  const params = useParams();
  const policy = (params?.policy as string) || 'shipping';

  const policyContent: Record<string, { title: string; subtitle: string; icon: any; content: React.ReactNode }> = {
    shipping: {
      title: 'Shipping & Delivery Policy',
      subtitle: 'Fast, secure doorstep delivery across all Indian cities and school districts.',
      icon: Truck,
      content: (
        <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
          <p>
            At <strong>KOSKOOL</strong>, every pair of school shoes, backpack, and student accessory is dispatched directly from our manufacturing hub in <strong>Sector 2, Bawana Industrial Area, Delhi</strong>.
          </p>
          <h4 className="font-bold text-sm text-navy-950 pt-2">Delivery Timelines</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Delhi NCR:</strong> Next-day or 2 business days delivery.</li>
            <li><strong>Metro Cities (Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad):</strong> 2 to 4 business days.</li>
            <li><strong>Rest of India &amp; Remote Districts:</strong> 4 to 6 business days.</li>
          </ul>
          <h4 className="font-bold text-sm text-navy-950 pt-2">Shipping Charges</h4>
          <p>
            Orders valued at <strong>₹500 and above</strong> qualify for <strong>FREE Delivery</strong> anywhere in India. For orders below ₹500, a flat delivery charge of ₹100 applies.
          </p>
        </div>
      ),
    },
    refund: {
      title: 'Return & Size Replacement Policy',
      subtitle: 'Hassle-free 7-day size exchanges for growing school feet.',
      icon: RotateCcw,
      content: (
        <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
          <p>
            We know children’s feet grow rapidly. If the size ordered does not fit perfectly, you can request an exchange within <strong>7 days</strong> of delivery.
          </p>
          <h4 className="font-bold text-sm text-navy-950 pt-2">Conditions for Return &amp; Exchange</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Shoes must be unworn outdoors with original tags and packaging intact.</li>
            <li>Size exchanges are processed free of charge for the first replacement.</li>
            <li>Refunds for eligible returns are credited back to the original payment source within 3-5 working days.</li>
          </ul>
          <p>
            To initiate an exchange, message our customer support on WhatsApp at <strong>+91 8130458265</strong> or email <strong>Koskoolshoes@gmail.com</strong>.
          </p>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'How KOSKOOL protects student and parent data.',
      icon: ShieldCheck,
      content: (
        <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
          <p>
            KOSKOOL respects customer privacy and maintains strict industry-standard 256-bit SSL encryption. We collect customer names, shipping addresses, phone numbers, and email addresses strictly for order fulfillment, courier delivery, and customer support.
          </p>
          <p>
            We do NOT sell, lease, or share customer contact details with third-party advertisers. All payment processing occurs through certified PCI-DSS compliant payment gateways.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms & Conditions',
      subtitle: 'Customer guidelines for orders, warranty, and brand purchases.',
      icon: FileText,
      content: (
        <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
          <p>
            By purchasing through <strong>KOSKOOL</strong>, you agree to these terms of service. All footwear and products are manufactured under strict uniform and durability standards.
          </p>
          <p>
            All intellectual property, photography, and brand materials belonging to KOSKOOL Shoes (Factory: Sector 2, Bawana Industrial Area, Delhi. Owner: Vipul Singla) are protected under Indian law.
          </p>
        </div>
      ),
    },
    faqs: {
      title: 'Frequently Asked Questions (FAQs)',
      subtitle: 'Common questions from parents about school shoes and accessories.',
      icon: HelpCircle,
      content: (
        <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
          <div>
            <h4 className="font-bold text-sm text-navy-950">Q: Are KOSKOOL shoes approved for CBSE and ICSE schools?</h4>
            <p className="mt-0.5">Yes! Our solid black formal shoes (derby, velcro, and Mary Jane) and pure white PT sports shoes meet standard uniform codes for morning assembly and drill inspection.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-navy-950">Q: How do I know which shoe size to buy for my child?</h4>
            <p className="mt-0.5">Please check our Size Chart on any product page. Measure your child’s foot length in centimeters and match it to our UK/India size guide.</p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-navy-950">Q: Can I place bulk orders for school institutions?</h4>
            <p className="mt-0.5">Yes, we provide institutional pricing for school management and bulk uniform suppliers. Contact Vipul Singla directly at +91 8130458265.</p>
          </div>
        </div>
      ),
    },
  };

  const selectedPolicy = policyContent[policy] || policyContent.shipping;
  const Icon = selectedPolicy.icon;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <nav className="flex items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-600 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-400">Policies</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-navy-950">{selectedPolicy.title}</span>
        </nav>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-navy-950">{selectedPolicy.title}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{selectedPolicy.subtitle}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">{selectedPolicy.content}</div>
        </div>
      </div>
    </div>
  );
}
