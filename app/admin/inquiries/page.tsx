'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  X,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import {
  getInquiries,
  updateInquiry,
  deleteInquiry,
  CustomerInquiry,
} from '@/services/api';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Modal
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<CustomerInquiry | null>(null);

  const fetchInquiriesList = async () => {
    setLoading(true);
    try {
      const data = await getInquiries({ status: statusFilter, search });
      setInquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiriesList();
  }, [statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchInquiriesList();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const handleToggleRead = async (inq: CustomerInquiry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newRead = !inq.is_read;
    await updateInquiry(inq.id, { is_read: newRead });
    fetchInquiriesList();
    if (selectedInquiry && selectedInquiry.id === inq.id) {
      setSelectedInquiry({ ...selectedInquiry, is_read: newRead });
    }
  };

  const handleStatusChange = async (inqId: string, status: CustomerInquiry['status']) => {
    await updateInquiry(inqId, { status });
    fetchInquiriesList();
    if (selectedInquiry && selectedInquiry.id === inqId) {
      setSelectedInquiry({ ...selectedInquiry, status });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteCandidate) {
      await deleteInquiry(deleteCandidate.id);
      setDeleteCandidate(null);
      if (selectedInquiry?.id === deleteCandidate.id) setSelectedInquiry(null);
      fetchInquiriesList();
    }
  };

  const openMessageModal = async (inq: CustomerInquiry) => {
    setSelectedInquiry(inq);
    if (!inq.is_read) {
      await updateInquiry(inq.id, { is_read: true });
      fetchInquiriesList();
    }
  };

  const filteredInquiries = inquiries.filter((i) => {
    if (typeFilter !== 'all' && i.inquiry_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950">Messages &amp; Quotations</h1>
          <p className="text-xs text-gray-500">
            Institutional school purchase requests, bulk uniform quotes, and customer inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
            Total Messages: {inquiries.length}
          </span>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200">
            Unread: {inquiries.filter((i) => !i.is_read).length}
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
            placeholder="Search by name, subject, or email..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Inquiry Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-navy-950 focus:outline-none"
          >
            <option value="all">All Inquiry Types</option>
            <option value="Bulk Quotation">Bulk Quotation</option>
            <option value="Size Exchange">Size Exchange</option>
            <option value="General">General Inquiries</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-navy-950 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 uppercase font-black text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th className="py-3.5 px-4">Customer &amp; Contact</th>
                <th className="py-3.5 px-4">Inquiry Subject / Type</th>
                <th className="py-3.5 px-4">Message Snippet</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Inquiry State</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="w-8 h-8 border-3 border-navy-950 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading messages &amp; quotations...</span>
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No customer inquiries found.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    onClick={() => openMessageModal(inq)}
                    className={`hover:bg-gray-50/80 cursor-pointer transition ${
                      !inq.is_read ? 'bg-brand-50/20 font-bold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          !inq.is_read ? 'bg-brand-600' : 'bg-gray-300'
                        }`}
                        title={!inq.is_read ? 'Unread Message' : 'Read'}
                      />
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-navy-950 block">{inq.customer_name}</span>
                      <span className="text-[11px] text-gray-400 block font-mono">{inq.email}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-black uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded mr-1">
                        {inq.inquiry_type}
                      </span>
                      <span className="text-navy-950 block font-bold truncate max-w-xs mt-0.5">
                        {inq.subject || 'No Subject'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm truncate text-gray-500">
                      {inq.message}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-gray-400 text-[11px]">
                      {new Date(inq.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Inquiry State Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={inq.status}
                        onChange={(e) =>
                          handleStatusChange(inq.id, e.target.value as CustomerInquiry['status'])
                        }
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                          inq.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : inq.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleRead(inq, e)}
                          className="p-1.5 text-gray-400 hover:text-navy-950 hover:bg-gray-100 rounded-lg"
                          title={inq.is_read ? 'Mark as Unread' : 'Mark as Read'}
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(inq)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Message"
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

      {/* Message Reader Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-gray-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded">
                  {selectedInquiry.inquiry_type}
                </span>
                <h2 className="text-lg font-black text-navy-950 mt-1">
                  {selectedInquiry.subject || 'Customer Inquiry'}
                </h2>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Meta */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy-950 text-sm">{selectedInquiry.customer_name}</span>
                <span className="text-gray-400">
                  {new Date(selectedInquiry.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-brand-600" />
                  <a href={`mailto:${selectedInquiry.email}`} className="hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
                {selectedInquiry.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-600" />
                    <a href={`tel:${selectedInquiry.phone}`} className="hover:underline font-mono">
                      {selectedInquiry.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Full Message Body */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Message &amp; Inquiry Content
              </label>
              <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-line">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Quotation Details (if applicable) */}
            {selectedInquiry.quotation_details && (
              <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-xs space-y-1">
                <span className="font-bold text-brand-900 block">Quotation Details:</span>
                <pre className="text-[11px] text-gray-700 font-mono">
                  {JSON.stringify(selectedInquiry.quotation_details, null, 2)}
                </pre>
              </div>
            )}

            {/* Status Changer Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">Update Status:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) =>
                    handleStatusChange(selectedInquiry.id, e.target.value as CustomerInquiry['status'])
                  }
                  className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-navy-950 focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(
                    selectedInquiry.subject || 'KOSKOOL Inquiry'
                  )}`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-gray-200 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-navy-950">Delete Inquiry</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to permanently delete this message from{' '}
              <strong className="text-gray-900">{deleteCandidate.customer_name}</strong>?
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
