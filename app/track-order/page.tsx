'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  PackageCheck,
  Truck,
  MapPin,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Check,
  Navigation,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { getOrderByIdOrNumber, Order, OrderStatus } from '@/services/api';

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

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  // Automatically track if orderId was passed in URL query
  useEffect(() => {
    if (initialOrderId) {
      trackOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const trackOrder = async (orderIdToTrack: string) => {
    if (!orderIdToTrack.trim()) return;
    setNotFound(false);
    setLoading(true);

    try {
      const order = await getOrderByIdOrNumber(orderIdToTrack.trim());
      if (order) {
        setOrderData(order);
      } else {
        setOrderData(null);
        setNotFound(true);
      }
    } catch {
      setOrderData(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackOrder(orderNumber);
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
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

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-3.5 h-3.5" />
            <span>Factory Dispatch Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-950">Track Your KOSKOOL Order</h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
            Enter your order reference ID (e.g. KS-849201) to view real-time factory dispatch updates from our Bawana plant.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Order ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KS-849201"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Registered Mobile (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Searching Supabase Orders...' : 'Track Package'}</span>
              <Search className="w-4 h-4" />
            </button>
          </form>

          {notFound && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>No order found with ID &quot;{orderNumber}&quot;. Please verify and try again.</span>
            </div>
          )}

          {/* Tracking Result View */}
          {orderData && (
            <div className="pt-6 border-t border-gray-100 space-y-6 animate-fadeIn">
              {/* Order Status Banner */}
              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Order {orderData.order_number}
                  </span>
                  <h3 className="text-base font-black text-navy-950">
                    Recipient: {orderData.customer_name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    Destination: {orderData.city}, {orderData.state} - {orderData.pincode}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span
                    className={`inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusBadgeClass(
                      orderData.status
                    )}`}
                  >
                    {orderData.status}
                  </span>
                  <span className="text-[11px] text-gray-400 block pt-1">
                    Amount: <strong className="text-navy-950">₹{orderData.total_amount}</strong> ({orderData.items.length} items)
                  </span>
                </div>
              </div>

              {/* Courier & Dispatch Facility Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Manufacturing &amp; Dispatch Facility
                  </span>
                  <strong className="text-navy-950 block">Sector 2, Bawana Industrial Area, Delhi</strong>
                  <span className="text-[11px] text-gray-500">Quality Checked &amp; Uniform Dispatched</span>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">
                    Assigned Courier Service
                  </span>
                  <strong className="text-navy-950 block">
                    {orderData.courier_name || 'Bawana Factory Express Dispatch'}
                  </strong>
                  {orderData.tracking_id ? (
                    <span className="text-[11px] font-mono text-brand-600 font-bold">
                      Tracking / AWB: {orderData.tracking_id}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">AWB assigned upon courier intake</span>
                  )}
                </div>
              </div>

              {/* GPS Coordinates link if present */}
              {orderData.latitude && orderData.longitude && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Doorstep Delivery Coordinates Verified via Google Maps</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${orderData.latitude},${orderData.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold underline text-emerald-900 inline-flex items-center gap-1"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Live Vertical Timeline */}
              <div className="py-2">
                <h4 className="text-xs font-black uppercase text-navy-950 tracking-wider mb-6">
                  Delivery Timeline &amp; Factory Updates
                </h4>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {ORDER_STEPS.map((step, idx) => {
                    const currentStepIndex = ORDER_STEPS.indexOf(orderData.status as any);
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = orderData.status === step;

                    // Match with timestamped history records
                    const updateRecord = orderData.tracking_history?.find((h) => h.status === step);

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

                        <div className="space-y-0.5 flex-1">
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
                            <p className="text-xs text-gray-600 pt-0.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              {updateRecord.notes}
                            </p>
                          ) : isCurrent && orderData.tracking_notes ? (
                            <p className="text-xs text-gray-600 pt-0.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              {orderData.tracking_notes}
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
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
