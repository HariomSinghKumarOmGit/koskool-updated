export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10%, or 150 for ₹150
  minOrderValue: number; // minimum cart subtotal required
  maxDiscount?: number; // max cap for percentage discounts
  description: string;
  isActive: boolean;
  usageCount: number;
  expiryDate?: string;
  createdAt: string;
}

export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 499,
    maxDiscount: 300,
    description: '10% OFF on all school footwear & accessories (Min. order ₹499)',
    isActive: true,
    usageCount: 142,
    createdAt: '2026-01-10',
  },
  {
    id: 'promo-school150',
    code: 'BACKTOSCHOOL',
    discountType: 'fixed',
    discountValue: 150,
    minOrderValue: 899,
    description: 'Flat ₹150 OFF on full school essentials (Min. order ₹899)',
    isActive: true,
    usageCount: 89,
    createdAt: '2026-02-01',
  },
  {
    id: 'promo-season20',
    code: 'KOSKOOL20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 1199,
    maxDiscount: 450,
    description: '20% Mega Season Discount on complete uniform kits (Min. order ₹1,199)',
    isActive: true,
    usageCount: 65,
    createdAt: '2026-02-15',
  },
  {
    id: 'promo-firststep',
    code: 'FIRSTSTEP',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 599,
    description: '₹100 Instant Discount for Kindergarten & Primary parents',
    isActive: true,
    usageCount: 118,
    createdAt: '2026-03-01',
  },
  {
    id: 'promo-save50',
    code: 'SCHOOL50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 399,
    description: 'Flat ₹50 OFF on any stationery or bottle accessory order',
    isActive: true,
    usageCount: 204,
    createdAt: '2026-03-10',
  },
];
