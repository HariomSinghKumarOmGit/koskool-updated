'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass,
  Building,
  Home,
  Check,
} from 'lucide-react';
import { CustomerAddress } from '@/services/api';

interface GoogleMapsAddressPickerProps {
  initialAddress?: Partial<CustomerAddress>;
  onAddressChange: (address: Partial<CustomerAddress>) => void;
  addressType?: 'shipping' | 'billing' | 'both';
  showAddressTypeSelector?: boolean;
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsScript?: () => void;
  }
}

export default function GoogleMapsAddressPicker({
  initialAddress,
  onAddressChange,
  addressType = 'shipping',
  showAddressTypeSelector = false,
}: GoogleMapsAddressPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const [address, setAddress] = useState<Partial<CustomerAddress>>({
    name: initialAddress?.name || '',
    phone: initialAddress?.phone || '',
    house_flat: initialAddress?.house_flat || '',
    street_area: initialAddress?.street_area || '',
    landmark: initialAddress?.landmark || '',
    city: initialAddress?.city || 'Delhi',
    state: initialAddress?.state || 'Delhi',
    pincode: initialAddress?.pincode || '',
    country: initialAddress?.country || 'India',
    latitude: initialAddress?.latitude || null,
    longitude: initialAddress?.longitude || null,
    formatted_address: initialAddress?.formatted_address || '',
    address_type: initialAddress?.address_type || addressType,
    is_default: initialAddress?.is_default || false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>(null);
  const [googleMapsReady, setGoogleMapsReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Sync back to parent whenever address changes
  const updateAddress = (updates: Partial<CustomerAddress>) => {
    setAddress((prev) => {
      const next = { ...prev, ...updates };
      onAddressChange(next);
      return next;
    });
  };

  // 1. Load Google Maps JS Script if API key is provided
  useEffect(() => {
    if (!apiKey) return;

    if (window.google?.maps) {
      setGoogleMapsReady(true);
      return;
    }

    const scriptId = 'google-maps-js-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsReady(true);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setGoogleMapsReady(true));
    }
  }, [apiKey]);

  // 2. Initialize Google Map & Autocomplete when Google Maps is ready
  useEffect(() => {
    if (!googleMapsReady || !window.google?.maps || !mapContainerRef.current) return;

    const defaultLat = address.latitude || 28.7041;
    const defaultLng = address.longitude || 77.1025;
    const center = new window.google.maps.LatLng(defaultLat, defaultLng);

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstanceRef.current = map;

    const marker = new window.google.maps.Marker({
      position: center,
      map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      title: 'Delivery Address Location',
    });
    markerInstanceRef.current = marker;

    // Draggable marker event listener
    marker.addListener('dragend', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      reverseGeocodeGoogle(lat, lng);
    });

    // Map click to reposition marker
    map.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      marker.setPosition(event.latLng);
      reverseGeocodeGoogle(lat, lng);
    });

    // Places Autocomplete
    if (searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ['address_components', 'geometry', 'formatted_address'],
        types: ['geocode', 'establishment'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        map.setCenter(place.geometry.location);
        map.setZoom(16);
        marker.setPosition(place.geometry.location);

        parseGooglePlace(place, lat, lng);
      });
    }
  }, [googleMapsReady]);

  // Parse Google Place Components into address fields
  const parseGooglePlace = (place: any, lat: number, lng: number) => {
    let houseNumber = '';
    let street = '';
    let sublocality = '';
    let city = '';
    let state = '';
    let pincode = '';
    let country = 'India';

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('street_number') || types.includes('premise') || types.includes('subpremise')) {
          houseNumber = component.long_name;
        } else if (types.includes('route') || types.includes('neighborhood')) {
          street = component.long_name;
        } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
          sublocality = component.long_name;
        } else if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (types.includes('postal_code')) {
          pincode = component.long_name;
        } else if (types.includes('country')) {
          country = component.long_name;
        }
      }
    }

    const streetArea = [street, sublocality].filter(Boolean).join(', ') || place.formatted_address || '';

    updateAddress({
      house_flat: houseNumber || address.house_flat || '',
      street_area: streetArea || address.street_area,
      city: city || address.city || 'Delhi',
      state: state || address.state || 'Delhi',
      pincode: pincode || address.pincode,
      country: country || 'India',
      latitude: lat,
      longitude: lng,
      formatted_address: place.formatted_address || '',
    });

    setLocationMessage({
      text: 'Location selected and address fields updated.',
      type: 'success',
    });
  };

  // Google Reverse Geocoder
  const reverseGeocodeGoogle = (lat: number, lng: number) => {
    if (!window.google?.maps?.Geocoder) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        parseGooglePlace(results[0], lat, lng);
      } else {
        updateAddress({ latitude: lat, longitude: lng });
      }
    });
  };

  // Free OpenStreetMap Nominatim Reverse Geocoding fallback
  const reverseGeocodeFallback = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      if (!res.ok) throw new Error('Geocoding request failed');
      const data = await res.json();
      const addr = data.address || {};

      const houseNumber = addr.house_number || addr.building || '';
      const street = addr.road || addr.suburb || addr.neighbourhood || '';
      const city = addr.city || addr.town || addr.village || addr.county || 'Delhi';
      const state = addr.state || 'Delhi';
      const pincode = addr.postcode || '';
      const country = addr.country || 'India';

      updateAddress({
        house_flat: houseNumber || address.house_flat,
        street_area: street || data.display_name?.split(',')[0] || address.street_area,
        city,
        state,
        pincode,
        country,
        latitude: lat,
        longitude: lng,
        formatted_address: data.display_name || '',
      });

      setLocationMessage({
        text: `Location detected: ${city}, ${state} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        type: 'success',
      });
    } catch {
      updateAddress({ latitude: lat, longitude: lng });
      setLocationMessage({
        text: `Coordinates captured: ${lat.toFixed(4)}, ${lng.toFixed(4)}. Please verify address fields below.`,
        type: 'info',
      });
    }
  };

  // Trigger browser Geolocation
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage({
        text: 'Geolocation is not supported by your browser. Please enter your address manually.',
        type: 'warning',
      });
      return;
    }

    setDetectingLocation(true);
    setLocationMessage({
      text: 'Requesting GPS location permission...',
      type: 'info',
    });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setDetectingLocation(false);

        // Update map if Google Maps is active
        if (mapInstanceRef.current && markerInstanceRef.current && window.google?.maps) {
          const latLng = new window.google.maps.LatLng(lat, lng);
          mapInstanceRef.current.setCenter(latLng);
          mapInstanceRef.current.setZoom(16);
          markerInstanceRef.current.setPosition(latLng);
          reverseGeocodeGoogle(lat, lng);
        } else {
          // Fallback reverse geocoding
          await reverseGeocodeFallback(lat, lng);
        }
      },
      (err) => {
        setDetectingLocation(false);
        let msg = 'Unable to detect your current location. Please enter your address details manually.';
        if (err.code === 1) {
          msg = 'Location permission was denied. You can enter your address details manually below.';
        } else if (err.code === 2) {
          msg = 'Location unavailable. You can enter your address details manually below.';
        } else if (err.code === 3) {
          msg = 'Location detection timed out. You can enter your address details manually below.';
        }
        setLocationMessage({ text: msg, type: 'warning' });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Location Access Prompt Bar */}
      <div className="p-3.5 bg-brand-50/60 border border-brand-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-navy-950 block">Accurate Delivery Location</span>
            <p className="text-[11px] text-gray-600">
              Detect your coordinates for faster dispatch or search via Google Maps. Location sharing is optional.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDetectCurrentLocation}
          disabled={detectingLocation}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow transition shrink-0 self-start sm:self-auto disabled:opacity-60"
        >
          {detectingLocation ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Status or Alert Notification */}
      {locationMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
            locationMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : locationMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {locationMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{locationMessage.text}</span>
        </div>
      )}

      {/* Google Places Search Box */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Search Location / Landmark / Area (Google Maps)
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type your colony, society, street, or PIN code..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          />
        </div>
      </div>

      {/* Map Display & Draggable Pin Container */}
      <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
        {apiKey && googleMapsReady ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-gray-50 to-gray-200">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mb-2 shadow-sm">
              <MapPin className="w-5 h-5 animate-bounce" />
            </div>
            <span className="text-xs font-bold text-navy-950">
              {address.latitude && address.longitude
                ? `GPS Captured: ${Number(address.latitude).toFixed(4)}, ${Number(address.longitude).toFixed(4)}`
                : 'Click "Use Current Location" or Enter Details Below'}
            </span>
            <p className="text-[11px] text-gray-500 max-w-sm mt-0.5">
              {address.latitude && address.longitude
                ? 'Your delivery coordinates are locked for verified doorstep courier routing.'
                : 'Draggable Google Maps marker automatically activates when GPS or API is engaged.'}
            </p>
            {address.latitude && address.longitude && (
              <a
                href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-[10px] font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <span>View on Google Maps</span>
                <Navigation className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Draggable indicator badge */}
        {address.latitude && address.longitude && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-200 text-[10px] font-mono text-gray-700 shadow-sm flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-600" />
            <span>
              {Number(address.latitude).toFixed(4)}, {Number(address.longitude).toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Detailed Address Fields (Always manually editable) */}
      <div className="space-y-3 pt-2">
        {showAddressTypeSelector && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Address Label</label>
            <div className="flex gap-2">
              {(['shipping', 'billing', 'both'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateAddress({ address_type: type })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition border ${
                    address.address_type === type
                      ? 'bg-navy-950 text-white border-navy-950 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type === 'both' ? 'Shipping & Billing' : type}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={address.name || ''}
              onChange={(e) => updateAddress({ name: e.target.value })}
              placeholder="Recipient Name"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={address.phone || ''}
              onChange={(e) => updateAddress({ phone: e.target.value })}
              placeholder="+91 9876543210"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">House / Flat / Block No.</label>
            <input
              type="text"
              value={address.house_flat || ''}
              onChange={(e) => updateAddress({ house_flat: e.target.value })}
              placeholder="e.g. Flat 302, Tower B"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Landmark (Optional)</label>
            <input
              type="text"
              value={address.landmark || ''}
              onChange={(e) => updateAddress({ landmark: e.target.value })}
              placeholder="e.g. Near DPS School / Metro Pillar 42"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Street / Area / Colony *</label>
          <input
            type="text"
            required
            value={address.street_area || ''}
            onChange={(e) => updateAddress({ street_area: e.target.value })}
            placeholder="e.g. Pocket 4, Rohini Sector 15"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
            <input
              type="text"
              required
              value={address.city || ''}
              onChange={(e) => updateAddress({ city: e.target.value })}
              placeholder="City"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
            <input
              type="text"
              required
              value={address.state || ''}
              onChange={(e) => updateAddress({ state: e.target.value })}
              placeholder="State"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code *</label>
            <input
              type="text"
              required
              value={address.pincode || ''}
              onChange={(e) => updateAddress({ pincode: e.target.value })}
              placeholder="110085"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-navy-950 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
