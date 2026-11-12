'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Truck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertCircle,
  XCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { getOrders, updateOrderStatus, Order } from '@/services/api';

const STATUS_OPTIONS: Order['status'][] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNotesInput, setTrackingNotesInput] = useState('');

  const fetchOrdersList = async () => {
    setLoading(true);
    try {
      const data = await getOrders({ status: statusFilter, search });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrdersList();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Status Change Handler
  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await updateOrderStatus(orderId, newStatus);
    fetchOrdersList();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // Save Tracking Notes
  const handleSaveNotes = async () => {
    if (selectedOrder) {
      await updateOrderStatus(selectedOrder.id, selectedOrder.status, trackingNotesInput);
      setSelectedOrder({ ...selectedOrder, tracking_notes: trackingNotesInput });
      fetchOrdersList();
    }
  };

  const openOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setTrackingNotesInput(ord.tracking_notes || '');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Deliveries / Orders</h1>
          <p className="text-xs text-gray-500">
            Track customer deliveries, uniform dispatches, and update statuses from Bawana industrial plant.
          </p>
        </div>

        {/* Filter Stats */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
            Total Orders: {orders.length}
          </span>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            Pending: {orders.filter((o) => o.status === 'Pending').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Customer, or Phone..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-navy-950 focus:outline-none"
          >
            <option value="all">All Orders</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-black text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Order ID &amp; Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Delivery Destination</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Amount &amp; Method</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-navy-950 border-t-brand-600 rounded-full animate-spin" />
                      <span>Loading delivery requests...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No orders found matching the filter.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-navy-950 block">
                        {ord.order_number}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(ord.created_at).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-navy-950 block">{ord.customer_name}</span>
                      <span className="text-[11px] text-gray-500 font-mono block">
                        {ord.customer_phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="truncate block font-medium text-navy-950">
                        {ord.delivery_address}
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        {ord.city}, {ord.state} - {ord.pincode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-navy-950 block">₹{ord.total_amount}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        {ord.payment_method}
                      </span>
                    </td>

                    {/* Quick Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleStatusChange(ord.id, e.target.value as Order['status'])
                        }
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none ${
                          ord.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : ord.status === 'Confirmed'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : ord.status === 'Processing'
                            ? 'bg-purple-50 text-purple-800 border-purple-300'
                            : ord.status === 'Shipped'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : ord.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderModal(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-navy-950 hover:text-white text-navy-950 text-xs font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                  KOSKOOL ORDER DETAILS
                </span>
                <h2 className="text-xl font-black text-navy-950">
                  Order Reference: {selectedOrder.order_number}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Customer</span>
                <p className="font-bold text-navy-950 text-sm">{selectedOrder.customer_name}</p>
                <p className="text-gray-600 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span>{selectedOrder.customer_email}</span>
                </p>
                <p className="text-gray-600 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span>{selectedOrder.customer_phone}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-gray-400 uppercase text-[10px]">
                  Delivery Address
                </span>
                <p className="text-gray-800 leading-relaxed">{selectedOrder.delivery_address}</p>
                <p className="font-bold text-navy-950">
                  {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-navy-950 tracking-wider">
                Ordered Uniform Footwear &amp; Goods
              </h3>

              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 relative overflow-hidden border border-gray-100 shrink-0">
                        <Image
                          src={item.image || '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg'}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-navy-950 block">{item.name}</span>
                        <span className="text-[11px] text-gray-500">
                          Size: {item.selectedSize} • Qty: {item.quantity}
                        </span>
                      </div>
                    </div>

                    <span className="font-black text-navy-950">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-gray-100 space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount ({selectedOrder.promo_code || 'Promo'})</span>
                    <span>-₹{selectedOrder.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{selectedOrder.shipping_cost === 0 ? 'FREE' : `₹${selectedOrder.shipping_cost}`}</span>
                </div>
                <div className="flex justify-between text-base font-black text-navy-950 pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span>₹{selectedOrder.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Update Delivery Status & Dispatch Notes */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700">
                Factory Dispatch &amp; Tracking Notes (Bawana Industrial Unit)
              </label>
              <textarea
                rows={2}
                value={trackingNotesInput}
                onChange={(e) => setTrackingNotesInput(e.target.value)}
                placeholder="e.g. Dispatched with Delhivery AWB #84920194. Out for delivery."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600">Change Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.id, e.target.value as Order['status'])
                    }
                    className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-navy-950 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveNotes}
                  className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold shadow transition"
                >
                  Save Dispatch Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
