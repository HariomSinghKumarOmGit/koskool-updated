import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: 'KOSKOOL | School Shoes, Accessories & Bags for Boys and Girls',
  description:
    "Explore KOSKOOL's collection of school shoes, sports shoes, fabric shoes, school bags and accessories for boys and girls. Aaao school chale hum.",
  keywords: [
    'KOSKOOL',
    'school shoes',
    'boys school shoes',
    'girls school shoes',
    'sports shoes',
    'PT shoes',
    'fabric shoes',
    'kindergarten shoes',
    'middle wing shoes',
    'senior wing shoes',
    'school bags',
    'school backpacks',
    'school water bottles',
    'geometry box',
    'school accessories',
  ],
  authors: [{ name: 'KOSKOOL - Owner Vipul Singla' }],
  icons: {
    icon: '/cdn/shop/files/walkaroo-favicon_1.crop_center_height_32_v_1692935314_width_32.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
