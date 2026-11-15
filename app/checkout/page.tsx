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
  MapPin,
  Plus,
  RotateCcw,
  Navigation,
} from 'lucide-react';
import {
  createOrder,
  getCustomerAddresses,
  saveCustomerAddress,
  CustomerAddress,
} from '@/services/api';
import GoogleMapsAddressPicker from '@/components/address/GoogleMapsAddressPicker';
import AddressCard from '@/components/address/AddressCard';

export default function CheckoutPage() {
  const { user, isVerified, openAuthModal, resendVerificationEmail, guestProfile, updateGuestProfile } = useAuth();
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

  // Guest Personal Information (Saved Locally)
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string>('');
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string>('');
  const [showNewShippingPicker, setShowNewShippingPicker] = useState(false);
  const [showNewBillingPicker, setShowNewBillingPicker] = useState(false);

  // Address Forms
  const [newShippingAddress, setNewShippingAddress] = useState<Partial<CustomerAddress>>({
    name: '',
    phone: '',
    house_flat: '',
    street_area: '',
    landmark: '',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '',
    country: 'India',
    address_type: 'shipping',
  });

  const [newBillingAddress, setNewBillingAddress] = useState<Partial<CustomerAddress>>({
    name: '',
    phone: '',
    house_flat: '',
    street_area: '',
    landmark: '',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '',
    country: 'India',
    address_type: 'billing',
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [saveShippingToProfile, setSaveShippingToProfile] = useState(true);
  const [saveBillingToProfile, setSaveBillingToProfile] = useState(true);

  // Payment & Promo
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card' | 'netbanking'>('cod');
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Order Submission State
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Reset window scroll position to top when checkout page opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Also reset to top when order confirmation is displayed
  useEffect(() => {
    if (orderPlaced) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [orderPlaced]);

  // Load Saved Addresses (locally for guest or Supabase for logged in)
  useEffect(() => {
    async function loadAddresses() {
      const targetUserId = user ? user.id : 'guest';
      setLoadingAddresses(true);
      try {
        const addresses = await getCustomerAddresses(targetUserId);

        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
          setSelectedShippingAddressId(defaultAddr.id);
          setSelectedBillingAddressId(defaultAddr.id);
          setShowNewShippingPicker(false);
        } else {
          setSavedAddresses([]);
          setShowNewShippingPicker(true);
        }
      } catch (err) {
        console.error('Failed to load customer addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }

    loadAddresses();
  }, [user]);

  // Initialize and sync guest personal information
  useEffect(() => {
    if (!user) {
      try {
        const saved = localStorage.getItem('koskool_guest_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          setGuestName(parsed.name || '');
          setGuestPhone(parsed.phone || '');
          setGuestEmail(parsed.email || '');
          setNewShippingAddress((prev) => ({
            ...prev,
            name: prev.name || parsed.name || '',
            phone: prev.phone || parsed.phone || '',
          }));
        } else if (guestProfile) {
          setGuestName(guestProfile.name || '');
          setGuestPhone(guestProfile.phone || '');
          setGuestEmail(guestProfile.email || '');
          setNewShippingAddress((prev) => ({
            ...prev,
            name: prev.name || guestProfile.name || '',
            phone: prev.phone || guestProfile.phone || '',
          }));
        }
      } catch {
        // ignore
      }
    }
  }, [user, guestProfile]);

  const handleGuestFieldChange = (field: 'name' | 'phone' | 'email', value: string) => {
    if (field === 'name') setGuestName(value);
    if (field === 'phone') setGuestPhone(value);
    if (field === 'email') setGuestEmail(value);

    const updated = {
      name: field === 'name' ? value : guestName,
      phone: field === 'phone' ? value : guestPhone,
      email: field === 'email' ? value : guestEmail,
    };

    try {
      localStorage.setItem('koskool_guest_profile', JSON.stringify(updated));
      updateGuestProfile(updated);
    } catch {
      // ignore
    }

    // Also sync to new address form if blank
    if (field === 'name') {
      setNewShippingAddress((prev) => ({ ...prev, name: prev.name ? prev.name : value }));
    }
    if (field === 'phone') {
      setNewShippingAddress((prev) => ({ ...prev, phone: prev.phone ? prev.phone : value }));
    }
  };

  // Autofill name and phone from profile when logged in
  useEffect(() => {
    if (user) {
      setNewShippingAddress((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
      setNewBillingAddress((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleApplyPromo = () => {
    const res = applyPromoCode(promoInput);
    setPromoMsg({ text: res.message, success: res.success });
    if (res.success) setPromoInput('');
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendingEmail(true);
    setResendStatus(null);
    try {
      const res = await resendVerificationEmail(user.email);
      if (res.success) {
        setResendStatus('Verification email sent! Please check your inbox and verify before ordering.');
      } else {
        setResendStatus(res.error || 'Failed to resend verification email.');
      }
    } catch {
      setResendStatus('Failed to send verification email.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Determine final customer details
    const finalCustomerName = (user?.name || guestName || newShippingAddress.name || '').trim();
    const finalCustomerPhone = (user?.phone || guestPhone || newShippingAddress.phone || '').trim();
    const finalCustomerEmail = (user?.email || guestEmail || '').trim();

    if (!finalCustomerName) {
      setSubmitError('Please enter your full name in the customer information section.');
      return;
    }
    if (!finalCustomerPhone) {
      setSubmitError('Please enter a valid phone number for shipping & delivery notifications.');
      return;
    }
    if (!finalCustomerEmail) {
      setSubmitError('Please enter an email address for order confirmation and receipts.');
      return;
    }

    // Email verification check for logged-in accounts
    if (user && !isVerified) {
      setSubmitError(
        'Email verification is required for registered accounts. Please click the link sent to ' +
          user.email +
          ' to verify your account.'
      );
      return;
    }

    // Resolve Shipping Address Snapshot
    let shippingSnapshot: CustomerAddress | any;
    if (!showNewShippingPicker && selectedShippingAddressId) {
      shippingSnapshot = savedAddresses.find((a) => a.id === selectedShippingAddressId);
    }

    if (!shippingSnapshot) {
      // Validate new shipping fields
      if (!newShippingAddress.street_area || !newShippingAddress.pincode) {
        setSubmitError('Please complete all required delivery address fields (Street / Area and PIN Code).');
        return;
      }

      shippingSnapshot = {
        id: `addr-${Date.now()}`,
        user_id: user ? user.id : 'guest',
        address_type: 'shipping',
        name: newShippingAddress.name || finalCustomerName,
        phone: newShippingAddress.phone || finalCustomerPhone,
        house_flat: newShippingAddress.house_flat || '',
        street_area: newShippingAddress.street_area,
        landmark: newShippingAddress.landmark || '',
        city: newShippingAddress.city || 'Delhi',
        state: newShippingAddress.state || 'Delhi',
        pincode: newShippingAddress.pincode,
        country: newShippingAddress.country || 'India',
        latitude: newShippingAddress.latitude || null,
        longitude: newShippingAddress.longitude || null,
        is_default: savedAddresses.length === 0,
      };

      // Save to profile (locally if guest, Supabase if logged in)
      if (saveShippingToProfile) {
        saveCustomerAddress(user ? user.id : 'guest', shippingSnapshot).catch(() => {});
      }
    }

    // Resolve Billing Address Snapshot
    let billingSnapshot: CustomerAddress | any;
    if (billingSameAsShipping) {
      billingSnapshot = { ...shippingSnapshot, address_type: 'billing' };
    } else {
      if (!showNewBillingPicker && selectedBillingAddressId) {
        billingSnapshot = savedAddresses.find((a) => a.id === selectedBillingAddressId);
      }
      if (!billingSnapshot) {
        if (!newBillingAddress.street_area || !newBillingAddress.pincode) {
          setSubmitError('Please complete all required billing address fields.');
          return;
        }

        billingSnapshot = {
          id: `addr-${Date.now()}-bill`,
          user_id: user ? user.id : 'guest',
          address_type: 'billing',
          name: newBillingAddress.name || finalCustomerName,
          phone: newBillingAddress.phone || finalCustomerPhone,
          house_flat: newBillingAddress.house_flat || '',
          street_area: newBillingAddress.street_area,
          landmark: newBillingAddress.landmark || '',
          city: newBillingAddress.city || 'Delhi',
          state: newBillingAddress.state || 'Delhi',
          pincode: newBillingAddress.pincode,
          country: newBillingAddress.country || 'India',
          latitude: newBillingAddress.latitude || null,
          longitude: newBillingAddress.longitude || null,
          is_default: false,
        };

        if (saveBillingToProfile) {
          saveCustomerAddress(user ? user.id : 'guest', billingSnapshot).catch(() => {});
        }
      }
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty. Please add products before checking out.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        user_id: user ? user.id : null,
        customer_name: finalCustomerName,
        customer_email: finalCustomerEmail,
        customer_phone: finalCustomerPhone,
        delivery_address: `${shippingSnapshot.house_flat ? shippingSnapshot.house_flat + ', ' : ''}${shippingSnapshot.street_area}`,
        shipping_address: shippingSnapshot,
        billing_address: billingSnapshot,
        city: shippingSnapshot.city || 'Delhi',
        state: shippingSnapshot.state || 'Delhi',
        pincode: shippingSnapshot.pincode || '110001',
        latitude: shippingSnapshot.latitude || null,
        longitude: shippingSnapshot.longitude || null,
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
        payment_method: paymentMethod,
        payment_status: (paymentMethod === 'cod' ? 'Pending' : 'Paid') as 'Pending' | 'Paid',
      };

      const res = await createOrder(orderPayload);
      setPlacedOrderDetails(res.order);
      setOrderPlaced(true);
      clearCart();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setSubmitError(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Order placed confirmation view
  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl text-center space-y-6 animate-scaleIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">
              ORDER CONFIRMED &amp; DISPATCH QUEUED
            </span>
            <h1 className="text-2xl font-black text-navy-950">Thank you for your order!</h1>
            <p className="text-xs text-gray-500">
              Unique Order Reference ID:{' '}
              <strong className="text-navy-950 font-mono text-sm">{placedOrderDetails.order_number}</strong>
            </p>
          </div>

          <div className="text-left bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Order Placed By:</span>
              <strong className="text-navy-950">{placedOrderDetails.customer_name}</strong>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Order Total:</span>
              <strong className="text-navy-950 text-sm">₹{placedOrderDetails.total_amount}</strong>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-bold uppercase text-navy-950">
                {placedOrderDetails.payment_method === 'cod' ? 'Cash on Delivery (COD)' : placedOrderDetails.payment_method}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-gray-500 block mb-1">Doorstep Delivery Address:</span>
              <p className="font-medium text-navy-950 leading-relaxed">
                {placedOrderDetails.delivery_address}, {placedOrderDetails.city}, {placedOrderDetails.state} -{' '}
                <span className="font-mono">{placedOrderDetails.pincode}</span>
              </p>
              {placedOrderDetails.latitude && placedOrderDetails.longitude && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-brand-600 font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>GPS Lat/Lng captured for courier routing</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            A confirmation receipt has been sent to <strong>{placedOrderDetails.customer_email}</strong>. Dispatches occur from Sector 2, Bawana Industrial Area, Delhi within 24 hours.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href={`/track-order?orderId=${placedOrderDetails.order_number}`}
              className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3.5 px-6 rounded-xl shadow transition"
            >
              <Truck className="w-4 h-4" />
              <span>Track Dispatch</span>
            </Link>

            <Link
              href="/account"
              className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-navy-950 text-xs font-bold py-3.5 px-6 rounded-xl transition"
            >
              View in My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfb] min-h-screen py-8 overflow-x-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Auth prompt if not logged in */}
        {!user ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <span>
                <strong>Guest Mode:</strong> You can place orders directly without signing in! All personal details and orders are saved locally on this device.{' '}
                <span className="text-gray-600">Want cloud sync across multiple devices?</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="px-4 py-2 rounded-xl bg-navy-950 text-white font-bold text-xs shrink-0 hover:bg-navy-900 transition self-start sm:self-auto shadow"
            >
              Sign In / Register
            </button>
          </div>
        ) : !isVerified ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs text-red-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-950 block text-sm">Email Verification Required</strong>
                  <p className="text-red-700">
                    A confirmation link was sent to <strong>{user.email}</strong>. As per order security policies, you must verify your email before placing an order.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingEmail}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resendingEmail ? 'Sending...' : 'Resend Email'}</span>
              </button>
            </div>
            {resendStatus && (
              <p className="text-[11px] font-bold text-red-900 bg-red-100 p-2 rounded-lg">
                {resendStatus}
              </p>
            )}
          </div>
        ) : null}

        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Step 1, 2, 3 */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Info */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
                  1. Customer Information
                </h2>
                {user ? (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Account (Cloud Synced)</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Saved Locally on Device</span>
                  </span>
                )}
              </div>

              {user ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Account Name</span>
                    <span className="font-bold text-navy-950 text-sm">{user.name || 'Valued Customer'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Email for Order Updates</span>
                    <span className="font-bold text-navy-950 text-sm">{user.email}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-gray-500">
                    Your personal information is saved locally on your browser. Enter your details to receive delivery updates.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => handleGuestFieldChange('name', e.target.value)}
                        placeholder="Parent / Student name"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => handleGuestFieldChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => handleGuestFieldChange('email', e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Shipping Address */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div>
                  <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
                    2. Shipping Address
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Where should we deliver your uniform and school supplies?
                  </p>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewShippingPicker(!showNewShippingPicker)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showNewShippingPicker ? 'Choose Saved Address' : 'Add New Address'}</span>
                  </button>
                )}
              </div>

              {/* Saved Shipping Addresses Selector */}
              {savedAddresses.length > 0 && !showNewShippingPicker ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    {savedAddresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        selectionMode
                        isSelected={selectedShippingAddressId === addr.id}
                        onSelect={() => setSelectedShippingAddressId(addr.id)}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNewShippingPicker(true)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:text-navy-950 hover:border-gray-400 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-brand-600" />
                    <span>Deliver to a New Address with Google Maps Location</span>
                  </button>
                </div>
              ) : (
                /* Google Maps Address Picker for Shipping */
                <div className="space-y-4">
                  <GoogleMapsAddressPicker
                    initialAddress={newShippingAddress}
                    onAddressChange={(updated) => setNewShippingAddress(updated)}
                    addressType="shipping"
                  />

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs pt-1">
                    <input
                      type="checkbox"
                      checked={saveShippingToProfile}
                      onChange={(e) => setSaveShippingToProfile(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span className="font-medium text-gray-700">
                      Save this shipping address {user ? 'to my profile (Cloud)' : 'locally on this device'} for future orders
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Step 3: Billing Address */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider">
                  3. Billing Address
                </h2>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="font-bold text-navy-950">
                  Billing address same as shipping address
                </span>
              </label>

              {!billingSameAsShipping && (
                <div className="pt-2 space-y-4 animate-fadeIn">
                  {savedAddresses.length > 0 && !showNewBillingPicker ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3">
                        {savedAddresses.map((addr) => (
                          <AddressCard
                            key={addr.id}
                            address={addr}
                            selectionMode
                            isSelected={selectedBillingAddressId === addr.id}
                            onSelect={() => setSelectedBillingAddressId(addr.id)}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowNewBillingPicker(true)}
                        className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-600 hover:text-navy-950 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 text-brand-600" />
                        <span>Enter Different Billing Address</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <GoogleMapsAddressPicker
                        initialAddress={newBillingAddress}
                        onAddressChange={(updated) => setNewBillingAddress(updated)}
                        addressType="billing"
                      />

                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs pt-1">
                        <input
                          type="checkbox"
                          checked={saveBillingToProfile}
                          onChange={(e) => setSaveBillingToProfile(e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                        />
                        <span className="font-medium text-gray-700">
                          Save this billing address {user ? 'to my profile (Cloud)' : 'locally on this device'}
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Order Items, Payment Methods, Confirm Button */}
          <div className="lg:col-span-5 space-y-6">
            {/* Order Items & Summary */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider border-b border-gray-100 pb-3">
                ORDER ITEMS ({items.length} ITEMS)
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
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>
                          {appliedPromo.code}: {discountAmount > 0 ? `-₹${discountAmount} OFF` : '₹0'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-gray-400 hover:text-red-500 font-bold px-1"
                      >
                        ×
                      </button>
                    </div>
                    {appliedPromo.minOrderValue > 0 && subtotal < appliedPromo.minOrderValue && (
                      <p className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        ⚠️ Min. order of ₹{appliedPromo.minOrderValue} required for this coupon.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="PROMO CODE"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
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

              {/* Price Breakdown */}
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
                  <span className="font-bold text-emerald-600">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-navy-950 pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>
            </div>

            {/* Step 4: Payment Methods */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-navy-950 uppercase tracking-wider border-b border-gray-100 pb-2">
                4. Select Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'cod',
                    label: 'Cash on Delivery (COD)',
                    desc: 'Pay in cash upon doorstep school package delivery',
                  },
                  {
                    id: 'upi',
                    label: 'Instant UPI',
                    desc: 'Google Pay, PhonePe, Paytm, BHIM QR',
                  },
                  {
                    id: 'card',
                    label: 'Debit / Credit Card',
                    desc: 'Visa, MasterCard, RuPay, Maestro',
                  },
                  {
                    id: 'netbanking',
                    label: 'Net Banking',
                    desc: 'All major Indian nationalized and private...',
                  },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition ${
                      paymentMethod === pm.id
                        ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id as any)}
                      className="text-brand-600 focus:ring-brand-500 w-4 h-4 mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-navy-950 block">{pm.label}</span>
                      <span className="text-[11px] text-gray-500 leading-tight block">{pm.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={Boolean(submitting || (user && !isVerified))}
              className="w-full bg-brand-600 hover:bg-brand-500 active:scale-[0.99] text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-xl hover:shadow-brand-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{submitting ? 'Creating Order in Supabase...' : `Confirm Order (₹${finalTotal})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
