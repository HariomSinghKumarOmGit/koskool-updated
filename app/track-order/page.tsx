'use client';

import React, { useState } from 'react';
import { Search, PackageCheck, Truck, MapPin, Building, ShieldCheck } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber) {
      setTrackingInfo({
        orderId: orderNumber.toUpperCase(),
        status: 'In Transit - Dispatched from Factory',
        origin: 'Sector 2, Bawana Industrial Area, Delhi',
        courier: 'Delhivery Express School Priority',
        expectedDate: 'Within 2-3 Working Days',
        steps: [
          { title: 'Order Placed & Verified', done: true, time: 'Nov 12, 10:30 AM' },
          { title: 'Quality Inspection & Uniform QC Passed', done: true, time: 'Nov 12, 02:15 PM' },
          { title: 'Dispatched from Bawana Factory, Delhi', done: true, time: 'Nov 12, 05:45 PM' },
          { title: 'In Transit to Destination Hub', done: true, time: 'Active' },
          { title: 'Out for School Delivery', done: false, time: 'Pending' },
        ],
      });
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
            Enter your order reference ID and registered phone number to track package progress.
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
                  placeholder="e.g. KS-589214"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-navy-950 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Registered Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3.5 px-6 rounded-xl shadow-lg transition"
            >
              Track Package
            </button>
          </form>

          {trackingInfo && (
            <div className="pt-6 border-t border-gray-100 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Current Status</span>
                  <h3 className="text-sm font-extrabold text-brand-700">{trackingInfo.status}</h3>
                </div>
                <div className="text-right sm:text-right text-xs">
                  <span className="text-gray-500">Estimated Delivery:</span>
                  <span className="block font-bold text-navy-950">{trackingInfo.expectedDate}</span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy-950">Shipment Timeline</h4>
                <div className="relative pl-6 space-y-6 border-l-2 border-brand-500 ml-3">
                  {trackingInfo.steps.map((st: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          st.done ? 'bg-brand-600 border-white ring-2 ring-brand-500' : 'bg-gray-200 border-white'
                        }`}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${st.done ? 'text-navy-950' : 'text-gray-400'}`}>
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
