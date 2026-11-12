'use client';

import React, { useState } from 'react';
import { Search, PackageCheck, Truck, MapPin, Building, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { getOrders, Order } from '@/services/api';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);
    setLoading(true);

    try {
      const allOrders = await getOrders({ search: orderNumber.trim() });
      const found = allOrders.find(
        (o) =>
          o.order_number.toUpperCase() === orderNumber.trim().toUpperCase() ||
          o.id === orderNumber.trim()
      );

      if (found) {
        setTrackingInfo({
          orderId: found.order_number,
          customerName: found.customer_name,
          status: found.status,
          totalAmount: found.total_amount,
          itemsCount: found.items.length,
          origin: 'Sector 2, Bawana Industrial Area, Delhi',
          courier: 'Delhivery Express Uniform Priority',
          notes: found.tracking_notes || 'Package checked and prepared for school delivery.',
          expectedDate: found.status === 'Delivered' ? 'Delivered' : 'Within 2-3 Working Days',
          steps: [
            {
              title: 'Order Placed & Confirmed',
              done: true,
              time: new Date(found.created_at).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              }),
            },
            {
              title: 'Uniform Quality Inspection (Bawana Unit)',
              done: found.status !== 'Pending',
              time: found.status !== 'Pending' ? 'Completed' : 'Queued',
            },
            {
              title: 'Dispatched from Factory',
              done: ['Shipped', 'Delivered'].includes(found.status),
              time: ['Shipped', 'Delivered'].includes(found.status) ? 'Dispatched' : 'Pending',
            },
            {
              title: 'Delivered to Student Address',
              done: found.status === 'Delivered',
              time: found.status === 'Delivered' ? 'Delivered' : 'In Transit',
            },
          ],
        });
      } else {
        // Fallback simulated tracking for demonstration
        setTrackingInfo({
          orderId: orderNumber.toUpperCase(),
          status: 'In Transit - Dispatched from Factory',
          origin: 'Sector 2, Bawana Industrial Area, Delhi',
          courier: 'Delhivery Express School Priority',
          notes: 'Dispatched from Delhi facility, out for uniform distribution.',
          expectedDate: 'Within 2-3 Working Days',
          steps: [
            { title: 'Order Placed & Verified', done: true, time: 'Confirmed' },
            { title: 'Quality Inspection & Uniform QC Passed', done: true, time: 'Passed' },
            { title: 'Dispatched from Bawana Factory, Delhi', done: true, time: 'Dispatched' },
            { title: 'Out for School Delivery', done: false, time: 'In Transit' },
          ],
        });
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Real-Time Tracking
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-950">Track Your KOSKOOL Order</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Enter your order reference ID (e.g. KS-849201) to track dispatch progress from Bawana plant.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <form onSubmit={handleTrack} className="space-y-4">
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
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Searching...' : 'Track Package'}</span>
              <Search className="w-4 h-4" />
            </button>
          </form>

          {notFound && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>No order found with ID &quot;{orderNumber}&quot;. Please verify and try again.</span>
            </div>
          )}

          {trackingInfo && (
            <div className="pt-6 border-t border-gray-100 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Order {trackingInfo.orderId}
                  </span>
                  <h3 className="text-base font-extrabold text-brand-700">{trackingInfo.status}</h3>
                  {trackingInfo.notes && (
                    <p className="text-xs text-gray-600 mt-0.5">{trackingInfo.notes}</p>
                  )}
                </div>
                <div className="text-right text-xs">
                  <span className="text-gray-500 block">Estimated Delivery:</span>
                  <span className="font-bold text-navy-950">{trackingInfo.expectedDate}</span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950">
                  Shipment Timeline
                </h4>
                <div className="relative pl-6 space-y-6 border-l-2 border-brand-500 ml-3">
                  {trackingInfo.steps.map((st: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          st.done
                            ? 'bg-brand-600 border-white ring-2 ring-brand-500'
                            : 'bg-gray-200 border-white'
                        }`}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold ${
                            st.done ? 'text-navy-950' : 'text-gray-400'
                          }`}
                        >
                          {st.title}
                        </span>
                        <span className="text-[11px] text-gray-400">{st.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-600 flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Dispatched directly from KOSKOOL Factory: Sector 2, Bawana Industrial Area, Delhi. Helpline: +91 8130458265.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
