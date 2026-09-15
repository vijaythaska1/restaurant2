import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../context/CartContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Crust & Crave | Artisanal Gourmet Pizzeria',
  description: 'Crust & Crave digital menu and WhatsApp ordering. Artisanal Pizzas • Handcrafted Crust. Free Home Delivery.',
  keywords: ['Crust & Crave', 'Artisanal Pizza', 'Gourmet Pizzeria', 'Digital Menu', 'WhatsApp Ordering', 'Food Delivery', 'Burger', 'Shakes'],
  authors: [{ name: 'Crust & Crave' }],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f7a3b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-[#f4f7ef] text-[#17251c] antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
