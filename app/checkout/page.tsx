'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  CreditCard,
  ArrowRight,
  Lock,
  Tag,
  Check,
  User,
  AlertCircle,
} from 'lucide-react';
import { createOrder } from '@/services/api';

export default function CheckoutPage() {
  const { user, openAuthModal } = useAuth();
  const {
    items,
    subtotal,
    discountAmount,
    shippingCost,
    finalTotal,
    clearCart,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Delhi',
    pincode: '',
    paymentMethod: 'upi',
  });

  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ text: string; success: boolean } | null>(null);

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Autofill user details if signed in
  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || parts[0] || '',
        lastName: prev.lastName || parts.slice(1).join(' ') || 'Parent',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleApplyPromo = () => {
    if (!user) {
      openAuthModal(() => {
        const res = applyPromoCode(promoInput);
        setPromoMsg({ text: res.message, success: res.success });
        if (res.success) setPromoInput('');
      });
      return;
    }
    const res = applyPromoCode(promoInput);
    setPromoMsg({ text: res.message, success: res.success });
    if (res.success) setPromoInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal(() => handleSubmit(e));
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          selectedSize: i.selectedSize,
          selectedColour: i.selectedColour,
          quantity: i.quantity,
          image: i.product.images[0],
        })),
        subtotal,
        discount_amount: discountAmount,
        promo_code: appliedPromo?.code,
        shipping_cost: shippingCost,
        total_amount: finalTotal,
        payment_method: formData.paymentMethod,
      };

      const res = await createOrder(orderPayload);
      setOrderId(res.orderId);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center space-y-5 animate-scaleIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">
              KOSKOOL ORDER CONFIRMED
            </span>
            <h1 className="text-2xl font-black text-navy-950">Thank you for your order!</h1>
            <p className="text-xs text-gray-500">
              Order ID: <strong className="text-navy-950">{orderId}</strong>
            </p>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            A confirmation SMS &amp; email has been sent to <strong>{formData.email || 'your email'}</strong>. Your school package will be packed and dispatched from our factory in Sector 2, Bawana Industrial Area, Delhi within 24 hours.
          </p>

          <div className="space-y-2 pt-2">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3.5 px-6 rounded-xl shadow transition"
            >
              Continue Shopping
            </Link>
            <Link
              href="/track-order"
              className="w-full inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-navy-950 text-xs font-bold py-3 px-6 rounded-xl transition"
            >
              Track Your Package
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950">KOSKOOL Secure Checkout</h1>
            <p className="text-xs text-gray-500">School Uniform &amp; Accessories Direct Dispatch</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit Encrypted Checkout</span>
          </div>
        </div>

        {/* Auth prompt if not logged in */}
        {!user && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800">
              <User className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Have a KOSKOOL account or want to save your school sizes?{' '}
                <strong className="text-navy-950">Sign in for 1-click checkout.</strong>
              </span>
            </div>
            <button
              onClick={() => openAuthModal()}
              className="px-4 py-2 rounded-xl bg-navy-950 text-white font-bold text-xs shrink-0 hover:bg-navy-900 transition"
            >
              Sign In / Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            {/* Step 1: Contact */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider border-b border-gray-100 pb-2">
                1. Student &amp; Parent Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Student First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="e.g. Aarav"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Parent Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="e.g. Sharma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email (Order Updates) *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="parent@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number (WhatsApp Tracking) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider border-b border-gray-100 pb-2">
                2. Delivery Address
              </h2>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Flat / House No., Apartment, Street *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  placeholder="House 42, Pocket B, Rohini"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="Delhi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="110085"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider border-b border-gray-100 pb-2">
                3. Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)' },
                  { id: 'cod', label: 'Cash on Delivery (COD)' },
                  { id: 'card', label: 'Debit / Credit Card' },
                  { id: 'netbanking', label: 'Net Banking' },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition ${
                      formData.paymentMethod === pm.id
                        ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={formData.paymentMethod === pm.id}
                      onChange={() => setFormData({ ...formData, paymentMethod: pm.id })}
                      className="text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-navy-950">{pm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm py-4 px-6 rounded-xl shadow-xl hover:shadow-brand-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Placing Order in Supabase...' : `Place Order (₹${finalTotal})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider border-b border-gray-100 pb-3">
                Package Summary ({items.length} items)
              </h2>

              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="py-3 flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100 shrink-0">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-navy-950 truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        Size: {item.selectedSize} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-black text-navy-950">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo code field */}
              <div className="pt-2 border-t border-gray-100">
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{appliedPromo.code}: -₹{discountAmount} OFF</span>
                    </div>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-gray-400 hover:text-red-500 font-bold px-1"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Promo Code"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                      >
                        Apply
                      </button>
                    </div>
                    {promoMsg && (
                      <p className={`text-[10px] font-semibold ${promoMsg.success ? 'text-emerald-600' : 'text-red-500'}`}>
                        {promoMsg.text}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Promo Discount ({appliedPromo?.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Standard Shipping</span>
                  <span className="font-bold text-gray-900">
                    {shippingCost === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-navy-950 pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
