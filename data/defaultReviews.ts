export interface ProductReview {
  id: string;
  product_id: string;
  user_name: string;
  user_email?: string;
  rating: number; // 1 - 5
  title: string;
  comment: string;
  images: string[];
  verified_purchase: boolean;
  recommend: boolean;
  helpful_count: number;
  created_at: string; // ISO date string
  status: 'approved' | 'pending' | 'rejected';
}

export const DEFAULT_PRODUCT_REVIEWS: Record<string, ProductReview[]> = {
  // Men's Daily Wear Sandals WGP53410 - Tan (Featured product)
  'wgp53410-tan': [
    {
      id: 'rev-wgp-1',
      product_id: 'wgp53410-tan',
      user_name: 'Rajesh Sharma',
      user_email: 'rajesh.sharma@gmail.com',
      rating: 5,
      title: 'Supreme daily comfort & excellent grip!',
      comment:
        'I have been wearing Walkaroo sandals for daily office commuting and evening walks. The cushioning in this Tan pair is very soft on the heel and the strap adjustment gives a secure fit. Highly durable sole even on rough pavements.',
      images: [
        '/cdn/shop/files/2_jpg_aa2d262c-cae2-4472-9629-a19d0d14dafa.v_1786511338_width_1600.jpg',
        '/cdn/shop/files/4_jpg_6888c3dd-6316-46eb-8bf8-bf550a997916.v_1786511338_width_1600.jpg',
      ],
      verified_purchase: true,
      recommend: true,
      helpful_count: 14,
      created_at: '2026-11-12T10:30:00.000Z',
      status: 'approved',
    },
    {
      id: 'rev-wgp-2',
      product_id: 'wgp53410-tan',
      user_name: 'Amit Patel',
      user_email: 'amit.patel@yahoo.com',
      rating: 5,
      title: 'Looks premium and fits true to size',
      comment:
        'Got size 8, fits perfectly. The tan shade looks stylish with casual jeans or ethnic kurtas. Super lightweight and anti-skid bottom is great for rainy monsoon days too.',
      images: [
        '/cdn/shop/files/3_jpg_f0a2d306-79d9-48b3-8474-fd7f5b3b2e9b.v_1786511338_width_1600.jpg',
      ],
      verified_purchase: true,
      recommend: true,
      helpful_count: 9,
      created_at: '2026-11-09T14:15:00.000Z',
      status: 'approved',
    },
    {
      id: 'rev-wgp-3',
      product_id: 'wgp53410-tan',
      user_name: 'Suresh Menon',
      user_email: 'suresh.menon@outlook.com',
      rating: 4,
      title: 'Great value for money, fast delivery',
      comment:
        'Delivered in 2 days in solid packaging. Very comfortable footbed. After 3 weeks of continuous use, zero signs of wear or strap loosening. Value for money purchase.',
      images: [
        '/cdn/shop/files/5_jpg_e833f12d-4312-4d71-a966-a93cedf1f630.v_1786511338_width_1600.jpg',
      ],
      verified_purchase: true,
      recommend: true,
      helpful_count: 6,
      created_at: '2026-11-05T08:45:00.000Z',
      status: 'approved',
    },
    {
      id: 'rev-wgp-4',
      product_id: 'wgp53410-tan',
      user_name: 'Vikas Gupta',
      rating: 5,
      title: 'Best sandals in this price segment',
      comment:
        'Far better sole quality than competitors. Does not get slippery when wet. The arch support is comfortable for long standing hours.',
      images: [],
      verified_purchase: true,
      recommend: true,
      helpful_count: 3,
      created_at: '2026-11-01T16:20:00.000Z',
      status: 'approved',
    },
    {
      id: 'rev-wgp-5',
      product_id: 'wgp53410-tan',
      user_name: 'Manish Rawat',
      rating: 4,
      title: 'Comfortable daily footwear',
      comment: 'Very good sandals. Straps are soft and do not bite into the skin. Go for one size up if you have broad feet.',
      images: [],
      verified_purchase: false,
      recommend: true,
      helpful_count: 1,
      created_at: '2026-10-28T11:10:00.000Z',
      status: 'approved',
    },
  ],

  // Black Sandals
  'wgp53283-black': [
    {
      id: 'rev-blk-1',
      product_id: 'wgp53283-black',
      user_name: 'Karan Mehra',
      rating: 5,
      title: 'Sturdy black sandals, high durability',
      comment:
        'Used daily for over a month now. Sole has great traction and the black color looks sleek. Perfect for college and daily walking.',
      images: [
        '/cdn/shop/files/01_2e36b0c1-7cb7-480c-bf0b-26496da73c57.v_1786512192_width_1600.jpg',
      ],
      verified_purchase: true,
      recommend: true,
      helpful_count: 8,
      created_at: '2026-11-10T12:00:00.000Z',
      status: 'approved',
    },
    {
      id: 'rev-blk-2',
      product_id: 'wgp53283-black',
      user_name: 'Deepak Joshi',
      rating: 5,
      title: 'Solid build & lightweight',
      comment: 'Sole is featherlight yet sturdy. Great cushioning.',
      images: [],
      verified_purchase: true,
      recommend: true,
      helpful_count: 4,
      created_at: '2026-11-04T09:30:00.000Z',
      status: 'approved',
    },
  ],

  // School shoes
  'ks-middle-wing-shoes': [
    {
      id: 'rev-sch-1',
      product_id: 'ks-middle-wing-shoes',
      user_name: 'Sunita Mehra',
      rating: 5,
      title: 'Scuff-resistant and long-lasting for school boys',
      comment:
        'My son goes through shoes every 3 months, but these Koskool school shoes have lasted an entire term without any toe peeling. Strong velcro and comfortable insole.',
      images: [
        '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
      ],
      verified_purchase: true,
      recommend: true,
      helpful_count: 18,
      created_at: '2026-11-08T15:20:00.000Z',
      status: 'approved',
    },
    {
      id: 'rev-sch-2',
      product_id: 'ks-middle-wing-shoes',
      user_name: 'Pooja Agarwal',
      rating: 5,
      title: 'Soft padded collar prevents heel blisters',
      comment:
        'Very happy with this purchase. Padded heel collar prevents shoe bites, and easy velcro closure helps kids get ready fast in the morning.',
      images: [],
      verified_purchase: true,
      recommend: true,
      helpful_count: 11,
      created_at: '2026-11-03T11:40:00.000Z',
      status: 'approved',
    },
  ],
};

/**
 * Generates initial realistic seed reviews for any product if it doesn't already have specific reviews
 */
export function generateSeedReviewsForProduct(productId: string, productName: string): ProductReview[] {
  return [
    {
      id: `rev-${productId}-1`,
      product_id: productId,
      user_name: 'Priya Narang',
      user_email: 'priya.n@gmail.com',
      rating: 5,
      title: `Excellent quality - exactly as described!`,
      comment: `Received ${productName} right on time. The material quality, finishing, and comfort exceeded my expectations. True to size and feels very premium.`,
      images: [
        '/cdn/shop/files/2_jpg_aa2d262c-cae2-4472-9629-a19d0d14dafa.v_1786511338_width_1600.jpg',
      ],
      verified_purchase: true,
      recommend: true,
      helpful_count: 7,
      created_at: '2026-11-11T12:00:00.000Z',
      status: 'approved',
    },
    {
      id: `rev-${productId}-2`,
      product_id: productId,
      user_name: 'Arun Kulkarni',
      rating: 5,
      title: 'Comfortable and durable',
      comment: 'Very pleased with the build quality and comfort. The sole has solid cushioning and non-slip traction. Would recommend to friends and family.',
      images: [],
      verified_purchase: true,
      recommend: true,
      helpful_count: 5,
      created_at: '2026-11-06T15:30:00.000Z',
      status: 'approved',
    },
    {
      id: `rev-${productId}-3`,
      product_id: productId,
      user_name: 'Deepa Roy',
      rating: 4,
      title: 'Great product, prompt delivery',
      comment: 'Good fit and attractive design. Delivery was quick and packaging was intact. Value for money product.',
      images: [],
      verified_purchase: true,
      recommend: true,
      helpful_count: 2,
      created_at: '2026-10-30T10:15:00.000Z',
      status: 'approved',
    },
  ];
}
