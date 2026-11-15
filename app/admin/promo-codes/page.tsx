'use client';

import React, { useState, useEffect } from 'react';
import {
  TicketPercent,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  AlertTriangle,
  Percent,
  IndianRupee,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  PromoCode,
} from '@/services/api';

export default function AdminPromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<PromoCode | null>(null);

  // No Cap state toggles
  const [isMinNoCap, setIsMinNoCap] = useState(false);
  const [isMaxNoCap, setIsMaxNoCap] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_order_amount: 499,
    max_discount_amount: 1000,
    is_active: true,
  });

  const fetchPromosList = async () => {
    setLoading(true);
    try {
      const data = await getPromoCodes();
      setPromos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromosList();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      code: '',
      description: 'Custom Promotional Discount',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 499,
      max_discount_amount: 500,
      is_active: true,
    });
    setIsMinNoCap(false);
    setIsMaxNoCap(false);
    setEditingPromo(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    const minNoCap = !promo.min_order_amount || promo.min_order_amount === 0;
    const maxNoCap = !promo.max_discount_amount || promo.max_discount_amount === 0;
    setIsMinNoCap(minNoCap);
    setIsMaxNoCap(maxNoCap);

    setFormData({
      code: promo.code,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      min_order_amount: minNoCap ? 0 : promo.min_order_amount,
      max_discount_amount: maxNoCap ? 0 : (promo.max_discount_amount || 0),
      is_active: promo.is_active,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      min_order_amount: isMinNoCap ? 0 : Number(formData.min_order_amount) || 0,
      max_discount_amount: isMaxNoCap ? 0 : (Number(formData.max_discount_amount) > 0 ? Number(formData.max_discount_amount) : 0),
    };

    if (editingPromo) {
      await updatePromoCode(editingPromo.id, payload);
    } else {
      await createPromoCode(payload);
    }
    setIsModalOpen(false);
    fetchPromosList();
  };

  const handleToggleActive = async (p: PromoCode) => {
    await updatePromoCode(p.id, { is_active: !p.is_active });
    fetchPromosList();
  };

  const handleConfirmDelete = async () => {
    if (deleteCandidate) {
      await deletePromoCode(deleteCandidate.id);
      setDeleteCandidate(null);
      fetchPromosList();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Promo Codes &amp; Discounts</h1>
          <p className="text-xs text-gray-500">
            Create customizable discount rules (10%, 20%, 50% or ₹10, ₹20, ₹100 Flat Off) synced with Cart &amp; Checkout.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Code</span>
        </button>
      </div>

      {/* Quick Preset Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Percentage Tier</span>
          <div className="text-sm font-black text-navy-950">10%, 20%, 50% Off</div>
          <p className="text-[11px] text-gray-500">Auto applied on subtotal</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Flat Rupee Tier</span>
          <div className="text-sm font-black text-navy-950">₹10, ₹20, ₹100 Off</div>
          <p className="text-[11px] text-gray-500">Direct deduction at checkout</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Active Coupons</span>
          <div className="text-sm font-black text-emerald-600">
            {promos.filter((p) => p.is_active).length} Active
          </div>
          <p className="text-[11px] text-gray-500">Available to customers</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Redemptions</span>
          <div className="text-sm font-black text-brand-600">
            {promos.reduce((s, p) => s + (p.usage_count || 0), 0)} Used
          </div>
          <p className="text-[11px] text-gray-500">Live order coupon tracking</p>
        </div>
      </div>

      {/* Promos Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-black text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount Type &amp; Value</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Min Spend</th>
                <th className="py-3.5 px-4">Max Cap</th>
                <th className="py-3.5 px-4">Usage Count</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="w-8 h-8 border-3 border-navy-950 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading coupon rules from Supabase...</span>
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No promo codes created yet.
                  </td>
                </tr>
              ) : (
                promos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-navy-950 text-xs bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 inline-block">
                        {p.code}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {p.discount_type === 'percentage' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                          <Percent className="w-3 h-3" />
                          <span>{p.discount_value}% OFF</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <IndianRupee className="w-3 h-3" />
                          <span>₹{p.discount_value} FLAT OFF</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 max-w-xs truncate">
                      {p.description}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {p.min_order_amount && Number(p.min_order_amount) > 0 ? (
                        <span className="font-bold text-navy-950">₹{p.min_order_amount}</span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          No Cap
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {p.max_discount_amount && Number(p.max_discount_amount) > 0 ? (
                        <span className="font-bold text-navy-950">₹{p.max_discount_amount}</span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          No Cap
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-gray-500 font-bold">{p.usage_count || 0} times</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition ${
                          p.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-navy-950 hover:bg-gray-100"
                          title="Edit Code"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Code"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-black text-navy-950">
                {editingPromo ? 'Edit Promo Code' : 'Create Customizable Promo Code'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. KOSKOOL20 or FLAT100"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 20% Back to School Discount"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as 'percentage' | 'fixed',
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-navy-950 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Rupee (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {formData.discount_type === 'percentage' ? 'Percent Value (%)' : 'Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: Number(e.target.value) })
                    }
                    placeholder={formData.discount_type === 'percentage' ? '10, 20, 50' : '10, 20, 100'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-navy-950 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Min Order Spend Cap */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Min Order / Cap (₹)</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isMinNoCap) {
                          setIsMinNoCap(true);
                          setFormData((prev) => ({ ...prev, min_order_amount: 0 }));
                        } else {
                          setIsMinNoCap(false);
                          setFormData((prev) => ({ ...prev, min_order_amount: prev.min_order_amount || 499 }));
                        }
                      }}
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition border cursor-pointer ${
                        isMinNoCap
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {isMinNoCap ? '✓ No Cap' : 'No Cap'}
                    </button>
                  </div>
                  <input
                    type={isMinNoCap ? 'text' : 'number'}
                    disabled={isMinNoCap}
                    min={0}
                    value={isMinNoCap ? 'No Cap (₹0 min)' : (formData.min_order_amount ?? '')}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_amount: Number(e.target.value) })
                    }
                    placeholder="e.g. 499"
                    className={`w-full border rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none ${
                      isMinNoCap
                        ? 'bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-navy-950 focus:ring-1 focus:ring-brand-500'
                    }`}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {isMinNoCap ? 'Applies to any cart order total' : `Order total must reach ₹${formData.min_order_amount || 0}`}
                  </p>
                </div>

                {/* Max Discount Cap */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Max Discount Cap (₹)</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isMaxNoCap) {
                          setIsMaxNoCap(true);
                          setFormData((prev) => ({ ...prev, max_discount_amount: 0 }));
                        } else {
                          setIsMaxNoCap(false);
                          setFormData((prev) => ({ ...prev, max_discount_amount: prev.max_discount_amount || 500 }));
                        }
                      }}
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition border cursor-pointer ${
                        isMaxNoCap
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {isMaxNoCap ? '✓ No Cap' : 'No Cap'}
                    </button>
                  </div>
                  <input
                    type={isMaxNoCap ? 'text' : 'number'}
                    disabled={isMaxNoCap}
                    min={1}
                    value={isMaxNoCap ? 'No Cap (Unlimited)' : (formData.max_discount_amount || '')}
                    onChange={(e) =>
                      setFormData({ ...formData, max_discount_amount: Number(e.target.value) })
                    }
                    placeholder="e.g. 1000"
                    className={`w-full border rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none ${
                      isMaxNoCap
                        ? 'bg-gray-100 border-gray-200 text-gray-400 italic cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-navy-950 focus:ring-1 focus:ring-brand-500'
                    }`}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {isMaxNoCap ? 'No limit on max discount' : `Discount capped at ₹${formData.max_discount_amount || 0}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="promo_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <label htmlFor="promo_active" className="text-xs font-bold text-gray-700">
                  Enable coupon immediately on store
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow"
                >
                  Save Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Candidate Confirmation */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-gray-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-navy-950">Delete Promo Code</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to delete <strong className="text-gray-900 font-mono">{deleteCandidate.code}</strong>?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
