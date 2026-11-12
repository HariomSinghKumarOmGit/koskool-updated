export interface SubcategoryItem {
  title: string;
  href: string;
  badge?: string;
}

export interface NavColumn {
  heading: string;
  href?: string;
  items: SubcategoryItem[];
}

export interface NavItem {
  title: string;
  href: string;
  isMega?: boolean;
  columns?: NavColumn[];
}

export const MAIN_NAVIGATION: NavItem[] = [
  // 1. BOYS
  {
    title: 'BOYS',
    href: '/collections/boys',
    isMega: true,
    columns: [
      {
        heading: 'School Shoes',
        href: '/collections/boys-school-shoes-middle-wing',
        items: [
          { title: 'Kindergarten', href: '/collections/boys-school-shoes-kindergarten', badge: 'Velcro' },
          { title: 'Middle Wing', href: '/collections/boys-school-shoes-middle-wing', badge: 'Popular' },
          { title: 'Senior Wing', href: '/collections/boys-school-shoes-senior-wing' },
        ],
      },
      {
        heading: 'Sports Shoes',
        href: '/collections/boys-sports-shoes-middle-wing',
        items: [
          { title: 'Kindergarten', href: '/collections/boys-sports-shoes-kindergarten' },
          { title: 'Middle Wing', href: '/collections/boys-sports-shoes-middle-wing', badge: 'PT Approved' },
          { title: 'Senior Wing', href: '/collections/boys-sports-shoes-senior-wing' },
        ],
      },
      {
        heading: 'Fabric Shoes',
        href: '/collections/boys-fabric-shoes-middle-wing',
        items: [
          { title: 'Kindergarten', href: '/collections/boys-fabric-shoes-kindergarten' },
          { title: 'Middle Wing', href: '/collections/boys-fabric-shoes-middle-wing' },
          { title: 'Senior Wing', href: '/collections/boys-fabric-shoes-senior-wing', badge: 'Drill' },
        ],
      },
    ],
  },

  // 2. GIRLS
  {
    title: 'GIRLS',
    href: '/collections/girls',
    isMega: true,
    columns: [
      {
        heading: 'School Shoes',
        href: '/collections/girls-school-shoes-middle-wing',
        items: [
          { title: 'Kindergarten', href: '/collections/girls-school-shoes-kindergarten', badge: 'Mary Jane' },
          { title: 'Middle Wing', href: '/collections/girls-school-shoes-middle-wing', badge: 'Popular' },
          { title: 'Senior Wing', href: '/collections/girls-school-shoes-senior-wing' },
        ],
      },
      {
        heading: 'Sports Shoes',
        href: '/collections/girls-sports-shoes-middle-wing',
        items: [
          { title: 'Kindergarten', href: '/collections/girls-sports-shoes-kindergarten' },
          { title: 'Middle Wing', href: '/collections/girls-sports-shoes-middle-wing', badge: 'PT Approved' },
          { title: 'Senior Wing', href: '/collections/girls-sports-shoes-senior-wing' },
        ],
      },
      {
        heading: 'Fabric Shoes',
        href: '/collections/girls-fabric-shoes-middle-wing',
        items: [
          { title: 'Kindergarten', href: '/collections/girls-fabric-shoes-kindergarten' },
          { title: 'Middle Wing', href: '/collections/girls-fabric-shoes-middle-wing' },
          { title: 'Senior Wing', href: '/collections/girls-fabric-shoes-senior-wing' },
        ],
      },
    ],
  },

  // 3. ACCESSORIES
  {
    title: 'ACCESSORIES',
    href: '/collections/accessories',
    isMega: true,
    columns: [
      {
        heading: 'BOYS ACCESSORIES',
        href: '/collections/boys-accessories',
        items: [
          { title: 'Bag Accessories', href: '/collections/boys-bag-accessories' },
          { title: 'Geometry Accessories', href: '/collections/boys-geometry-accessories' },
          { title: 'Stationery Accessories', href: '/collections/boys-stationery-accessories' },
          { title: 'School Essentials', href: '/collections/boys-school-essentials', badge: 'Care Kit' },
          { title: 'Water Bottles', href: '/collections/boys-water-bottles', badge: 'Insulated' },
          { title: 'Pencil Cases', href: '/collections/boys-pencil-cases' },
        ],
      },
      {
        heading: 'GIRLS ACCESSORIES',
        href: '/collections/girls-accessories',
        items: [
          { title: 'Hair Accessories', href: '/collections/girls-hair-accessories', badge: 'Ribbons' },
          { title: 'Bag Accessories', href: '/collections/girls-bag-accessories' },
          { title: 'Dress Accessories', href: '/collections/girls-dress-accessories', badge: 'Socks' },
          { title: 'Stationery Accessories', href: '/collections/girls-stationery-accessories' },
          { title: 'School Essentials', href: '/collections/girls-school-essentials' },
          { title: 'Water Bottles', href: '/collections/girls-water-bottles' },
          { title: 'Pencil Cases', href: '/collections/girls-pencil-cases' },
        ],
      },
      {
        heading: 'KIDS ACCESSORIES',
        href: '/collections/kids-accessories',
        items: [
          { title: 'Head Accessories', href: '/collections/kids-head-accessories' },
          { title: 'Face Accessories', href: '/collections/kids-face-accessories' },
          { title: 'Hair Accessories', href: '/collections/kids-hair-accessories' },
          { title: 'Bag Accessories', href: '/collections/kids-bag-accessories' },
          { title: 'School Essentials', href: '/collections/kids-school-essentials' },
          { title: 'Water Bottles', href: '/collections/kids-water-bottles' },
          { title: 'Pencil Cases', href: '/collections/kids-pencil-cases' },
        ],
      },
    ],
  },

  // 4. BAGS
  {
    title: 'BAGS',
    href: '/collections/bags',
    isMega: false,
    columns: [
      {
        heading: 'SHOP BAGS & BACKPACKS',
        href: '/collections/bags',
        items: [
          { title: 'Boys School Bags', href: '/collections/boys-school-bags' },
          { title: 'Girls School Bags', href: '/collections/girls-school-bags' },
          { title: 'Kids School Bags', href: '/collections/kids-school-bags', badge: 'Junior' },
          { title: 'School Backpacks', href: '/collections/school-backpacks', badge: 'Best Seller' },
          { title: 'Multi-Compartment Bags', href: '/collections/multi-compartment-bags', badge: 'Heavy Duty' },
        ],
      },
    ],
  },

  // 5. ABOUT
  {
    title: 'ABOUT',
    href: '/about',
  },
];
