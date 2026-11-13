export interface ColorVariant {
  name: string;
  image: string;
  slug?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discountPercent?: number;
  gender: 'boys' | 'girls' | 'kids' | 'unisex' | 'mens' | 'women';
  schoolLevel: ('kindergarten' | 'middle-wing' | 'senior-wing')[];
  productType: 'school-shoes' | 'sports-shoes' | 'fabric-shoes' | 'bags' | 'accessories' | 'sandals' | 'daily-wear';
  accessoryCategory?:
    | 'bag-accessories'
    | 'geometry-accessories'
    | 'stationery-accessories'
    | 'school-essentials'
    | 'water-bottles'
    | 'pencil-cases'
    | 'hair-accessories'
    | 'dress-accessories'
    | 'head-accessories'
    | 'face-accessories';
  bagCategory?:
    | 'boys-school-bags'
    | 'girls-school-bags'
    | 'kids-school-bags'
    | 'school-backpacks'
    | 'multi-compartment-bags';
  sizes: string[];
  colours: string[];
  primaryColour: string;
  subcategory?: string;
  colorVariants?: ColorVariant[];
  categoryOptions?: string[];
  additionalInfo?: string;
  shippingInfo?: string;
  capacity?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isNewArrival?: boolean;
  features: string[];
  description: string;
  material: string;
  closureType?: string;
  inStock: boolean;
}

export const PRODUCTS: Product[] = [
  // =================== URBANOZ FEATURED PRODUCT ===================
  {
    id: 'wgp53410-tan',
    slug: 'mens-daily-wear-sandals-wgp53410-tan',
    name: "Men's Daily Wear Sandals - WGP53410 Tan",
    brand: 'URBANOZ',
    price: 479,
    originalPrice: 599,
    discountPercent: 20,
    gender: 'mens',
    schoolLevel: [],
    productType: 'sandals',
    sizes: ['6', '7', '8', '9', '10'],
    colours: ['Tan', 'Olive', 'Brown', 'Black'],
    primaryColour: 'Tan',
    colorVariants: [
      {
        name: 'Olive',
        image: '/cdn/shop/files/WGP53410-OLIVE-GENTS_0b87feae-f3ed-4f7f-ad4c-cab242583af4.v_1786511339_width_250.jpg',
      },
      {
        name: 'Tan',
        image: '/cdn/shop/files/WGP53410-TAN-GENTS_7608173e-b30c-4214-ad1d-02182418d1a2.v_1786511338_width_250.jpg',
      },
      {
        name: 'Brown',
        image: '/cdn/shop/files/WGP53410-BROWN-GENTS.v_1787833041_width_250.jpg',
      },
      {
        name: 'Black',
        image: '/cdn/shop/files/WGP53410-FULL-BLACK-GENTS.v_1791882447_width_250.jpg',
      },
    ],
    categoryOptions: ['MENS', 'BOYS'],
    images: [
      '/cdn/shop/files/WGP53410-TAN-GENTS_7608173e-b30c-4214-ad1d-02182418d1a2.v_1786511338_width_1600.jpg',
      '/cdn/shop/files/2_jpg_aa2d262c-cae2-4472-9629-a19d0d14dafa.v_1786511338_width_1600.jpg',
      '/cdn/shop/files/3_jpg_f0a2d306-79d9-48b3-8474-fd7f5b3b2e9b.v_1786511338_width_1600.jpg',
      '/cdn/shop/files/4_jpg_6888c3dd-6316-46eb-8bf8-bf550a997916.v_1786511338_width_1600.jpg',
      '/cdn/shop/files/5_jpg_e833f12d-4312-4d71-a966-a93cedf1f630.v_1786511338_width_1600.jpg',
    ],
    rating: 5.0,
    reviewCount: 2,
    isPopular: true,
    features: [
      'Dual Adjustable Hook-and-Loop Straps',
      'Ergonomic Cushioned Comfort Footbed',
      'Lightweight Flexible PU Sole',
      'Breathable Open-Toe Design',
      'Suede-Finish PU Upper',
    ],
    description: `Experience premium comfort and modern casual styling with the Walkaroo Urbanoz WGP53410 Tan Comfort Sandal. Designed for men who appreciate superior comfort and effortless versatility, this sandal combines a soft PU upper, adjustable fit, and lightweight cushioning to keep you comfortable throughout the day. Ideal for daily wear, travel, indoor use, weekend outings, and relaxed outdoor activities, it delivers a perfect balance of function and style.\n\nCrafted in a rich Tan color, this sandal features a contemporary dual-strap design with adjustable hook-and-loop closures that allow a personalized and secure fit. The premium PU upper with a soft suede-like finish enhances the overall appearance while offering durability and everyday comfort. The open design promotes breathability, making it ideal for long hours of wear.\n\nThe sandal is equipped with a cushioned ergonomic footbed that provides soft underfoot support and improved walking comfort. The lightweight PU sole offers excellent flexibility, shock absorption, and stability, helping reduce foot fatigue during extended use.`,
    additionalInfo: `Manufactured by: Walkaroo International Pvt Ltd. Plot No 10-12, SIDCO Industrial Estate, Malumichampatti, Coimbatore - 641050 India\nCommodity - Footwear\nNumber of Commodity - 2N (1 Pair)\nCountry of Origin - India\nCustomer Care: 011-6119-7311 customercare@walkaroo.in\nPlease Note: The color of the original product may slightly vary due to photography lighting and your screen brightness. All specifications mentioned above might vary by +/- 10%.`,
    shippingInfo: `This item is eligible for our 7 day easy return policy. No questions asked.\nEstimated time of delivery: 2 to 6 working days.\nFree shipping on prepaid orders over ₹499. Cash on delivery available.`,
    material: 'PU (Polyurethane) with Soft Suede Finish, Lightweight PU Sole',
    closureType: 'Dual Adjustable Hook-and-Loop Straps',
    inStock: true,
  },
  // =================== BOUNCEEZ FEATURED PRODUCTS ===================
  {
    id: 'wgp53283-tan',
    slug: 'mens-daily-wear-comfort-sandals-wgp53283-tan',
    name: "Men's Daily Wear Comfort Sandals - WGP53283 Tan",
    brand: 'BOUNCEEZ',
    price: 659,
    originalPrice: 799,
    discountPercent: 18,
    gender: 'mens',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'sandals',
    sizes: ['6', '7', '8', '9', '10'],
    colours: ['Tan', 'Black'],
    primaryColour: 'Tan',
    images: [
      '/cdn/shop/files/WGP53283-Tan_09a905e8-aab9-477e-8d40-01b6f106ed6d.v_1786511246_width_1600.jpg',
      '/cdn/shop/files/WGP53283-Tan_09a905e8-aab9-477e-8d40-01b6f106ed6d.v_1786511246_width_416.jpg',
    ],
    rating: 4.7,
    reviewCount: 28,
    isPopular: true,
    features: ['Arch Support', 'High Grip Outsole', 'Premium Finish Upper', 'Extra Cushioning'],
    description: "Experience cloud-like cushion with Walkaroo Bounceez Men's Daily Wear Comfort Sandals WGP53283 in Tan. Engineered with high-rebound footbed foam.",
    material: 'Bounceez Cushioned EVA, Textured PU Upper',
    closureType: 'Hook-and-Loop Straps',
    inStock: true,
  },
  {
    id: 'wgr53350-olive',
    slug: 'mens-daily-wear-comfort-sandals-wgr53350-olive',
    name: "Men's Daily Wear Comfort Sandals - WGR53350 Olive",
    brand: 'BOUNCEEZ',
    price: 519,
    originalPrice: 649,
    discountPercent: 20,
    gender: 'mens',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'sandals',
    sizes: ['6', '7', '8', '9', '10'],
    colours: ['Olive', 'Brown', 'Black'],
    primaryColour: 'Olive',
    images: [
      '/cdn/shop/files/WGR53350-OLIVE-GENTS.v_1786364308_width_1600.jpg',
      '/cdn/shop/files/WGR53350-OLIVE-GENTS.v_1786364308_width_416.jpg',
    ],
    rating: 5.0,
    reviewCount: 19,
    isPopular: true,
    features: ['High-Traction Tread', 'Ergonomic Arch Contour', 'Dual Tone Sole'],
    description: "Built for all-day active comfort, Bounceez WGR53350 Olive combines rugged durability with soft step absorption.",
    material: 'High-Density PU & Cushioned Footbed',
    closureType: 'Adjustable Velcro',
    inStock: true,
  },
  {
    id: 'wgp53283-black',
    slug: 'mens-daily-wear-comfort-sandals-wgp53283-black',
    name: "Men's Daily Wear Comfort Sandals - WGP53283 Black",
    brand: 'BOUNCEEZ',
    price: 659,
    originalPrice: 799,
    discountPercent: 18,
    gender: 'mens',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'sandals',
    sizes: ['6', '7', '8', '9', '10'],
    colours: ['Black', 'Tan'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/WGP53283-BLACK-GENTS_33255775-1bbc-4b48-9ab6-d08a5f9751ef.v_1786511249_width_1600.jpg',
      '/cdn/shop/files/WGP53283-BLACK-GENTS_33255775-1bbc-4b48-9ab6-d08a5f9751ef.v_1786511249_width_416.jpg',
    ],
    rating: 4.5,
    reviewCount: 14,
    features: ['Deep Heel Cup', 'Anti-Slip Pattern', 'Water-Resistant Upper'],
    description: "Classic black comfort sandal with Bounceez footbed shock absorption.",
    material: 'PU Upper & Cushioned EVA Footbed',
    closureType: 'Velcro Straps',
    inStock: true,
  },
  {
    id: 'wgr53512-olive',
    slug: 'mens-daily-wear-sandals-wgr53512-olive',
    name: "Men's Daily Wear Sandals - WGR53512 Olive",
    brand: 'BOUNCEEZ',
    price: 399,
    originalPrice: 499,
    discountPercent: 20,
    gender: 'mens',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'sandals',
    sizes: ['6', '7', '8', '9', '10'],
    colours: ['Olive', 'Camel', 'Black'],
    primaryColour: 'Olive',
    images: [
      '/cdn/shop/files/WGR53512-OLIVE-GENTS.v_1787896021_width_1600.jpg',
      '/cdn/shop/files/WGR53512-OLIVE-GENTS.v_1787896021_width_416.jpg',
    ],
    rating: 4.8,
    reviewCount: 32,
    features: ['Lightweight Construction', 'Quick Dry Footbed', 'Grippy Outsole'],
    description: "Ultra-comfortable daily wear men's sandals with soft footbed cushioning.",
    material: 'Durable PU Sole & Soft Straps',
    closureType: 'Slip-On with Adjustable Strap',
    inStock: true,
  },
  // =================== BLOOMSY FEATURED PRODUCTS ===================
  {
    id: 'wle74035-mauve',
    slug: 'womens-comfort-sandals-wle74035-mauve',
    name: "Women's Comfort Sandals - WLE74035 Mauve",
    brand: 'URBANOZ',
    price: 699,
    originalPrice: 849,
    discountPercent: 18,
    gender: 'women',
    schoolLevel: ['senior-wing'],
    productType: 'sandals',
    sizes: ['4', '5', '6', '7', '8'],
    colours: ['Mauve', 'Black'],
    primaryColour: 'Mauve',
    images: [
      '/cdn/shop/files/WLE74035-MAUVE-LADIES_c560a32d-9542-4058-910c-7999abcf441c.v_1786511291_width_1600.jpg',
      '/cdn/shop/files/WLE74035-MAUVE-LADIES_c560a32d-9542-4058-910c-7999abcf441c.v_1786511291_width_416.jpg',
    ],
    rating: 5.0,
    reviewCount: 22,
    isPopular: true,
    features: ['Bloom-Ready Botanical Floral Print', 'Ergonomic Cork-Style Insole', 'Metallic Buckle Detail'],
    description: "Step into effortless feminine style with the Bloomsy collection comfort slide sandals in Mauve.",
    material: 'Premium Printed PU Upper, Contoured Footbed',
    closureType: 'Adjustable Metallic Buckle',
    inStock: true,
  },
  {
    id: 'wlr74019-green',
    slug: 'womens-daily-wear-sandal-wlr74019-green',
    name: "Women's Daily Wear Sandal - WLR74019 Green",
    brand: 'WALKAROO',
    price: 349,
    originalPrice: 449,
    discountPercent: 22,
    gender: 'women',
    schoolLevel: ['senior-wing'],
    productType: 'sandals',
    sizes: ['4', '5', '6', '7', '8'],
    colours: ['Green', 'Plum', 'Dusty Rose'],
    primaryColour: 'Green',
    images: [
      '/cdn/shop/files/WLR74019-GREEN-LADIES_e1e56b82-15d9-4523-b6d1-a54d2a353462.v_1786511510_width_1600.jpg',
      '/cdn/shop/files/WLR74019-GREEN-LADIES_e1e56b82-15d9-4523-b6d1-a54d2a353462.v_1786511510_width_416.jpg',
    ],
    rating: 5.0,
    reviewCount: 45,
    isPopular: true,
    features: ['Floral Accent Strap', 'Comfort Wedge Heel', 'Soft Padded Sole'],
    description: "Everyday comfort slip-on sandal with floral printed strap and gentle wedge elevation.",
    material: 'Soft Synthetic Upper & Cushioned Sole',
    closureType: 'Easy Slip-On',
    inStock: true,
  },
  {
    id: 'wlr74019-plum',
    slug: 'womens-daily-wear-sandal-wlr74019-plum',
    name: "Women's Daily Wear Sandal - WLR74019 Plum",
    brand: 'WALKAROO',
    price: 349,
    originalPrice: 449,
    discountPercent: 22,
    gender: 'women',
    schoolLevel: ['senior-wing'],
    productType: 'sandals',
    sizes: ['4', '5', '6', '7', '8'],
    colours: ['Plum', 'Green', 'Dusty Rose'],
    primaryColour: 'Plum',
    images: [
      '/cdn/shop/files/WLR74019-PLUM-LADIES_c8fcbd8e-9505-488c-a8ef-42e9d3fa4376.v_1786511511_width_1600.jpg',
      '/cdn/shop/files/WLR74019-PLUM-LADIES_c8fcbd8e-9505-488c-a8ef-42e9d3fa4376.v_1786511511_width_416.jpg',
    ],
    rating: 5.0,
    reviewCount: 38,
    features: ['Rich Plum Color', 'Padded Arch Comfort', 'Anti-Slip Base'],
    description: "Walk in cloud-soft comfort with the Walkaroo Bloomsy Plum slip-on wedge sandal.",
    material: 'Synthetic Upper & Wedge PU Sole',
    closureType: 'Slip-On',
    inStock: true,
  },
  {
    id: 'wle74035-black',
    slug: 'womens-comfort-sandals-wle74035-black',
    name: "Women's Comfort Sandals - WLE74035 Black",
    brand: 'URBANOZ',
    price: 699,
    originalPrice: 849,
    discountPercent: 18,
    gender: 'women',
    schoolLevel: ['senior-wing'],
    productType: 'sandals',
    sizes: ['4', '5', '6', '7', '8'],
    colours: ['Black', 'Mauve'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/WLE74035-BLACK-LADIES_011ad784-ef3a-4002-8990-08c34686bd01.v_1786511256_width_1600.jpg',
      '/cdn/shop/files/WLE74035-BLACK-LADIES_011ad784-ef3a-4002-8990-08c34686bd01.v_1786511256_width_416.jpg',
    ],
    rating: 4.9,
    reviewCount: 17,
    features: ['Classic Black Floral Pattern', 'Anatomical Footbed', 'Adjustable Fit'],
    description: "Sophisticated black floral comfort sandal from Urbanoz with premium supportive footbed.",
    material: 'PU Upper & Ergonomic Molded Sole',
    closureType: 'Buckle Strap',
    inStock: true,
  },
  // =================== BOYS SCHOOL SHOES ===================
  {
    id: 'ks-b-sch-01',
    slug: 'koskool-boys-velcro-primary-school-shoes-black',
    name: 'KOSKOOL Boys Easy-Strap Velcro School Shoes - Black',
    brand: 'KOSKOOL',
    price: 499,
    originalPrice: 699,
    discountPercent: 28,
    gender: 'boys',
    schoolLevel: ['kindergarten', 'middle-wing'],
    productType: 'school-shoes',
    sizes: ['9C', '10C', '11C', '12C', '13C', '1', '2', '3'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_2_1_1_cfc2bfd3-3fbc-4a7e-b6ec-b0fb79d563ee-xllili.v_1786513107_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_3_1_1_b78da248-35cc-4ce4-93f8-d30088c45e81-gyn8mu.v_1786513107_width_1200.jpg',
    ],
    rating: 4.8,
    reviewCount: 320,
    isPopular: true,
    features: ['High-Traction Anti-Skid Sole', 'Cushioned Padded Collar', 'Breathable Lining', 'Reinforced Scuff-Resistant Toe Guard'],
    description: 'Specially engineered for active kindergarten and junior boys. Features effortless dual-strap velcro for quick wear, impact-absorbing insoles, and water-resistant synthetic upper.',
    material: 'High-Density Water-Resistant PU Upper + TPR Anti-Slip Outsole',
    closureType: 'Velcro Hook-and-Loop',
    inStock: true,
  },
  {
    id: 'ks-b-sch-02',
    slug: 'koskool-boys-derby-lace-up-senior-school-shoes-black',
    name: 'KOSKOOL Boys Classic Derby Lace-Up School Shoes - Deep Black',
    brand: 'KOSKOOL',
    price: 649,
    originalPrice: 899,
    discountPercent: 27,
    gender: 'boys',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'school-shoes',
    sizes: ['3', '4', '5', '6', '7', '8', '9', '10'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/wv502-black-kids_2_1_1_cfc2bfd3-3fbc-4a7e-b6ec-b0fb79d563ee-xllili.v_1786513107_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_3_1_1_b78da248-35cc-4ce4-93f8-d30088c45e81-gyn8mu.v_1786513107_width_1200.jpg',
    ],
    rating: 4.9,
    reviewCount: 412,
    isPopular: true,
    features: ['Standard School Uniform Compliant', 'Memory Foam Heel Pad', 'Flexible Lightweight Sole', 'Breathable Anti-Sweat Lining'],
    description: 'The definitive formal school shoe for middle and senior wing boys. Designed for mandatory assembly inspections and all-day classroom comfort.',
    material: 'Premium Synthetic Leather with High-Grip Rubber Sole',
    closureType: 'Waxed Cotton Lace-Up',
    inStock: true,
  },
  {
    id: 'ks-b-sch-03',
    slug: 'koskool-boys-slip-on-kindergarten-junior-school-shoes',
    name: 'KOSKOOL Boys Junior Elastic Gusset Slip-On School Shoes',
    brand: 'KOSKOOL',
    price: 449,
    originalPrice: 599,
    discountPercent: 25,
    gender: 'boys',
    schoolLevel: ['kindergarten'],
    productType: 'school-shoes',
    sizes: ['9C', '10C', '11C', '12C', '13C', '1', '2'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/wv502-black-kids_4_1_1_28dd9409-7b94-4c81-b85b-01d9daa1bd06-18er2km.v_1786513107_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_5_1_1_9bcd70d3-22e9-4b4b-b284-4ab342eee4d2-1parwzm.v_1786513107_width_1200.jpg',
    ],
    rating: 4.7,
    reviewCount: 185,
    isPopular: false,
    features: ['Ultra-Flexible Sole for Toddlers', 'Zero-Hassle Elastic Sides', 'Scuff Resistant', 'Featherweight Design'],
    description: 'Perfect for nursery and kindergarten boys learning self-sufficiency. Flexible construction supports natural foot arch development.',
    material: 'Durable Faux Leather + Soft PU Cushion Sole',
    closureType: 'Slip-On Elastic',
    inStock: true,
  },
  {
    id: 'ks-b-sch-04',
    slug: 'koskool-boys-formal-oxford-senior-wing-black',
    name: 'KOSKOOL Boys Senior Wing High-Gloss Oxford Shoes',
    brand: 'KOSKOOL',
    price: 799,
    originalPrice: 1099,
    discountPercent: 27,
    gender: 'boys',
    schoolLevel: ['senior-wing'],
    productType: 'school-shoes',
    sizes: ['6', '7', '8', '9', '10', '11'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/wv502-black-kids_3_1_1_b78da248-35cc-4ce4-93f8-d30088c45e81-gyn8mu.v_1786513107_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_2_1_1_cfc2bfd3-3fbc-4a7e-b6ec-b0fb79d563ee-xllili.v_1786513107_width_1200.jpg',
    ],
    rating: 4.9,
    reviewCount: 248,
    isPopular: true,
    features: ['Polished Finish for Assemblies', 'Arch Support Arch-Fit System', 'Heavy-Duty Shock Absorption', 'Abrasion-Resistant Rubber Outsole'],
    description: 'Engineered specifically for Senior Wing students (classes 9 to 12) demanding exceptional polish retention, structural support, and long walking endurance.',
    material: 'High-Grade Synthetic Patent Leather',
    closureType: 'Lace-Up',
    inStock: true,
  },

  // =================== BOYS SPORTS SHOES ===================
  {
    id: 'ks-b-spt-01',
    slug: 'koskool-boys-speed-track-all-white-pt-shoes',
    name: 'KOSKOOL Boys SpeedTrack PT & Sports Shoes - Pure White',
    brand: 'KOSKOOL',
    price: 549,
    originalPrice: 799,
    discountPercent: 31,
    gender: 'boys',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'sports-shoes',
    sizes: ['10C', '11C', '12C', '13C', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    colours: ['White'],
    primaryColour: 'White',
    images: [
      '/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg',
      '/cdn/shop/files/SGE24001-whitegrey_8d131c0b-ba2c-4914-9b46-5378bf6091c3.v_1786512160_width_416.jpg',
    ],
    rating: 4.8,
    reviewCount: 510,
    isPopular: true,
    features: ['Mandatory Uniform Approved All-White', 'High-Airflow Honeycomb Mesh', 'Non-Marking Court Rubber Outsole', 'EVA Cushion Midsole'],
    description: 'The quintessential white sports shoe approved by top CBSE and ICSE schools for sports days, PT sessions, running, and athletic activities.',
    material: 'Breathable Sports Mesh + Lightweight EVA Shock-Absorb Midsole',
    closureType: 'Lace-Up with Reinforced Eyelets',
    inStock: true,
  },
  {
    id: 'ks-b-spt-02',
    slug: 'koskool-boys-junior-sprint-velcro-white-sports-shoes',
    name: 'KOSKOOL Boys Junior Sprint Strap Sports Shoes - White & Blue',
    brand: 'KOSKOOL',
    price: 499,
    originalPrice: 699,
    discountPercent: 28,
    gender: 'boys',
    schoolLevel: ['kindergarten', 'middle-wing'],
    productType: 'sports-shoes',
    sizes: ['9C', '10C', '11C', '12C', '13C', '1', '2'],
    colours: ['White', 'Navy Blue'],
    primaryColour: 'White',
    images: [
      '/cdn/shop/files/WY3466-Blue-White_1606e288-e9a8-4a20-9203-90a9ca24920b.v_1786512467_width_416.jpg',
      '/cdn/shop/files/WY3344-White-blue_cce8c41e-7c58-45c5-b7a9-d0531217be94.v_1786512863_width_416.jpg',
    ],
    rating: 4.7,
    reviewCount: 160,
    isPopular: false,
    features: ['Dual Fast-Strap Velcro', 'Bouncy EVA Midsole', 'Mud and Stain Resistant Upper', 'Grippy Tread Pattern'],
    description: 'Built for spirited playground playtime and gym class. Easy-on hook and loop straps allow little boys to gear up independently.',
    material: 'Synthetic Leather + Breathable Mesh Panels',
    closureType: 'Velcro Straps',
    inStock: true,
  },
  {
    id: 'ks-b-spt-03',
    slug: 'koskool-boys-senior-aeroflight-white-sports-trainer',
    name: 'KOSKOOL Boys AeroFlight Senior PT Trainer - Solid White',
    brand: 'KOSKOOL',
    price: 699,
    originalPrice: 999,
    discountPercent: 30,
    gender: 'boys',
    schoolLevel: ['senior-wing'],
    productType: 'sports-shoes',
    sizes: ['6', '7', '8', '9', '10', '11'],
    colours: ['White'],
    primaryColour: 'White',
    images: [
      '/cdn/shop/files/SGE24001-White-tan_f13bbfa4-938d-45d7-89f9-cf9748dde12a.v_1786511603_width_1600.jpg',
      '/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg',
    ],
    rating: 4.9,
    reviewCount: 380,
    isPopular: true,
    features: ['High-Performance Torsion Control', 'Dual-Density Cushioning', 'Reinforced Heel Counter', 'Anti-Odor Insole'],
    description: 'Engineered for senior school athletics, track events, football turf practice, and strict uniform code PT periods.',
    material: 'Aerated Knit Mesh + Durable Rubber Outsole',
    closureType: 'Lace-Up',
    inStock: true,
  },

  // =================== BOYS FABRIC SHOES ===================
  {
    id: 'ks-b-fab-01',
    slug: 'koskool-boys-heavy-duty-canvas-black-fabric-shoes',
    name: 'KOSKOOL Boys Heavy-Duty Vulcanized Canvas Shoes - Black',
    brand: 'KOSKOOL',
    price: 399,
    originalPrice: 549,
    discountPercent: 27,
    gender: 'boys',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'fabric-shoes',
    sizes: ['11C', '12C', '13C', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/WE1356-Black_3dd08639-1ba0-4c08-86fb-b5ddf6184a12.v_1781172079_width_1600.jpg',
      '/cdn/shop/files/WE1347-BLACK-GENTS_48ae184d-5dcd-408d-b3a0-9ca582f7c6e0.v_1786511741_width_1600.jpg',
    ],
    rating: 4.6,
    reviewCount: 290,
    isPopular: true,
    features: ['100% Breathable Duck Canvas', 'Vulcanized Skid-Proof Sole', 'Machine Washable Fabric', 'Reinforced Metal Eyelets'],
    description: 'The timeless breathable cotton fabric shoe for Indian summers. Keeps active feet sweat-free and comfortable during long school hours.',
    material: 'Heavy 12oz Pure Cotton Canvas + Vulcanized Rubber Sole',
    closureType: 'Lace-Up',
    inStock: true,
  },
  {
    id: 'ks-b-fab-02',
    slug: 'koskool-boys-white-canvas-drill-fabric-shoes',
    name: 'KOSKOOL Boys White Canvas Drill & PT Fabric Shoes',
    brand: 'KOSKOOL',
    price: 389,
    originalPrice: 499,
    discountPercent: 22,
    gender: 'boys',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'fabric-shoes',
    sizes: ['10C', '11C', '12C', '13C', '1', '2', '3', '4', '5', '6', '7', '8'],
    colours: ['White'],
    primaryColour: 'White',
    images: [
      '/cdn/shop/files/SGE24001-whitegrey_8d131c0b-ba2c-4914-9b46-5378bf6091c3.v_1786512160_width_416.jpg',
      '/cdn/shop/files/WY3466-Blue-White_1606e288-e9a8-4a20-9203-90a9ca24920b.v_1786512467_width_416.jpg',
    ],
    rating: 4.7,
    reviewCount: 340,
    isPopular: false,
    features: ['Easy Chalk Washable Fabric', 'Non-Yellowing Rubber Toe Cap', 'Super Flexible Step', 'Lightweight Feel'],
    description: 'Classic school drill and march-past canvas shoes. Easy to clean with white shoe whitener or regular wash.',
    material: 'Breathable White Duck Fabric + Durable Rubber Rim',
    closureType: 'Lace-Up',
    inStock: true,
  },

  // =================== GIRLS SCHOOL SHOES ===================
  {
    id: 'ks-g-sch-01',
    slug: 'koskool-girls-mary-jane-velcro-buckle-school-shoes-black',
    name: 'KOSKOOL Girls Classic Mary Jane School Shoes - Deep Black',
    brand: 'KOSKOOL',
    price: 499,
    originalPrice: 699,
    discountPercent: 28,
    gender: 'girls',
    schoolLevel: ['kindergarten', 'middle-wing'],
    productType: 'school-shoes',
    sizes: ['9C', '10C', '11C', '12C', '13C', '1', '2', '3', '4'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_5_1_1_9bcd70d3-22e9-4b4b-b284-4ab342eee4d2-1parwzm.v_1786513107_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_2_1_1_cfc2bfd3-3fbc-4a7e-b6ec-b0fb79d563ee-xllili.v_1786513107_width_1200.jpg',
    ],
    rating: 4.9,
    reviewCount: 420,
    isPopular: true,
    features: ['Single Touch-Strap Mary Jane Closure', 'Padded Cushioned Ankle Collar', 'Scuff-Resistant Synthetic Leather', 'Anti-Slip Ribbed Sole'],
    description: 'The quintessential girls school shoe with the beloved Mary Jane silhouette. Designed for kindergarten and middle wing girls with high-grip soles.',
    material: 'High-Density Water-Resistant PU Leather + Flexible Rubber Outsole',
    closureType: 'Single Velcro Strap with Decorative Buckle',
    inStock: true,
  },
  {
    id: 'ks-g-sch-02',
    slug: 'koskool-girls-senior-ballerina-moc-school-shoes-black',
    name: 'KOSKOOL Girls Senior Wing Comfort Ballerina School Shoes',
    brand: 'KOSKOOL',
    price: 599,
    originalPrice: 849,
    discountPercent: 29,
    gender: 'girls',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'school-shoes',
    sizes: ['3', '4', '5', '6', '7', '8'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/wv502-black-kids_4_1_1_28dd9409-7b94-4c81-b85b-01d9daa1bd06-18er2km.v_1786513107_width_1200.jpg',
      '/cdn/shop/files/wv502-black-kids_1_1_1_554340d2-d58b-45d0-aa0a-165b3798e5c8-1gswyvf.v_1786513108_width_1200.jpg',
    ],
    rating: 4.8,
    reviewCount: 310,
    isPopular: true,
    features: ['Elegant Minimalist Uniform Look', 'Orthopedic Cushion Insole', 'Anti-Bite Soft Heel Notch', 'Quiet Step Sound-Dampening Sole'],
    description: 'Specifically crafted for senior school girls needing a dressy yet deeply supportive shoe for assemblies, lab work, and daily classes.',
    material: 'Matte Finish Synthetic Leather',
    closureType: 'Slip-On Comfort Fit',
    inStock: true,
  },
  {
    id: 'ks-g-sch-03',
    slug: 'koskool-girls-derby-lace-up-formal-school-shoes-black',
    name: 'KOSKOOL Girls Uniform Lace-Up Oxford School Shoes - Black',
    brand: 'KOSKOOL',
    price: 629,
    originalPrice: 899,
    discountPercent: 30,
    gender: 'girls',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'school-shoes',
    sizes: ['3', '4', '5', '6', '7', '8'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/W1030-BLACK-GENTS_37127caa-12a4-4e9c-914b-f06d017577a5.v_1786513424_width_1600.jpg',
      '/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg',
    ],
    rating: 4.7,
    reviewCount: 195,
    isPopular: false,
    features: ['CBSE/ICSE Uniform Approved', 'Reinforced Toe Box', 'Sweat-Absorbing Antibacterial Sock Liner', 'Non-Slip Heel Base'],
    description: 'For schools specifying lace-up formal footwear for girls. Built to withstand extensive wear throughout the academic year.',
    material: 'High-Durability Faux Leather',
    closureType: 'Lace-Up',
    inStock: true,
  },

  // =================== GIRLS SPORTS SHOES ===================
  {
    id: 'ks-g-spt-01',
    slug: 'koskool-girls-aerorun-white-sports-shoes',
    name: 'KOSKOOL Girls AeroRun All-White PT & Sports Shoes',
    brand: 'KOSKOOL',
    price: 549,
    originalPrice: 799,
    discountPercent: 31,
    gender: 'girls',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'sports-shoes',
    sizes: ['10C', '11C', '12C', '13C', '1', '2', '3', '4', '5', '6', '7', '8'],
    colours: ['White'],
    primaryColour: 'White',
    images: [
      '/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg',
      '/cdn/shop/files/SGE24001-White-tan_f13bbfa4-938d-45d7-89f9-cf9748dde12a.v_1786511603_width_1600.jpg',
    ],
    rating: 4.9,
    reviewCount: 460,
    isPopular: true,
    features: ['100% Solid White Uniform Approved', 'Featherlight Shock Absorbing Sole', 'Breathable Upper Mesh', 'Easy Wipe-Clean Trim'],
    description: 'Approved for sports day, aerobics, PT drills, and playground activities. Provides superior bounce and arch protection.',
    material: 'Engineered Air-Mesh + EVA Soft Compound',
    closureType: 'Lace-Up with Cushioned Tongue',
    inStock: true,
  },
  {
    id: 'ks-g-spt-02',
    slug: 'koskool-girls-junior-velcro-white-sports-sneakers',
    name: 'KOSKOOL Girls Junior Touch-Strap White PT Sneakers',
    brand: 'KOSKOOL',
    price: 499,
    originalPrice: 699,
    discountPercent: 28,
    gender: 'girls',
    schoolLevel: ['kindergarten', 'middle-wing'],
    productType: 'sports-shoes',
    sizes: ['9C', '10C', '11C', '12C', '13C', '1', '2'],
    colours: ['White'],
    primaryColour: 'White',
    images: [
      '/cdn/shop/files/WY3344-White-blue_cce8c41e-7c58-45c5-b7a9-d0531217be94.v_1786512863_width_416.jpg',
      '/cdn/shop/files/SGE24001-whitegrey_8d131c0b-ba2c-4914-9b46-5378bf6091c3.v_1786512160_width_416.jpg',
    ],
    rating: 4.8,
    reviewCount: 220,
    isPopular: false,
    features: ['Dual Quick-Fasten Straps', 'Cushioned Footbed', 'Anti-Slip Rubber Grooves', 'Lightweight Play Structure'],
    description: 'Specially fitted for young girls in kindergarten and junior classes. Easy to fasten and take off without teacher assistance.',
    material: 'Durable Polyurethane Mesh Upper',
    closureType: 'Velcro Double Strap',
    inStock: true,
  },

  // =================== GIRLS FABRIC SHOES ===================
  {
    id: 'ks-g-fab-01',
    slug: 'koskool-girls-mary-jane-black-canvas-fabric-shoes',
    name: 'KOSKOOL Girls Cotton Canvas Mary Jane Shoes - Black',
    brand: 'KOSKOOL',
    price: 379,
    originalPrice: 499,
    discountPercent: 24,
    gender: 'girls',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'fabric-shoes',
    sizes: ['10C', '11C', '12C', '13C', '1', '2', '3', '4', '5', '6', '7'],
    colours: ['Black'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/WE1356-Black_3dd08639-1ba0-4c08-86fb-b5ddf6184a12.v_1781172079_width_1600.jpg',
      '/cdn/shop/files/WE2362-Black-Ladies_37f3a155-dc4d-48d2-97a2-c5d95c6c7d49.v_1786512084_width_1600.jpg',
    ],
    rating: 4.6,
    reviewCount: 175,
    isPopular: false,
    features: ['100% Breathable Pure Cotton Canvas', 'Elastic Step-In Band', 'Machine Wash Safe', 'Flexible Vulcanized Sole'],
    description: 'Soft, airy canvas footwear for everyday school sessions, cultural activities, and hot humid climate.',
    material: 'Fine Weave Cotton Canvas + Non-Slip Rubber Base',
    closureType: 'Elastic Strap / Buckle',
    inStock: true,
  },
  {
    id: 'ks-g-fab-02',
    slug: 'koskool-girls-white-canvas-drill-pt-fabric-shoes',
    name: 'KOSKOOL Girls White Drill & PT Canvas Fabric Shoes',
    brand: 'KOSKOOL',
    price: 379,
    originalPrice: 499,
    discountPercent: 24,
    gender: 'girls',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'fabric-shoes',
    sizes: ['10C', '11C', '12C', '13C', '1', '2', '3', '4', '5', '6', '7'],
    colours: ['White'],
    primaryColour: 'White',
    images: [
      '/cdn/shop/files/SGE24001-whitegrey_8d131c0b-ba2c-4914-9b46-5378bf6091c3.v_1786512160_width_416.jpg',
      '/cdn/shop/files/WY3466-Blue-White_1606e288-e9a8-4a20-9203-90a9ca24920b.v_1786512467_width_416.jpg',
    ],
    rating: 4.7,
    reviewCount: 230,
    isPopular: false,
    features: ['Traditional March-Past & Drill Spec', 'Breathable Heavy Fabric', 'Durable Rubber Cap', 'Easy to Whitewash'],
    description: 'School assembly and parade standard white canvas shoe with high stitch density and grip.',
    material: 'Natural Cotton Canvas + Gum Rubber Sole',
    closureType: 'Lace-Up',
    inStock: true,
  },

  // =================== ACCESSORIES (BOYS, GIRLS, KIDS) ===================
  {
    id: 'ks-acc-bot-01',
    slug: 'koskool-stainless-steel-insulated-school-water-bottle-750ml',
    name: 'KOSKOOL Insulated Stainless Steel School Water Bottle (750ml)',
    brand: 'KOSKOOL',
    price: 349,
    originalPrice: 499,
    discountPercent: 30,
    gender: 'unisex',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'accessories',
    accessoryCategory: 'water-bottles',
    sizes: ['750ml'],
    colours: ['Navy Blue', 'Silver', 'Black', 'Pastel Pink'],
    primaryColour: 'Navy Blue',
    images: [
      '/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg',
      '/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg',
    ],
    rating: 4.9,
    reviewCount: 520,
    isPopular: true,
    features: ['Keeps Cold for 18h / Hot for 12h', '100% Leak-Proof Push Lock Cap', 'Food-Grade 304 Stainless Steel', 'Durable Powder Coat Finish'],
    description: 'Built tough to endure rough school days. Double-wall vacuum insulation keeps drinking water crisp and cool through afternoon classes.',
    material: 'Food-Grade SS 304 + BPA-Free Sipper Lid',
    inStock: true,
  },
  {
    id: 'ks-acc-pen-01',
    slug: 'koskool-multi-tier-hardtop-school-pencil-case',
    name: 'KOSKOOL Multi-Tier Embossed Hardtop School Pencil Case',
    brand: 'KOSKOOL',
    price: 299,
    originalPrice: 449,
    discountPercent: 33,
    gender: 'unisex',
    schoolLevel: ['kindergarten', 'middle-wing'],
    productType: 'accessories',
    accessoryCategory: 'pencil-cases',
    sizes: ['Standard'],
    colours: ['Navy Blue', 'Deep Black', 'Pastel Pink'],
    primaryColour: 'Navy Blue',
    images: [
      '/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg',
      '/cdn/shop/files/WK473-PINK_KIDS_ea22c13b-148c-4214-8320-c907acb7d395.v_1786512672_width_1600.jpg',
    ],
    rating: 4.8,
    reviewCount: 380,
    isPopular: true,
    features: ['Shock-Absorbent Hard EVA Shell', 'Mesh Zipper Compartment', 'Pen Slot Organizer Loops', 'Smooth Heavy-Duty Metal Zippers'],
    description: 'Keeps pens, pencils, erasers, compasses, and rulers neatly organized and protected against accidental drops in school.',
    material: 'Shockproof EVA + Scratch-Resistant Fabric Lining',
    inStock: true,
  },
  {
    id: 'ks-acc-geo-01',
    slug: 'koskool-precision-mathematical-geometry-box-set',
    name: 'KOSKOOL Precision Mathematical Geometry Instrument Box',
    brand: 'KOSKOOL',
    price: 199,
    originalPrice: 299,
    discountPercent: 33,
    gender: 'boys',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'accessories',
    accessoryCategory: 'geometry-accessories',
    sizes: ['Standard Set'],
    colours: ['Silver', 'Navy Blue'],
    primaryColour: 'Silver',
    images: [
      '/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg',
      '/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg',
    ],
    rating: 4.8,
    reviewCount: 260,
    isPopular: false,
    features: ['Rust-Resistant Die-Cast Zinc Instruments', 'Transparent Acrylic Set Squares & Protractor', 'Self-Centering Compass Mechanism', 'Sturdy Tin Case'],
    description: 'Designed for engineering drawing, CBSE mathematics, and geometry practicals with ultra-precise graduation markings.',
    material: 'Zinc Alloy + Optical-Grade Clear Acrylic',
    inStock: true,
  },
  {
    id: 'ks-acc-hair-01',
    slug: 'koskool-girls-uniform-hair-ribbon-bands-combo-pack',
    name: 'KOSKOOL Girls School Uniform Ribbon & Hair Bands Combo Pack',
    brand: 'KOSKOOL',
    price: 149,
    originalPrice: 229,
    discountPercent: 35,
    gender: 'girls',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'accessories',
    accessoryCategory: 'hair-accessories',
    sizes: ['Free Size (Pack of 6)'],
    colours: ['Black', 'White', 'Navy Blue', 'Red'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/WK473-PINK_KIDS_ea22c13b-148c-4214-8320-c907acb7d395.v_1786512672_width_1600.jpg',
      '/cdn/shop/files/WK388-BEIGEPINK-KIDS_b512b642-18fc-430d-b9bf-2420aabca356.v_1786511561_width_1600.jpg',
    ],
    rating: 4.9,
    reviewCount: 310,
    isPopular: true,
    features: ['Snag-Free Elastic Grip', 'Durable Satin Ribbon Finish', 'Standard School Uniform Approved Colors', 'Crease-Resistant'],
    description: 'Approved for school morning inspection guidelines. Pack includes matching satin ribbons, non-slip hair ties, and hair pins.',
    material: 'High-Stretch Elastic + Premium Satin Ribbons',
    inStock: true,
  },
  {
    id: 'ks-acc-ess-01',
    slug: 'koskool-all-weather-shoe-polish-brush-care-kit',
    name: 'KOSKOOL Complete School Shoe Care & High-Shine Polish Kit',
    brand: 'KOSKOOL',
    price: 249,
    originalPrice: 349,
    discountPercent: 29,
    gender: 'unisex',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'accessories',
    accessoryCategory: 'school-essentials',
    sizes: ['Care Kit Set'],
    colours: ['Black', 'Neutral'],
    primaryColour: 'Black',
    images: [
      '/cdn/shop/files/WGP58090-BLACK-GENTS_b5b4c509-016f-4659-b460-d6d86ffac5b8.v_1787997065_width_1600.jpg',
      '/cdn/shop/files/WGE53354-BLACK-GENTS_4d4814a1-64d8-45b9-a7b8-722cf22d3c8e.v_1786511261_width_1600.jpg',
    ],
    rating: 4.9,
    reviewCount: 440,
    isPopular: true,
    features: ['Natural Carnauba Wax Polish (Black)', 'Pure Horsehair Buffing Brush', 'White Canvas Whitener Sponge', 'Microfiber Polishing Cloth'],
    description: 'Everything students need for mirror-shine shoes and clean white PT shoes every morning. Nourishes synthetic and genuine leathers.',
    material: 'Wax Emulsion + Wood Grip Bristle Brush',
    inStock: true,
  },
  {
    id: 'ks-acc-bagacc-01',
    slug: 'koskool-reflective-rain-cover-school-bag-accessory',
    name: 'KOSKOOL High-Visibility Reflective Rain Cover for School Bags',
    brand: 'KOSKOOL',
    price: 189,
    originalPrice: 299,
    discountPercent: 37,
    gender: 'unisex',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'accessories',
    accessoryCategory: 'bag-accessories',
    sizes: ['Fits 20L - 35L Bags'],
    colours: ['Fluorescent Yellow', 'Navy Blue', 'Silver'],
    primaryColour: 'Fluorescent Yellow',
    images: [
      '/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg',
      '/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg',
    ],
    rating: 4.8,
    reviewCount: 195,
    isPopular: false,
    features: ['100% Waterproof PU Coated Polyester', '3M Reflective Safety Strips for Low Light', 'Elastic Hem for Snug Fit', 'Compact Foldable Pouch'],
    description: 'Keeps textbooks and homework completely dry during monsoon downpours while keeping students visible to oncoming traffic on early mornings.',
    material: '210T Waterproof Ripstop Polyester',
    inStock: true,
  },
  {
    id: 'ks-acc-dress-01',
    slug: 'koskool-girls-cotton-rich-school-uniform-socks-pack-of-3',
    name: 'KOSKOOL Girls Cushion-Sole School Uniform Socks (Pack of 3)',
    brand: 'KOSKOOL',
    price: 199,
    originalPrice: 299,
    discountPercent: 33,
    gender: 'girls',
    schoolLevel: ['kindergarten', 'middle-wing', 'senior-wing'],
    productType: 'accessories',
    accessoryCategory: 'dress-accessories',
    sizes: ['Small (4-7 yrs)', 'Medium (8-12 yrs)', 'Large (13+ yrs)'],
    colours: ['White', 'Navy Blue', 'Black'],
    primaryColour: 'White',
    images: [
      '/cdn/shop/files/SGE24001-WhiteBlue_0f422c14-0bd9-47ae-8183-cac6302b38b8.v_1786512168_width_1600.jpg',
      '/cdn/shop/files/WY3466-Blue-White_1606e288-e9a8-4a20-9203-90a9ca24920b.v_1786512467_width_416.jpg',
    ],
    rating: 4.9,
    reviewCount: 380,
    isPopular: true,
    features: ['Terry Cushion Heel & Toe Support', 'Seamless Toe Closure (No Blistering)', 'Stay-Up Ribbed Calf Cuff', 'Odor-Control Silver Tech'],
    description: 'Super-soft combed cotton school socks designed to eliminate shoe rubbing, blister discomfort, and unpleasant odor.',
    material: '82% Combed Cotton, 15% Polyamide, 3% Elastane',
    inStock: true,
  },
  {
    id: 'ks-acc-head-01',
    slug: 'koskool-kids-sun-protective-school-sports-cap',
    name: 'KOSKOOL Kids Sun-Shield Uniform Sports Cap - Navy',
    brand: 'KOSKOOL',
    price: 179,
    originalPrice: 249,
    discountPercent: 28,
    gender: 'kids',
    schoolLevel: ['kindergarten', 'middle-wing'],
    productType: 'accessories',
    accessoryCategory: 'head-accessories',
    sizes: ['Adjustable Free Size'],
    colours: ['Navy Blue', 'White', 'Maroon'],
    primaryColour: 'Navy Blue',
    images: [
      '/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg',
      '/cdn/shop/files/WK722-MAROON-KIDS.v_1786511451_width_1600.jpg',
    ],
    rating: 4.7,
    reviewCount: 140,
    isPopular: false,
    features: ['UPF 50+ Sun Protection', 'Moisture-Wicking Inner Sweatband', 'Adjustable Rear Strap', 'Pre-Curved Sturdy Visor'],
    description: 'Shields young students from harsh sunlight during assembly and outdoor sports periods.',
    material: '100% Breathable Cotton Twill',
    inStock: true,
  },
  {
    id: 'ks-acc-face-01',
    slug: 'koskool-kids-breathable-protective-school-mask-pack-of-3',
    name: 'KOSKOOL Kids Comfort-Fit Breathable School Mask (Pack of 3)',
    brand: 'KOSKOOL',
    price: 129,
    originalPrice: 199,
    discountPercent: 35,
    gender: 'kids',
    schoolLevel: ['kindergarten', 'middle-wing'],
    productType: 'accessories',
    accessoryCategory: 'face-accessories',
    sizes: ['Kids Fit (Pack of 3)'],
    colours: ['Navy Blue', 'Grey', 'Black'],
    primaryColour: 'Navy Blue',
    images: [
      '/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg',
      '/cdn/shop/files/WK722-MAROON-KIDS.v_1786511451_width_1600.jpg',
    ],
    rating: 4.7,
    reviewCount: 110,
    isPopular: false,
    features: ['3-Layer Meltblown Filtration', 'Ultra-Soft Elastic Ear Loops', 'Washable & Reusable Up to 30 Times', 'School Color Coded'],
    description: 'Designed specifically for children’s facial contours to ensure unhindered breathing while protecting against school bus dust and allergens.',
    material: 'Organic Cotton Outer + Non-Woven Filter Layer',
    inStock: true,
  },

  // =================== BAGS ===================
  {
    id: 'ks-bag-01',
    slug: 'koskool-ergonomic-multi-compartment-school-backpack-32l',
    name: 'KOSKOOL Pro-Spine Multi-Compartment School Backpack (32L)',
    brand: 'KOSKOOL',
    price: 999,
    originalPrice: 1499,
    discountPercent: 33,
    gender: 'unisex',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'bags',
    bagCategory: 'multi-compartment-bags',
    sizes: ['32 Litres'],
    colours: ['Navy Blue', 'Deep Black', 'Slate Grey'],
    primaryColour: 'Navy Blue',
    capacity: '32 Litres',
    images: [
      '/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg',
      '/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg',
    ],
    rating: 4.9,
    reviewCount: 680,
    isPopular: true,
    features: ['Orthopedic Spine-Relief Back Padding', '4 Large Organized Zipper Compartments', 'Padded 15.6" Laptop/Tablet Sleeve', 'Dual Umbrella & Bottle Pockets', 'Water-Repellent Dobby Shell'],
    description: 'Engineered to reduce shoulder fatigue caused by heavy textbooks. Tested to withstand up to 15 kg of weight with bar-tack reinforced load points.',
    material: '900D Heavy-Duty Water-Repellent Dobby Polyester',
    inStock: true,
  },
  {
    id: 'ks-bag-02',
    slug: 'koskool-boys-heavy-duty-school-backpack-28l',
    name: 'KOSKOOL Boys ToughGear School Backpack (28L) - Black & Blue',
    brand: 'KOSKOOL',
    price: 849,
    originalPrice: 1299,
    discountPercent: 35,
    gender: 'boys',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'bags',
    bagCategory: 'boys-school-bags',
    sizes: ['28 Litres'],
    colours: ['Black', 'Navy Blue'],
    primaryColour: 'Black',
    capacity: '28 Litres',
    images: [
      '/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg',
      '/cdn/shop/files/WGE53354-BLACK-GENTS_4d4814a1-64d8-45b9-a7b8-722cf22d3c8e.v_1786511261_width_1600.jpg',
    ],
    rating: 4.8,
    reviewCount: 420,
    isPopular: true,
    features: ['Reinforced Rubberized Base', 'Wide Ergonomic S-Shaped Shoulder Straps', 'Stationery Organizer Pocket', 'Sturdy SBS Zippers'],
    description: 'Rugged build made for energetic school boys. Includes reinforced corners, durable grab handle, and balanced weight distribution.',
    material: '600D Tear-Resistant Polyester',
    inStock: true,
  },
  {
    id: 'ks-bag-03',
    slug: 'koskool-girls-pastelle-cushioned-school-backpack-26l',
    name: 'KOSKOOL Girls Pastelle Ergonomic School Backpack (26L)',
    brand: 'KOSKOOL',
    price: 899,
    originalPrice: 1349,
    discountPercent: 33,
    gender: 'girls',
    schoolLevel: ['middle-wing', 'senior-wing'],
    productType: 'bags',
    bagCategory: 'girls-school-bags',
    sizes: ['26 Litres'],
    colours: ['Pastel Pink', 'Lilac', 'Sky Blue', 'Teal'],
    primaryColour: 'Pastel Pink',
    capacity: '26 Litres',
    images: [
      '/cdn/shop/files/WK473-PINK_KIDS_ea22c13b-148c-4214-8320-c907acb7d395.v_1786512672_width_1600.jpg',
      '/cdn/shop/files/WK388-BEIGEPINK-KIDS_b512b642-18fc-430d-b9bf-2420aabca356.v_1786511561_width_1600.jpg',
    ],
    rating: 4.9,
    reviewCount: 390,
    isPopular: true,
    features: ['Lightweight Construction (Only 480g)', 'Breathable Honeycomb Mesh Back Padding', 'Secret Anti-Theft Back Pocket', 'Keyclip & Pen Holders'],
    description: 'A stylish, elegant school bag for girls packed with ergonomic comfort. Soft padded shoulder cushions safeguard posture while commuting.',
    material: 'Waterproof Jacquard Weave Nylon + Memory Foam Straps',
    inStock: true,
  },
  {
    id: 'ks-bag-04',
    slug: 'koskool-kids-junior-playgroup-school-bag-16l',
    name: 'KOSKOOL Kids TinySteps Kindergarten School Bag (16L)',
    brand: 'KOSKOOL',
    price: 499,
    originalPrice: 749,
    discountPercent: 33,
    gender: 'kids',
    schoolLevel: ['kindergarten'],
    productType: 'bags',
    bagCategory: 'kids-school-bags',
    sizes: ['16 Litres'],
    colours: ['Yellow & Blue', 'Red & Navy', 'Pink'],
    primaryColour: 'Yellow & Blue',
    capacity: '16 Litres',
    images: [
      '/cdn/shop/files/WK722-MAROON-KIDS.v_1786511451_width_1600.jpg',
      '/cdn/shop/files/WC8922-LIGHTGREY-KIDS_5a10c324-b422-466f-84e6-b7a152b4520a.v_1786512569_width_1600.jpg',
    ],
    rating: 4.8,
    reviewCount: 275,
    isPopular: false,
    features: ['Ultra-Lightweight (Under 300g)', 'Chest Buckle to Prevent Slipping Off Small Shoulders', 'Easy Pull-Ring Zippers for Little Hands', 'Name Tag Badge Holder'],
    description: 'Specially created for nursery and kindergarten students. Comfortably accommodates tiffin box, bottle, diary, and coloring books.',
    material: 'Soft Non-Toxic BPA-Free Oxford Fabric',
    inStock: true,
  },
  {
    id: 'ks-bag-05',
    slug: 'koskool-heavy-duty-all-rounder-school-backpack-35l',
    name: 'KOSKOOL All-Rounder Senior High School Backpack (35L)',
    brand: 'KOSKOOL',
    price: 1149,
    originalPrice: 1699,
    discountPercent: 32,
    gender: 'unisex',
    schoolLevel: ['senior-wing'],
    productType: 'bags',
    bagCategory: 'school-backpacks',
    sizes: ['35 Litres'],
    colours: ['Solid Black', 'Charcoal Grey', 'Navy Blue'],
    primaryColour: 'Solid Black',
    capacity: '35 Litres',
    images: [
      '/cdn/shop/files/WC8732-BLACK-3_170895c1-cace-4e16-bd8b-e759711e48ab.v_1786512759_width_1600.jpg',
      '/cdn/shop/files/WC4713-BLACK-GENTS-1_849cfb04-8054-440c-8678-773e22576047.v_1786512675_width_1600.jpg',
    ],
    rating: 4.9,
    reviewCount: 512,
    isPopular: true,
    features: ['Massive 35L Capacity with 5 Compartments', 'Padded Base with Raised Rubber Feet', 'Luggage Pass-Through Strap', 'Night Safety Reflective Piping'],
    description: 'Designed for high schoolers carrying heavy science practical manuals, sports gear, and laptops. Built like a fortress for year-round durability.',
    material: 'High-Tensile Ballistic Nylon',
    inStock: true,
  },
];

// Helper functions for filtering products across collections
export function filterProductsByCollection(productList: Product[], slug: string): Product[] {
  switch (slug) {
    // BOYS FOOTWEAR (9 collections)
    case 'boys-school-shoes-kindergarten':
      return productList.filter((p) => (p.gender === 'boys' || p.gender === 'unisex') && p.productType === 'school-shoes' && p.schoolLevel.includes('kindergarten'));
    case 'boys-school-shoes-middle-wing':
      return productList.filter((p) => (p.gender === 'boys' || p.gender === 'unisex') && p.productType === 'school-shoes' && p.schoolLevel.includes('middle-wing'));
    case 'boys-school-shoes-senior-wing':
      return productList.filter((p) => (p.gender === 'boys' || p.gender === 'unisex') && p.productType === 'school-shoes' && p.schoolLevel.includes('senior-wing'));

    case 'boys-sports-shoes-kindergarten':
      return productList.filter((p) => (p.gender === 'boys' || p.gender === 'unisex') && p.productType === 'sports-shoes' && p.schoolLevel.includes('kindergarten'));
    case 'boys-sports-shoes-middle-wing':
      return productList.filter((p) => (p.gender === 'boys' || p.gender === 'unisex') && p.productType === 'sports-shoes' && p.schoolLevel.includes('middle-wing'));
    case 'boys-sports-shoes-senior-wing':
      return productList.filter((p) => (p.gender === 'boys' || p.gender === 'unisex') && p.productType === 'sports-shoes' && p.schoolLevel.includes('senior-wing'));

    case 'boys-fabric-shoes-kindergarten':
      return productList.filter((p) => (p.gender === 'boys' || p.gender === 'unisex') && p.productType === 'fabric-shoes' && p.schoolLevel.includes('kindergarten'));
    case 'boys-fabric-shoes-middle-wing':
      return productList.filter((p) => (p.gender === 'boys' || p.gender === 'unisex') && p.productType === 'fabric-shoes' && p.schoolLevel.includes('middle-wing'));
    case 'boys-fabric-shoes-senior-wing':
      return productList.filter((p) => (p.gender === 'boys' || p.gender === 'unisex') && p.productType === 'fabric-shoes' && p.schoolLevel.includes('senior-wing'));

    // GIRLS FOOTWEAR (9 collections)
    case 'girls-school-shoes-kindergarten':
      return productList.filter((p) => (p.gender === 'girls' || p.gender === 'unisex') && p.productType === 'school-shoes' && p.schoolLevel.includes('kindergarten'));
    case 'girls-school-shoes-middle-wing':
      return productList.filter((p) => (p.gender === 'girls' || p.gender === 'unisex') && p.productType === 'school-shoes' && p.schoolLevel.includes('middle-wing'));
    case 'girls-school-shoes-senior-wing':
      return productList.filter((p) => (p.gender === 'girls' || p.gender === 'unisex') && p.productType === 'school-shoes' && p.schoolLevel.includes('senior-wing'));

    case 'girls-sports-shoes-kindergarten':
      return productList.filter((p) => (p.gender === 'girls' || p.gender === 'unisex') && p.productType === 'sports-shoes' && p.schoolLevel.includes('kindergarten'));
    case 'girls-sports-shoes-middle-wing':
      return productList.filter((p) => (p.gender === 'girls' || p.gender === 'unisex') && p.productType === 'sports-shoes' && p.schoolLevel.includes('middle-wing'));
    case 'girls-sports-shoes-senior-wing':
      return productList.filter((p) => (p.gender === 'girls' || p.gender === 'unisex') && p.productType === 'sports-shoes' && p.schoolLevel.includes('senior-wing'));

    case 'girls-fabric-shoes-kindergarten':
      return productList.filter((p) => (p.gender === 'girls' || p.gender === 'unisex') && p.productType === 'fabric-shoes' && p.schoolLevel.includes('kindergarten'));
    case 'girls-fabric-shoes-middle-wing':
      return productList.filter((p) => (p.gender === 'girls' || p.gender === 'unisex') && p.productType === 'fabric-shoes' && p.schoolLevel.includes('middle-wing'));
    case 'girls-fabric-shoes-senior-wing':
      return productList.filter((p) => (p.gender === 'girls' || p.gender === 'unisex') && p.productType === 'fabric-shoes' && p.schoolLevel.includes('senior-wing'));

    // HIGH-LEVEL PARENT SHORTCUTS
    case 'boys':
      return productList.filter((p) => p.gender === 'boys' || p.gender === 'unisex');
    case 'girls':
      return productList.filter((p) => p.gender === 'girls' || p.gender === 'unisex');
    case 'school-shoes':
      return productList.filter((p) => p.productType === 'school-shoes');
    case 'sports-shoes':
      return productList.filter((p) => p.productType === 'sports-shoes');
    case 'fabric-shoes':
      return productList.filter((p) => p.productType === 'fabric-shoes');
    case 'sandals':
      return productList.filter((p) => p.productType === 'sandals');
    case 'kindergarten':
      return productList.filter((p) => p.schoolLevel && p.schoolLevel.includes('kindergarten'));
    case 'middle-wing':
      return productList.filter((p) => p.schoolLevel && p.schoolLevel.includes('middle-wing'));
    case 'senior-wing':
      return productList.filter((p) => p.schoolLevel && p.schoolLevel.includes('senior-wing'));

    // BOYS ACCESSORIES
    case 'boys-accessories':
      return productList.filter((p) => p.productType === 'accessories' && (p.gender === 'boys' || p.gender === 'unisex'));
    case 'boys-bag-accessories':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'bag-accessories');
    case 'boys-geometry-accessories':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'geometry-accessories');
    case 'boys-stationery-accessories':
      return productList.filter((p) => p.productType === 'accessories' && (p.accessoryCategory === 'stationery-accessories' || p.accessoryCategory === 'pencil-cases'));
    case 'boys-school-essentials':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'school-essentials');
    case 'boys-water-bottles':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'water-bottles');
    case 'boys-pencil-cases':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'pencil-cases');

    // GIRLS ACCESSORIES
    case 'girls-accessories':
      return productList.filter((p) => p.productType === 'accessories' && (p.gender === 'girls' || p.gender === 'unisex'));
    case 'girls-hair-accessories':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'hair-accessories');
    case 'girls-bag-accessories':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'bag-accessories');
    case 'girls-dress-accessories':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'dress-accessories');
    case 'girls-stationery-accessories':
      return productList.filter((p) => p.productType === 'accessories' && (p.accessoryCategory === 'stationery-accessories' || p.accessoryCategory === 'pencil-cases'));
    case 'girls-school-essentials':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'school-essentials');
    case 'girls-water-bottles':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'water-bottles');
    case 'girls-pencil-cases':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'pencil-cases');

    // KIDS ACCESSORIES
    case 'kids-accessories':
    case 'accessories':
      return productList.filter((p) => p.productType === 'accessories');
    case 'kids-head-accessories':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'head-accessories');
    case 'kids-face-accessories':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'face-accessories');
    case 'kids-hair-accessories':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'hair-accessories');
    case 'kids-bag-accessories':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'bag-accessories');
    case 'kids-school-essentials':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'school-essentials');
    case 'kids-water-bottles':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'water-bottles');
    case 'kids-pencil-cases':
      return productList.filter((p) => p.productType === 'accessories' && p.accessoryCategory === 'pencil-cases');

    // BAGS
    case 'bags':
      return productList.filter((p) => p.productType === 'bags');
    case 'boys-school-bags':
      return productList.filter((p) => p.productType === 'bags' && (p.gender === 'boys' || p.gender === 'unisex'));
    case 'girls-school-bags':
      return productList.filter((p) => p.productType === 'bags' && (p.gender === 'girls' || p.gender === 'unisex'));
    case 'kids-school-bags':
      return productList.filter((p) => p.productType === 'bags' && (p.gender === 'kids' || (p.schoolLevel && p.schoolLevel.includes('kindergarten'))));
    case 'school-backpacks':
      return productList.filter((p) => p.productType === 'bags' && (p.bagCategory === 'school-backpacks' || p.bagCategory === 'multi-compartment-bags' || !p.bagCategory));
    case 'multi-compartment-bags':
      return productList.filter((p) => p.productType === 'bags' && (p.bagCategory === 'multi-compartment-bags' || p.name.toLowerCase().includes('multi-compartment') || p.description.toLowerCase().includes('compartment')));

    default:
      return productList;
  }
}

export function getProductsByCollection(slug: string): Product[] {
  return filterProductsByCollection(PRODUCTS, slug);
}

export function getCollectionTitle(slug: string): { title: string; subtitle: string; category: string } {
  const map: Record<string, { title: string; subtitle: string; category: string }> = {
    // Boys
    'boys': { title: "Boys' School Footwear & Gear", subtitle: 'Built tough for everyday school wear, drill, and playground sport.', category: 'Boys' },
    'boys-school-shoes-kindergarten': { title: "Boys' School Shoes – Kindergarten", subtitle: 'Easy-strap, flexible, lightweight shoes for young learners.', category: 'Boys Footwear' },
    'boys-school-shoes-middle-wing': { title: "Boys' School Shoes – Middle Wing", subtitle: 'Durable, scuff-resistant school shoes engineered for active school days.', category: 'Boys Footwear' },
    'boys-school-shoes-senior-wing': { title: "Boys' School Shoes – Senior Wing", subtitle: 'High-polish, sharp formal derby and oxford shoes for senior students.', category: 'Boys Footwear' },
    'boys-sports-shoes-kindergarten': { title: "Boys' Sports Shoes – Kindergarten", subtitle: 'Bouncy, cushioned PT shoes for little runners and play sessions.', category: 'Boys Footwear' },
    'boys-sports-shoes-middle-wing': { title: "Boys' Sports Shoes – Middle Wing", subtitle: 'Uniform-approved all-white sports shoes with high-grip rubber soles.', category: 'Boys Footwear' },
    'boys-sports-shoes-senior-wing': { title: "Boys' Sports Shoes – Senior Wing", subtitle: 'Performance athletic trainers for senior sports and track drills.', category: 'Boys Footwear' },
    'boys-fabric-shoes-kindergarten': { title: "Boys' Fabric Shoes – Kindergarten", subtitle: 'Breathable, lightweight cotton canvas shoes for junior boys.', category: 'Boys Footwear' },
    'boys-fabric-shoes-middle-wing': { title: "Boys' Fabric Shoes – Middle Wing", subtitle: 'Washable heavy-duty canvas shoes for daily school wear.', category: 'Boys Footwear' },
    'boys-fabric-shoes-senior-wing': { title: "Boys' Fabric Shoes – Senior Wing", subtitle: 'Classic drill canvas and march-past footwear for senior boys.', category: 'Boys Footwear' },

    // Girls
    'girls': { title: "Girls' School Footwear & Gear", subtitle: 'Elegance, uniform compliance, and lasting foot support.', category: 'Girls' },
    'girls-school-shoes-kindergarten': { title: "Girls' School Shoes – Kindergarten", subtitle: 'Sweet, supportive Mary Jane shoes with easy-fasten strap.', category: 'Girls Footwear' },
    'girls-school-shoes-middle-wing': { title: "Girls' School Shoes – Middle Wing", subtitle: 'All-day comfort school shoes with cushioned insoles and anti-skid grip.', category: 'Girls Footwear' },
    'girls-school-shoes-senior-wing': { title: "Girls' School Shoes – Senior Wing", subtitle: 'Refined formal shoes with orthopedic arch support for senior girls.', category: 'Girls Footwear' },
    'girls-sports-shoes-kindergarten': { title: "Girls' Sports Shoes – Kindergarten", subtitle: 'Lightweight white PT sneakers for games and physical education.', category: 'Girls Footwear' },
    'girls-sports-shoes-middle-wing': { title: "Girls' Sports Shoes – Middle Wing", subtitle: 'Aerated mesh white sports shoes compliant with school uniform codes.', category: 'Girls Footwear' },
    'girls-sports-shoes-senior-wing': { title: "Girls' Sports Shoes – Senior Wing", subtitle: 'High-cushion sports trainers built for court and field activities.', category: 'Girls Footwear' },
    'girls-fabric-shoes-kindergarten': { title: "Girls' Fabric Shoes – Kindergarten", subtitle: 'Featherlight cotton canvas shoes for young girls.', category: 'Girls Footwear' },
    'girls-fabric-shoes-middle-wing': { title: "Girls' Fabric Shoes – Middle Wing", subtitle: 'Durable, breathable canvas shoes that are easy to wash.', category: 'Girls Footwear' },
    'girls-fabric-shoes-senior-wing': { title: "Girls' Fabric Shoes – Senior Wing", subtitle: 'Parade and drill certified white and black canvas shoes.', category: 'Girls Footwear' },

    // Accessories
    'accessories': { title: 'School Accessories', subtitle: 'Everyday school essentials: bottles, pencil cases, geometry, and care kits.', category: 'Accessories' },
    'boys-accessories': { title: "Boys' School Accessories", subtitle: 'Functional essentials crafted for boys from kindergarten to senior wing.', category: 'Accessories' },
    'boys-bag-accessories': { title: "Boys' Bag Accessories", subtitle: 'Waterproof rain covers, clips, and attachments for school bags.', category: 'Boys Accessories' },
    'boys-geometry-accessories': { title: "Boys' Geometry Accessories", subtitle: 'Precision mathematical instruments and geometry sets for school exams.', category: 'Boys Accessories' },
    'boys-stationery-accessories': { title: "Boys' Stationery Accessories", subtitle: 'Hardtop cases, organizers, and everyday study tools.', category: 'Boys Accessories' },
    'boys-school-essentials': { title: "Boys' School Essentials", subtitle: 'Shoe polish kits, brushes, insoles, and school maintenance items.', category: 'Boys Accessories' },
    'boys-water-bottles': { title: "Boys' School Water Bottles", subtitle: 'Insulated stainless steel leak-proof bottles for school hydration.', category: 'Boys Accessories' },
    'boys-pencil-cases': { title: "Boys' Pencil Cases", subtitle: 'Embossed shockproof hardtop pencil pouches and multi-tier organizers.', category: 'Boys Accessories' },

    'girls-accessories': { title: "Girls' School Accessories", subtitle: 'Hair ribbons, stainless bottles, dress accessories, and pencil cases.', category: 'Accessories' },
    'girls-hair-accessories': { title: "Girls' Hair Accessories", subtitle: 'School uniform approved satin ribbons, elastic ties, and hairpins.', category: 'Girls Accessories' },
    'girls-bag-accessories': { title: "Girls' Bag Accessories", subtitle: 'Protective backpack rain covers and luggage accessories.', category: 'Girls Accessories' },
    'girls-dress-accessories': { title: "Girls' Dress Accessories", subtitle: 'Combed cotton uniform socks, belts, and uniform embellishments.', category: 'Girls Accessories' },
    'girls-stationery-accessories': { title: "Girls' Stationery Accessories", subtitle: 'Cute and durable pencil cases, notebooks, and writing accessories.', category: 'Girls Accessories' },
    'girls-school-essentials': { title: "Girls' School Essentials", subtitle: 'Shoe polish, white canvas chalk care, and morning assembly kits.', category: 'Girls Accessories' },
    'girls-water-bottles': { title: "Girls' School Water Bottles", subtitle: 'Temperature-retention pastel and steel school bottles.', category: 'Girls Accessories' },
    'girls-pencil-cases': { title: "Girls' Pencil Cases", subtitle: 'Multi-layer zipper cases and durable hardtop pouches.', category: 'Girls Accessories' },

    'kids-accessories': { title: "Kids' School Accessories", subtitle: 'Everything tiny learners need for nursery, kindergarten, and playtime.', category: 'Accessories' },
    'kids-head-accessories': { title: "Kids' Head Accessories", subtitle: 'Sun caps and uniform headwear for outdoor school activities.', category: 'Kids Accessories' },
    'kids-face-accessories': { title: "Kids' Face Accessories", subtitle: 'Soft cotton dust protection masks for school transit.', category: 'Kids Accessories' },
    'kids-hair-accessories': { title: "Kids' Hair Accessories", subtitle: 'Snag-free colorful and uniform-ready hair ties.', category: 'Kids Accessories' },
    'kids-bag-accessories': { title: "Kids' Bag Accessories", subtitle: 'Bright visibility rain covers and cute backpack charms.', category: 'Kids Accessories' },
    'kids-school-essentials': { title: "Kids' School Essentials", subtitle: 'Care packs, water sippers, and beginner stationery.', category: 'Kids Accessories' },
    'kids-water-bottles': { title: "Kids' Water Bottles", subtitle: 'Sipper straw bottles easy for small hands to hold and drink.', category: 'Kids Accessories' },
    'kids-pencil-cases': { title: "Kids' Pencil Cases", subtitle: 'Drop-proof, rounded-edge pencil boxes for little children.', category: 'Kids Accessories' },

    // Bags
    'bags': { title: 'School Bags & Backpacks', subtitle: 'Ergonomic, spacious, and durable backpacks designed to protect posture.', category: 'Bags' },
    'boys-school-bags': { title: "Boys' School Bags", subtitle: 'Rugged, multi-pocket school backpacks engineered for boys.', category: 'Bags' },
    'girls-school-bags': { title: "Girls' School Bags", subtitle: 'Comfort-padded, lightweight and stylish bags for school girls.', category: 'Bags' },
    'kids-school-bags': { title: "Kids' School Bags", subtitle: 'Featherlight junior bags designed for kindergarten and nursery.', category: 'Bags' },
    'school-backpacks': { title: 'School Backpacks', subtitle: 'Heavy-duty daily backpacks with laptop compartments and bottle holders.', category: 'Bags' },
    'multi-compartment-bags': { title: 'Multi-Compartment School Bags', subtitle: 'Organized multi-tier backpacks that distribute book weight evenly.', category: 'Bags' },

    // Footwear Parents
    'school-shoes': { title: 'School Uniform Shoes', subtitle: 'CBSE and ICSE uniform compliant black and white shoes for all grades.', category: 'Footwear' },
    'sports-shoes': { title: 'School Sports & PT Shoes', subtitle: 'High-cushion, non-marking athletic shoes for physical education.', category: 'Footwear' },
    'fabric-shoes': { title: 'School Canvas & Fabric Shoes', subtitle: 'Breathable, washable fabric shoes for drill and hot weather.', category: 'Footwear' },
    'kindergarten': { title: 'Kindergarten Footwear & Gear', subtitle: 'Velcro-closure, ultra-cushioned shoes for nursery and KG students.', category: 'School Wing' },
    'middle-wing': { title: 'Middle Wing Footwear & Gear', subtitle: 'Heavy-duty footwear built for classes 1 through 8.', category: 'School Wing' },
    'senior-wing': { title: 'Senior Wing Footwear & Gear', subtitle: 'Smart, long-lasting formal and sports footwear for classes 9 through 12.', category: 'School Wing' },
  };

  return map[slug] || {
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: 'Explore KOSKOOL high-durability school products.',
    category: 'Collection',
  };
}
