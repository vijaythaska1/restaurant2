import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../context/CartContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
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
  themeColor: '#FAFAFA',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.className}>
      <body className="min-h-screen bg-[#FAFAFA] text-[#1A1A2E] antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
