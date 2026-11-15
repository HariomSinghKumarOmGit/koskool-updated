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
  ExternalLink,
  Plus,
  Send,
  Navigation,
  Check,
} from 'lucide-react';
import {
  getOrders,
  addOrderTrackingUpdate,
  Order,
  OrderStatus,
  OrderTrackingUpdate,
} from '@/services/api';

const STATUS_OPTIONS: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const COURIER_SUGGESTIONS = [
  'Delhivery Express',
  'Blue Dart Priority',
  'DTDC Express',
  'India Speed Post',
  'Ecom Express',
  'Bawana Factory Fleet',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New Tracking Update Form State
  const [updateStatus, setUpdateStatus] = useState<OrderStatus>('Processing');
  const [courierName, setCourierName] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingNotes, setTrackingNotes] = useState('');
  const [updateDateTime, setUpdateDateTime] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState('');

  const fetchOrdersList = async () => {
    setLoading(true);
    try {
      const data = await getOrders({ status: statusFilter, search });
      setOrders(data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
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

  // Set current datetime when opening order modal
  const openOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setUpdateStatus(ord.status);
    setCourierName(ord.courier_name || '');
    setTrackingId(ord.tracking_id || '');
    setTrackingNotes('');
    setUpdateSuccessMsg('');

    // Default to current local ISO string suitable for datetime-local
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setUpdateDateTime(now.toISOString().slice(0, 16));
  };

  // Submit a new manual shipment tracking record
  const handleAddTrackingUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSavingUpdate(true);
    setUpdateSuccessMsg('');

    try {
      const updateTimeIso = updateDateTime ? new Date(updateDateTime).toISOString() : new Date().toISOString();

      const res = await addOrderTrackingUpdate(selectedOrder.id, {
        status: updateStatus,
        courier_name: courierName.trim() || undefined,
        tracking_id: trackingId.trim() || undefined,
        notes: trackingNotes.trim() || `Order status marked as ${updateStatus}`,
        update_time: updateTimeIso,
      });

      if (res.success && res.trackingRecord) {
        const updatedHistory = [...(selectedOrder.tracking_history || []), res.trackingRecord];
        const updatedOrder: Order = {
          ...selectedOrder,
          status: updateStatus,
          courier_name: courierName.trim() || selectedOrder.courier_name,
          tracking_id: trackingId.trim() || selectedOrder.tracking_id,
          tracking_notes: trackingNotes.trim() || selectedOrder.tracking_notes,
          updated_at: updateTimeIso,
          tracking_history: updatedHistory,
        };

        setSelectedOrder(updatedOrder);
        setUpdateSuccessMsg(`Tracking update saved! Order is now ${updateStatus}.`);
        setTrackingNotes('');

        // Refresh list
        fetchOrdersList();
      }
    } catch (err) {
      console.error('Failed to add tracking update:', err);
    } finally {
      setSavingUpdate(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Shipped':
      case 'In Transit':
      case 'Out for Delivery':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Processing':
      case 'Packed':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'Cancelled':
        return 'bg-red-50 text-red-800 border-red-300';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Customer Orders &amp; Manual Shipment Tracking</h1>
          <p className="text-xs text-gray-500">
            View customer details, immutable delivery addresses, and manually record timestamped dispatch updates.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            Total Orders: {orders.length}
          </span>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            Pending / Placed: {orders.filter((o) => o.status === 'Order Placed' || o.status === 'Pending').length}
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
          <span className="text-xs font-bold text-gray-500">Filter Status:</span>
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

      {/* Orders Listing Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-black text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Order ID &amp; Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Delivery City &amp; PIN</th>
                <th className="py-3.5 px-4">Amount &amp; Method</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-navy-950 border-t-brand-600 rounded-full animate-spin" />
                      <span>Loading customer orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No orders found. Customer orders placed in checkout will appear here in real time.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-navy-950 block text-xs">
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
                      <span className="text-[11px] text-gray-400 block">{ord.customer_email}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-700">
                      {ord.customer_phone}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-navy-950 block">{ord.city}, {ord.state}</span>
                      <span className="text-[11px] font-mono text-gray-400">{ord.pincode}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-navy-950 block text-sm">₹{ord.total_amount}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-500">
                        {ord.payment_method === 'cod' ? 'Cash on Delivery' : ord.payment_method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderModal(ord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Update Tracking</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Order Details & Manual Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                  ORDER SPECIFICATION &amp; SHIPMENT CONTROLS
                </span>
                <h2 className="text-xl font-black text-navy-950 flex items-center gap-2">
                  <span>Order: {selectedOrder.order_number}</span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="font-bold text-gray-500 uppercase text-[10px] block border-b border-gray-200 pb-1">
                  Customer Contact Information
                </span>
                <p className="font-bold text-navy-950 text-sm">{selectedOrder.customer_name}</p>
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedOrder.customer_email}</span>
                </p>
                <p className="text-gray-600 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedOrder.customer_phone}</span>
                </p>
                {selectedOrder.user_id && (
                  <p className="text-[11px] text-gray-400 pt-1">
                    Customer UUID: <code className="text-navy-950 font-bold">{selectedOrder.user_id}</code>
                  </p>
                )}
              </div>

              {/* Immutable Shipping Address */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="font-bold text-gray-500 uppercase text-[10px] block border-b border-gray-200 pb-1">
                  Complete Shipping Address (Immutable Snapshot)
                </span>
                <p className="font-bold text-navy-950">
                  {selectedOrder.shipping_address?.name || selectedOrder.customer_name}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {selectedOrder.delivery_address}, {selectedOrder.city}, {selectedOrder.state} -{' '}
                  <span className="font-mono">{selectedOrder.pincode}</span>
                </p>

                {/* Google Maps Location Link if coordinates exist */}
                {selectedOrder.latitude && selectedOrder.longitude ? (
                  <div className="pt-1.5">
                    <a
                      href={`https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-500 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Open Google Maps Pin ({Number(selectedOrder.latitude).toFixed(4)}, {Number(selectedOrder.longitude).toFixed(4)})</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-400 italic block pt-1">
                    No GPS coordinates captured for this address.
                  </span>
                )}
              </div>
            </div>

            {/* Billing Address Snapshot */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
              <span className="font-bold text-gray-500 uppercase text-[10px] block border-b border-gray-200 pb-1">
                Complete Billing Address Snapshot
              </span>
              <p className="text-gray-700 leading-relaxed">
                {selectedOrder.billing_address?.street_area || selectedOrder.delivery_address},{' '}
                {selectedOrder.billing_address?.city || selectedOrder.city},{' '}
                {selectedOrder.billing_address?.state || selectedOrder.state} -{' '}
                {selectedOrder.billing_address?.pincode || selectedOrder.pincode}
              </p>
            </div>

            {/* Ordered Products */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-navy-950 tracking-wider">
                Ordered Uniform Goods ({selectedOrder.items.length})
              </h3>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 relative overflow-hidden border border-gray-200 shrink-0">
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
                          Size: {item.selectedSize} {item.selectedColour ? `• Colour: ${item.selectedColour}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-600 font-medium">₹{item.price} × {item.quantity}</span>
                      <strong className="block font-black text-navy-950">₹{item.price * item.quantity}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-navy-950">₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Applied ({selectedOrder.promo_code || 'Promo'})</span>
                    <span>-₹{selectedOrder.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Cost</span>
                  <span className="font-bold text-navy-950">
                    {selectedOrder.shipping_cost === 0 ? 'FREE (Threshold ₹500+)' : `₹${selectedOrder.shipping_cost}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-navy-950 pt-2 border-t border-gray-200">
                  <span>Final Total Amount</span>
                  <span>₹{selectedOrder.total_amount}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                  <span>Payment Method &amp; Status</span>
                  <span className="uppercase font-bold text-navy-950">
                    {selectedOrder.payment_method} ({selectedOrder.payment_status || 'Pending'})
                  </span>
                </div>
              </div>
            </div>

            {/* Shipment Tracking History (Timestamped) */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-black uppercase text-navy-950 tracking-wider flex items-center justify-between">
                <span>Shipment Tracking History ({selectedOrder.tracking_history?.length || 0} updates)</span>
                {selectedOrder.tracking_id && (
                  <span className="text-[11px] text-brand-600 font-mono font-bold lowercase">
                    awb: {selectedOrder.tracking_id}
                  </span>
                )}
              </h3>

              {(!selectedOrder.tracking_history || selectedOrder.tracking_history.length === 0) ? (
                <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-xl">
                  No tracking history records logged yet. Add the first update below.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.tracking_history.map((trk, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-950 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-brand-600" />
                          <span>{trk.status}</span>
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {new Date(trk.update_time).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      {trk.courier_name && (
                        <p className="text-[11px] text-gray-600">
                          Courier: <strong>{trk.courier_name}</strong>
                          {trk.tracking_id ? ` (AWB: ${trk.tracking_id})` : ''}
                        </p>
                      )}
                      {trk.notes && <p className="text-[11px] text-gray-700 bg-white p-2 rounded-lg border border-gray-100">{trk.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit / Update Tracking Form (Specific to this order) */}
            <div className="p-5 bg-brand-50/50 rounded-3xl border border-brand-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-navy-950 tracking-wider">
                    Add Manual Shipment Update (Bawana Dispatch)
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Creates an immutable timestamped tracking update for this specific order.
                  </p>
                </div>
                <Truck className="w-5 h-5 text-brand-600" />
              </div>

              {updateSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{updateSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddTrackingUpdate} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      New Order Delivery Status *
                    </label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value as OrderStatus)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Update Date &amp; Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={updateDateTime}
                      onChange={(e) => setUpdateDateTime(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Courier / Delivery Partner
                    </label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. Delhivery Express"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    />
                    {/* Quick suggestions */}
                    <div className="flex gap-1 flex-wrap pt-1">
                      {COURIER_SUGGESTIONS.slice(0, 3).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCourierName(c)}
                          className="text-[10px] font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200 hover:border-gray-300"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Tracking ID / AWB Number (If available)
                    </label>
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="e.g. DEL-84920194"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-navy-950 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Shipment Notes / Update Details
                  </label>
                  <textarea
                    rows={2}
                    value={trackingNotes}
                    onChange={(e) => setTrackingNotes(e.target.value)}
                    placeholder="e.g. Quality inspection completed at Bawana industrial unit. Consignment handed over to courier priority bag."
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingUpdate}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-md disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{savingUpdate ? 'Saving Update...' : 'Add Tracking Update Record'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
