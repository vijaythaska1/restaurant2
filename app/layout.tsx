import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../context/CartContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://crustandcrave.com';

export const metadata: Metadata = {
  // ── Core Meta ──
  title: {
    default: 'Crust & Crave | Artisanal Gourmet Pizzeria – Order Online',
    template: '%s | Crust & Crave',
  },
  description:
    'Crust & Crave – Artisanal stone-baked pizzas, handcrafted smash burgers, crispy sides & premium shakes. Order online via WhatsApp. Free home delivery in McKinney, Texas.',
  keywords: [
    'Crust & Crave',
    'pizza near me',
    'order pizza online',
    'artisanal pizza',
    'gourmet pizzeria',
    'stone baked pizza',
    'smash burger',
    'burger delivery',
    'food delivery McKinney',
    'McKinney Texas restaurant',
    'WhatsApp food ordering',
    'digital menu',
    'online menu',
    'pizza delivery',
    'best pizza McKinney',
    'restaurant near me',
    'fast food delivery',
    'crispy fries',
    'chocolate shake',
    'desserts near me',
  ],
  authors: [{ name: 'Crust & Crave', url: SITE_URL }],
  creator: 'Crust & Crave',
  publisher: 'Crust & Crave',

  // ── Canonical & Alternate ──
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },

  // ── Open Graph (Facebook, LinkedIn, WhatsApp) ──
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Crust & Crave',
    title: 'Crust & Crave | Artisanal Gourmet Pizzeria – Order Online',
    description:
      'Order artisanal stone-baked pizzas, handcrafted smash burgers & premium shakes online. Free home delivery in McKinney, Texas. WhatsApp ordering available.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Crust & Crave – Artisanal Gourmet Pizzeria Logo',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter Card ──
  twitter: {
    card: 'summary_large_image',
    title: 'Crust & Crave | Artisanal Gourmet Pizzeria',
    description:
      'Order artisanal stone-baked pizzas, handcrafted smash burgers & premium shakes online. Free delivery!',
    images: ['/logo.png'],
    creator: '@crustandcrave',
  },

  // ── Robots ──
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Icons & PWA ──
  icons: {
    icon: [
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  manifest: '/manifest.json',

  // ── Verification (placeholder – replace with real IDs when available) ──
  // verification: {
  //   google: 'your-google-site-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  // ── Category ──
  category: 'Food & Restaurants',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A2E' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.className}>
      <head>
        {/* ── Restaurant Structured Data (JSON-LD) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              name: 'Crust & Crave',
              alternateName: 'Crust and Crave Pizzeria',
              description:
                'Artisanal stone-baked pizzas, handcrafted smash burgers, crispy sides & premium shakes. Free home delivery.',
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              image: `${SITE_URL}/logo.png`,
              telephone: ['+917300760917', '+919056351220'],
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'McKinney',
                addressLocality: 'McKinney',
                addressRegion: 'TX',
                addressCountry: 'US',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 33.1972,
                longitude: -96.6397,
              },
              servesCuisine: ['Pizza', 'Burgers', 'American', 'Italian', 'Fast Food'],
              priceRange: '₹₹',
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                  ],
                  opens: '10:00',
                  closes: '23:00',
                },
              ],
              hasMenu: {
                '@type': 'Menu',
                name: 'Digital Menu',
                url: SITE_URL,
                hasMenuSection: [
                  {
                    '@type': 'MenuSection',
                    name: 'Artisanal Pizzas',
                    hasMenuItem: [
                      {
                        '@type': 'MenuItem',
                        name: 'Truffle Mushroom Pizza',
                        description:
                          'San Marzano tomatoes, fior di latte mozzarella, sautéed wild mushrooms, white truffle oil & microgreens.',
                        offers: {
                          '@type': 'Offer',
                          priceCurrency: 'INR',
                          price: '199',
                        },
                      },
                      {
                        '@type': 'MenuItem',
                        name: 'Artisanal Pepperoni Feast',
                        description:
                          'Smoky beef/turkey pepperoni, melted buffalo mozzarella, hot honey drizzle & fresh oregano.',
                        offers: {
                          '@type': 'Offer',
                          priceCurrency: 'INR',
                          price: '229',
                        },
                      },
                    ],
                  },
                  {
                    '@type': 'MenuSection',
                    name: 'Gourmet Burgers',
                    hasMenuItem: [
                      {
                        '@type': 'MenuItem',
                        name: 'Chic Burger',
                        description:
                          'Double seasoned smash patty, melted aged cheddar, crisp iceberg lettuce, tomato & house secret sauce.',
                        offers: {
                          '@type': 'Offer',
                          priceCurrency: 'INR',
                          price: '149',
                        },
                      },
                    ],
                  },
                ],
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '2300',
                bestRating: '5',
                worstRating: '1',
              },
              sameAs: [],
              potentialAction: {
                '@type': 'OrderAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `https://wa.me/917300760917`,
                  actionPlatform: [
                    'http://schema.org/DesktopWebPlatform',
                    'http://schema.org/MobileWebPlatform',
                  ],
                },
                deliveryMethod: ['http://purl.org/goodrelations/v1#DeliveryModeOwnFleet'],
              },
            }),
          }}
        />

        {/* ── WebSite Search Action (Sitelinks Searchbox) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Crust & Crave',
              url: SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* ── Local Business Breadcrumb ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: SITE_URL,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Menu',
                  item: SITE_URL,
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FAFAFA] text-[#1A1A2E] antialiased overflow-x-hidden">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
