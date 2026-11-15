'use client';

import React from 'react';
import { CustomerAddress } from '@/services/api';
import { MapPin, Phone, User, Check, Edit2, Trash2, Star, Navigation } from 'lucide-react';

interface AddressCardProps {
  address: CustomerAddress;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  selectionMode?: boolean;
}

export default function AddressCard({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  selectionMode = false,
}: AddressCardProps) {
  return (
    <div
      onClick={selectionMode && onSelect ? onSelect : undefined}
      className={`relative p-4 sm:p-5 rounded-2xl border transition ${
        selectionMode ? 'cursor-pointer select-none' : ''
      } ${
        isSelected
          ? 'border-brand-600 bg-brand-50/40 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              address.address_type === 'billing'
                ? 'bg-blue-100 text-blue-800'
                : address.address_type === 'both'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {address.address_type === 'both'
              ? 'Shipping & Billing'
              : address.address_type === 'billing'
              ? 'Billing Address'
              : 'Shipping Address'}
          </span>

          {address.is_default && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>Default</span>
            </span>
          )}
        </div>

        {selectionMode && (
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
              isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-300 bg-white'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        )}
      </div>

      {/* Recipient Details */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-bold text-navy-950">{address.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-600 font-mono text-[11px]">{address.phone}</span>
        </div>

        <div className="flex items-start gap-2 pt-1 text-gray-600 leading-relaxed">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            {address.house_flat && <span>{address.house_flat}, </span>}
            <span>{address.street_area}</span>
            {address.landmark && <span className="block text-gray-500 italic">Landmark: {address.landmark}</span>}
            <span className="block font-medium text-navy-950">
              {address.city}, {address.state} - <span className="font-mono">{address.pincode}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Coordinates link if present */}
      {address.latitude && address.longitude && (
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
          <a
            href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            <Navigation className="w-3 h-3" />
            <span>Maps: {Number(address.latitude).toFixed(4)}, {Number(address.longitude).toFixed(4)}</span>
          </a>
          <span className="text-[10px] text-gray-400 font-mono">GPS Verified</span>
        </div>
      )}

      {/* Action Buttons (when not in pure selection mode or below card) */}
      {!selectionMode && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
          {!address.is_default && onSetDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              className="text-[11px] font-bold text-gray-600 hover:text-navy-950"
            >
              Set Default
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="text-[11px] font-bold text-navy-950 hover:text-brand-600 inline-flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
