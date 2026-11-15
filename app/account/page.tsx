'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  MapPin,
  Package,
  Truck,
  CreditCard,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Check,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  KeyRound,
  RotateCcw,
  Clock,
  Navigation,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  CustomerAddress,
  Order,
  OrderTrackingUpdate,
  OrderStatus,
  getCustomerAddresses,
  saveCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  getOrders,
  getOrderByIdOrNumber,
} from '@/services/api';
import AddressCard from '@/components/address/AddressCard';
import GoogleMapsAddressPicker from '@/components/address/GoogleMapsAddressPicker';

type TabType = 'profile' | 'addresses' | 'billing' | 'orders' | 'tracking';

const ORDER_STEPS: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'In Transit',
  'Out for Delivery',
  'Delivered',
];

function AccountContent() {
  const router = useRouter();
  const {
    user,
    guestProfile,
    isAdmin,
    isVerified,
    isLoading: authLoading,
    updateProfile,
    updatePassword,
    resendVerificationEmail,
    openAuthModal,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('orders');

  // Customer Data State
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Address modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Partial<CustomerAddress> | null>({
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
    is_default: false,
  });
  const [addressModalType, setAddressModalType] = useState<'shipping' | 'billing' | 'both'>('shipping');

  // Order Details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Shipment Tracking modal
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingSearchInput, setTrackingSearchInput] = useState('');
  const [trackingError, setTrackingError] = useState('');

  // Profile Edit states
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Password Update states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Email verification resend
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Sync profile fields from user or local storage
  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setPhoneInput(user.phone || '');
      setEmailInput(user.email || '');
    } else {
      try {
        const saved = localStorage.getItem('koskool_guest_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          setNameInput(parsed.name || '');
          setPhoneInput(parsed.phone || '');
          setEmailInput(parsed.email || '');
        } else if (guestProfile) {
          setNameInput(guestProfile.name || '');
          setPhoneInput(guestProfile.phone || '');
          setEmailInput(guestProfile.email || '');
        }
      } catch {
        // ignore
      }
    }
  }, [user, guestProfile]);

  // Load addresses and orders (from Supabase if logged in, local storage if guest)
  const loadCustomerData = async () => {
    setLoadingData(true);
    try {
      const targetUserId = user ? user.id : 'guest';
      const [addrList, orderList] = await Promise.all([
        getCustomerAddresses(targetUserId),
        user ? getOrders({ userId: user.id }) : getOrders({ isGuest: true }),
      ]);
      setAddresses(addrList);
      setOrders(orderList);
    } catch (err) {
      console.error('Failed to load account data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [user]);

  // Listen for broadcast data updates (e.g. from admin panel updates)
  useEffect(() => {
    const handleUpdate = () => {
      loadCustomerData();
    };
    window.addEventListener('koskool_data_updated', handleUpdate);
    return () => window.removeEventListener('koskool_data_updated', handleUpdate);
  }, [user]);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await updateProfile({
        name: nameInput,
        phone: phoneInput,
        email: emailInput,
      });
      if (res.success) {
        setProfileMsg({
          text: user
            ? 'Profile updated successfully and synced with cloud!'
            : 'Personal information saved locally on this browser!',
          success: true,
        });
      } else {
        setProfileMsg({ text: res.error || 'Failed to update profile.', success: false });
      }
    } catch (err: any) {
      setProfileMsg({ text: err?.message || 'Error saving profile.', success: false });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters long.', success: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Passwords do not match.', success: false });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setPasswordMsg({ text: 'Password changed successfully!', success: true });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ text: res.error || 'Failed to update password.', success: false });
      }
    } catch (err: any) {
      setPasswordMsg({ text: err?.message || 'Error updating password.', success: false });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Email Verification Resend
  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendingEmail(true);
    setResendStatus(null);
    try {
      const res = await resendVerificationEmail(user.email);
      if (res.success) {
        setResendStatus(`Verification email resent to ${user.email}. Please check your inbox.`);
      } else {
        setResendStatus(res.error || 'Failed to resend verification email.');
      }
    } catch {
      setResendStatus('Failed to send verification email.');
    } finally {
      setResendingEmail(false);
    }
  };

  // Address Handlers
  const handleOpenAddAddress = (type: 'shipping' | 'billing' | 'both' = 'shipping') => {
    setAddressModalType(type);
    setEditingAddress({
      name: user?.name || '',
      phone: user?.phone || '',
      address_type: type,
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      is_default: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setAddressModalType(addr.address_type);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const targetUserId = user ? user.id : 'guest';
      await deleteCustomerAddress(targetUserId, addressId);
      loadCustomerData();
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const targetUserId = user ? user.id : 'guest';
    await setDefaultCustomerAddress(targetUserId, addressId);
    loadCustomerData();
  };

  const handleSaveAddressModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;

    if (!editingAddress.name || !editingAddress.phone || !editingAddress.street_area || !editingAddress.pincode) {
      alert('Please fill out all required address fields.');
      return;
    }

    const targetUserId = user ? user.id : 'guest';
    await saveCustomerAddress(targetUserId, {
      ...editingAddress,
      address_type: addressModalType,
    });

    setShowAddressModal(false);
    setEditingAddress(null);
    loadCustomerData();
  };

  // Track specific order lookup
  const handleSearchTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingSearchInput.trim()) return;
    setTrackingError('');

    const found = await getOrderByIdOrNumber(trackingSearchInput.trim(), user?.id);
    if (found) {
      setTrackingOrder(found);
    } else {
      setTrackingError(`No order found matching "${trackingSearchInput}". Please check your Order ID.`);
    }
  };

  const getStatusBadgeClass = (st: OrderStatus) => {
    switch (st) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Shipped':
      case 'In Transit':
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing':
      case 'Packed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500">Loading your account...</p>
        </div>
      </div>
    );
  }

  const shippingAddresses = addresses.filter((a) => a.address_type === 'shipping' || a.address_type === 'both');
  const billingAddresses = addresses.filter((a) => a.address_type === 'billing' || a.address_type === 'both');

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-navy-950 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {user ? (user.name || 'K')[0].toUpperCase() : (nameInput ? nameInput[0].toUpperCase() : 'G')}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-navy-950">
                  {user ? (user.name || 'Valued Customer') : (nameInput || 'Guest Customer')}
                </h1>
                {isAdmin && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Authorized
                  </span>
                )}
                {user ? (
                  isVerified ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Email Verified (Supabase Cloud)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Unverified Email</span>
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Saved Locally on this Device</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-mono">
                {user
                  ? `${user.email} ${user.phone ? `• ${user.phone}` : ''}`
                  : `${emailInput || 'No email saved yet'} ${phoneInput ? `• ${phoneInput}` : ''}`}
              </p>
              <p className="text-[11px] text-gray-400">
                {user ? (
                  <>Customer Account ID: <code className="text-navy-950 font-bold">{user.id}</code></>
                ) : (
                  <>Storage Mode: <code className="text-blue-700 font-bold">Local Device Storage (No Account Required)</code></>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow"
              >
                Open Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  router.replace('/');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-navy-950 text-xs font-bold transition shadow-sm"
              >
                <LogOut className="w-4 h-4 text-gray-500" />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition shadow"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Guest Mode Banner */}
        {!user && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm text-navy-950">Local Storage Active (Guest Mode)</strong>
                <span>
                  All your personal details, delivery addresses, and orders placed on this device are saved safely in your local browser storage. You can sign in anytime to sync to Supabase across all your devices.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs shrink-0 transition shadow self-start sm:self-auto"
            >
              Sign In to Cloud
            </button>
          </div>
        )}

        {/* Verification Alert if unverified */}
        {user && !isVerified && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm text-navy-950">Email Verification Mandatory</strong>
                <span>
                  Please click the activation link sent to <strong>{user.email}</strong> to verify your account. Unverified accounts cannot place orders.
                </span>
                {resendStatus && <p className="text-emerald-700 font-bold mt-1">{resendStatus}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingEmail}
              className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shrink-0 transition flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resendingEmail ? 'Sending...' : 'Resend Verification'}</span>
            </button>
          </div>
        )}

        {/* Dashboard Grid Navigation + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-gray-200 shadow-sm space-y-1">
            {[
              { id: 'orders', label: 'My Orders', icon: Package, badge: orders.length },
              { id: 'addresses', label: 'My Addresses', icon: MapPin, badge: addresses.length },
              { id: 'billing', label: 'My Billing Details', icon: CreditCard },
              { id: 'tracking', label: 'Shipment Tracking', icon: Truck },
              { id: 'profile', label: 'My Profile', icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-navy-950 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-navy-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-navy-950">My School Orders</h2>
                    <p className="text-xs text-gray-500">
                      Track status, dispatches, and delivery updates for all your school uniform purchases.
                    </p>
                  </div>
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow"
                  >
                    Shop More
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                      <Package className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-navy-950">No orders placed yet</h3>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Explore uniform footwear, bags, and student accessories with direct delivery from Bawana factory.
                      </p>
                    </div>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-navy-950 text-white text-xs font-bold transition hover:bg-navy-900"
                    >
                      Browse Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4 hover:border-gray-300 transition"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-black text-navy-950">
                                {ord.order_number}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                                  ord.status
                                )}`}
                              >
                                {ord.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 block pt-0.5">
                              Placed on {new Date(ord.created_at).toLocaleDateString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 text-navy-950 font-bold text-xs transition inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setTrackingOrder(ord)}
                              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Track Order</span>
                            </button>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {ord.items.slice(0, 4).map((it, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                              <div className="w-12 h-12 bg-white rounded-xl relative overflow-hidden border border-gray-200 shrink-0">
                                <Image
                                  src={it.image || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                                  alt={it.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-navy-950 truncate">{it.name}</h4>
                                <p className="text-[11px] text-gray-500">
                                  Size: {it.selectedSize} • Qty: {it.quantity}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-navy-950 shrink-0">
                                ₹{it.price * it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                          <div>
                            <span>Payment: </span>
                            <strong className="text-navy-950 uppercase">{ord.payment_method}</strong>
                            <span className="text-[11px] text-gray-400"> ({ord.payment_status || 'Pending'})</span>
                          </div>
                          <div>
                            <span>Total Amount: </span>
                            <strong className="text-navy-950 text-sm font-black">₹{ord.total_amount}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-navy-950">Saved Delivery Addresses</h2>
                    <p className="text-xs text-gray-500">
                      Manage your school delivery destinations with GPS coordinates and Google Maps pin locations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAddAddress('shipping')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-navy-950">No saved addresses yet</h3>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Save your home or school address for 1-click checkout and exact delivery pin routing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAddAddress('shipping')}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-navy-950 text-white text-xs font-bold transition hover:bg-navy-900"
                    >
                      Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        onEdit={() => handleEditAddress(addr)}
                        onDelete={() => handleDeleteAddress(addr.id)}
                        onSetDefault={() => handleSetDefaultAddress(addr.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. BILLING DETAILS TAB */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-navy-950">Saved Billing Addresses &amp; Invoices</h2>
                    <p className="text-xs text-gray-500">
                      Separate billing information for institutional invoices and payment receipts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAddAddress('billing')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Billing Address</span>
                  </button>
                </div>

                {billingAddresses.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border border-gray-200 text-center space-y-3">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto" />
                    <h3 className="text-sm font-bold text-navy-950">No distinct billing addresses added</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      By default, your shipping address is used for billing receipts unless you specify a separate corporate or parent address.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {billingAddresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        onEdit={() => handleEditAddress(addr)}
                        onDelete={() => handleDeleteAddress(addr.id)}
                        onSetDefault={() => handleSetDefaultAddress(addr.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. SHIPMENT TRACKING TAB */}
            {activeTab === 'tracking' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <div>
                    <h2 className="text-base font-black text-navy-950">Manual Shipment Tracker</h2>
                    <p className="text-xs text-gray-500">
                      Enter your order reference ID (e.g. KS-849201) to view the live dispatch timeline recorded by Bawana plant administrators.
                    </p>
                  </div>

                  <form onSubmit={handleSearchTracking} className="flex gap-2">
                    <input
                      type="text"
                      value={trackingSearchInput}
                      onChange={(e) => setTrackingSearchInput(e.target.value.toUpperCase())}
                      placeholder="Enter Order ID (e.g. KS-849201)"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-navy-950 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow"
                    >
                      Track Package
                    </button>
                  </form>

                  {trackingError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>{trackingError}</span>
                    </div>
                  )}
                </div>

                {/* If tracking an order */}
                {trackingOrder && (
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black text-navy-950">
                            {trackingOrder.order_number}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                              trackingOrder.status
                            )}`}
                          >
                            {trackingOrder.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Recipient: <strong>{trackingOrder.customer_name}</strong> • Phone: {trackingOrder.customer_phone}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-gray-400 block">Courier Service:</span>
                        <strong className="text-xs text-navy-950">
                          {trackingOrder.courier_name || 'Bawana Factory Express Dispatch'}
                        </strong>
                        {trackingOrder.tracking_id && (
                          <span className="text-[11px] font-mono block text-brand-600 font-bold">
                            AWB: {trackingOrder.tracking_id}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="py-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-navy-950 mb-6">
                        Delivery Progress Timeline
                      </h3>

                      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                        {ORDER_STEPS.map((step, idx) => {
                          const currentStepIndex = ORDER_STEPS.indexOf(trackingOrder.status as any);
                          const isDone = currentStepIndex >= idx;
                          const isCurrent = trackingOrder.status === step;

                          // Find any matching recorded history updates
                          const updateRecord = trackingOrder.tracking_history?.find((h) => h.status === step);

                          return (
                            <div key={step} className="relative flex items-start gap-4">
                              <div
                                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                                  isDone
                                    ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                                    : 'bg-white border-gray-300 text-gray-300'
                                }`}
                              >
                                {isDone ? (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                ) : (
                                  <span className="text-[9px] font-bold">{idx + 1}</span>
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4
                                    className={`text-xs font-bold ${
                                      isCurrent
                                        ? 'text-brand-600'
                                        : isDone
                                        ? 'text-navy-950'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {step}
                                  </h4>
                                  {isCurrent && (
                                    <span className="text-[9px] font-black uppercase bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full animate-pulse">
                                      Current Stage
                                    </span>
                                  )}
                                </div>

                                {updateRecord?.update_time && (
                                  <span className="text-[10px] text-gray-400 block font-mono">
                                    {new Date(updateRecord.update_time).toLocaleDateString([], {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}

                                {updateRecord?.notes ? (
                                  <p className="text-xs text-gray-600 pt-0.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100 max-w-lg">
                                    {updateRecord.notes}
                                  </p>
                                ) : isCurrent && trackingOrder.tracking_notes ? (
                                  <p className="text-xs text-gray-600 pt-0.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100 max-w-lg">
                                    {trackingOrder.tracking_notes}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Information Form */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h2 className="text-base font-black text-navy-950">Personal Profile Information</h2>
                    <p className="text-xs text-gray-500">
                      Manage your contact identity saved against your Supabase customer ID.
                    </p>
                  </div>

                  {profileMsg && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        profileMsg.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {profileMsg.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone Number</label>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address {user ? '(Verified Identity)' : '*'}
                      </label>
                      <input
                        type="email"
                        disabled={Boolean(user)}
                        value={user ? user.email : emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="parent@example.com"
                        className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium ${
                          user
                            ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-50 text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500'
                        }`}
                        required={!user}
                      />
                      <span className="text-[11px] text-gray-400 mt-1 block">
                        {user
                          ? 'Email address is locked to your Supabase Auth user record.'
                          : 'Saved locally on this device for your receipts and order updates.'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <span className="text-[11px] text-gray-400">
                        {user ? (
                          <>
                            Account created on:{' '}
                            {new Date(user.created_at || Date.now()).toLocaleDateString([], {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </>
                        ) : (
                          <>
                            Storage: <strong className="text-blue-700">Local Browser Cache</strong>
                          </>
                        )}
                      </span>

                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition shadow disabled:opacity-50"
                      >
                        {profileSaving ? 'Saving...' : user ? 'Save Profile Changes' : 'Save Changes Locally'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Cloud Sync prompt for Guest */}
                {!user && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 border border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-navy-950">Want your data synced to Supabase Cloud?</h3>
                      <p className="text-xs text-gray-600">
                        Sign in or register an account. All your locally saved addresses and orders will automatically sync to your Supabase cloud profile.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAuthModal()}
                      className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shrink-0 transition shadow self-start sm:self-auto"
                    >
                      Sign In / Register
                    </button>
                  </div>
                )}

                {/* Password Change Form (for registered users) */}
                {user && (
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <h2 className="text-base font-black text-navy-950">Change Password</h2>
                      <p className="text-xs text-gray-500">
                        Update your Supabase authentication password to secure your account.
                      </p>
                    </div>

                  {passwordMsg && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        passwordMsg.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      {passwordMsg.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">New Password *</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password *</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow disabled:opacity-50"
                    >
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Add / Edit Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-5 animate-scaleIn">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-navy-950">
                {editingAddress?.id ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <p className="text-xs text-gray-500">
                Detect coordinates via Google Maps or enter address details manually.
              </p>
            </div>

            <form onSubmit={handleSaveAddressModal} className="space-y-4">
              <GoogleMapsAddressPicker
                initialAddress={editingAddress || {}}
                onAddressChange={(updated) => setEditingAddress((prev) => ({ ...prev, ...updated }))}
                showAddressTypeSelector
                addressType={addressModalType}
              />

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-6 animate-scaleIn">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">
                  KOSKOOL ORDER RECORD
                </span>
                <h3 className="text-xl font-black text-navy-950">{selectedOrder.order_number}</h3>
                <span className="text-xs text-gray-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleDateString([], {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <span
                className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusBadgeClass(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status}
              </span>
            </div>

            {/* Address Snapshots (Immutable) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <span className="font-bold text-navy-950 block border-b border-gray-200 pb-1">
                  Shipping Destination Snapshot
                </span>
                <p className="font-medium text-navy-950">
                  {selectedOrder.shipping_address?.name || selectedOrder.customer_name}
                </p>
                <p className="text-gray-600">{selectedOrder.shipping_address?.phone || selectedOrder.customer_phone}</p>
                <p className="text-gray-600 leading-relaxed">
                  {selectedOrder.delivery_address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                </p>
                {selectedOrder.latitude && selectedOrder.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-brand-600 hover:underline pt-1 inline-flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>View Delivery GPS Pin</span>
                  </a>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <span className="font-bold text-navy-950 block border-b border-gray-200 pb-1">
                  Billing Address Snapshot
                </span>
                <p className="font-medium text-navy-950">
                  {selectedOrder.billing_address?.name || selectedOrder.customer_name}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {selectedOrder.billing_address?.street_area || selectedOrder.delivery_address},{' '}
                  {selectedOrder.billing_address?.city || selectedOrder.city},{' '}
                  {selectedOrder.billing_address?.state || selectedOrder.state} -{' '}
                  {selectedOrder.billing_address?.pincode || selectedOrder.pincode}
                </p>
                <p className="text-gray-500 pt-1">
                  Payment Method: <strong className="text-navy-950 uppercase">{selectedOrder.payment_method}</strong> (
                  {selectedOrder.payment_status || 'Pending'})
                </p>
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-navy-950">Ordered Products</h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100 shrink-0">
                        <Image
                          src={it.image || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                          alt={it.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-navy-950">{it.name}</h5>
                        <p className="text-[11px] text-gray-500">
                          Size: {it.selectedSize} {it.selectedColour ? `• Colour: ${it.selectedColour}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-navy-950">
                        ₹{it.price} × {it.quantity}
                      </span>
                      <span className="text-xs font-black text-navy-950 block">
                        ₹{it.price * it.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-₹{selectedOrder.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping Cost</span>
                <span className="font-bold text-gray-900">
                  {selectedOrder.shipping_cost === 0 ? 'FREE' : `₹${selectedOrder.shipping_cost}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-navy-950 pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span>₹{selectedOrder.total_amount}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setTrackingOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow"
              >
                <Truck className="w-4 h-4" />
                <span>Track This Shipment</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-6 animate-scaleIn">
            <button
              onClick={() => setTrackingOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">
                  LIVE SHIPMENT DISPATCH TRACKER
                </span>
                <h3 className="text-xl font-black text-navy-950">{trackingOrder.order_number}</h3>
                <span className="text-xs text-gray-500">
                  Recipient: <strong>{trackingOrder.customer_name}</strong>
                </span>
              </div>

              <span
                className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusBadgeClass(
                  trackingOrder.status
                )}`}
              >
                {trackingOrder.status}
              </span>
            </div>

            {/* Courier & AWB info */}
            <div className="p-4 bg-brand-50/60 border border-brand-200/80 rounded-2xl flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-gray-500 text-[11px] block">Courier Partner:</span>
                <strong className="text-navy-950 text-sm">
                  {trackingOrder.courier_name || 'Delhivery Express Priority'}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-[11px] block">Tracking / AWB Number:</span>
                <strong className="text-brand-600 font-mono text-sm">
                  {trackingOrder.tracking_id || 'Generating AWB...'}
                </strong>
              </div>
            </div>

            {/* Vertical timeline */}
            <div className="py-2">
              <h4 className="text-xs font-black uppercase text-navy-950 mb-6 tracking-wider">
                Shipment Status Updates
              </h4>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {ORDER_STEPS.map((step, idx) => {
                  const currentStepIndex = ORDER_STEPS.indexOf(trackingOrder.status as any);
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = trackingOrder.status === step;

                  const updateRecord = trackingOrder.tracking_history?.find((h) => h.status === step);

                  return (
                    <div key={step} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          isDone
                            ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                            : 'bg-white border-gray-300 text-gray-300'
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="text-[9px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h5
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-brand-600'
                                : isDone
                                ? 'text-navy-950'
                                : 'text-gray-400'
                            }`}
                          >
                            {step}
                          </h5>
                          {isCurrent && (
                            <span className="text-[9px] font-black uppercase bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full animate-pulse">
                              Current Status
                            </span>
                          )}
                        </div>

                        {updateRecord?.update_time && (
                          <span className="text-[10px] text-gray-400 block font-mono">
                            {new Date(updateRecord.update_time).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}

                        {updateRecord?.notes ? (
                          <p className="text-xs text-gray-600 pt-0.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100 max-w-lg">
                            {updateRecord.notes}
                          </p>
                        ) : isCurrent && trackingOrder.tracking_notes ? (
                          <p className="text-xs text-gray-600 pt-0.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100 max-w-lg">
                            {trackingOrder.tracking_notes}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs transition"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
