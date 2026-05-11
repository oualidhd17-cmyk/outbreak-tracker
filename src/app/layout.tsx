import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import { MonetagScripts } from '@/components/monetag/MonetagScripts';
import { SmartDirectLink } from '@/components/monetag/SmartDirectLink';
import { ScrollControls } from '@/components/ui/ScrollControls';

import 'leaflet/dist/leaflet.css';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hantamap.online';
const GOOGLE_TAG_ID = 'G-YBK28FJ69W';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Live Hantavirus Outbreak Tracker | Official Data Dashboard',
    template: '%s | Live Hantavirus Outbreak Tracker',
  },
  description:
    'Track confirmed, suspected, and official hantavirus outbreak updates using public-health sources such as WHO, CDC, ECDC, Africa CDC, and ReliefWeb.',
  keywords: [
    'hantavirus tracker',
    'hantavirus outbreak map',
    'hantavirus cases',
    'hantavirus dashboard',
    'Andes virus',
    'outbreak dashboard',
    'WHO outbreak news',
    'CDC hantavirus',
    'ECDC hantavirus',
    'public health dashboard',
  ],
  applicationName: 'Live Outbreak Tracker',
  authors: [
    {
      name: 'Live Outbreak Tracker',
      url: SITE_URL,
    },
  ],
  creator: 'Live Outbreak Tracker',
  publisher: 'Live Outbreak Tracker',
  category: 'public health',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Live Outbreak Tracker',
    title: 'Live Hantavirus Outbreak Tracker',
    description:
      'Official-source dashboard tracking confirmed and unconfirmed hantavirus outbreak signals.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Hantavirus Outbreak Tracker',
    description:
      'Track official hantavirus outbreak updates from public-health sources.',
  },
  // ----- تم التحديث هنا لاستخدام PNG -----
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Live Outbreak Tracker',
    url: SITE_URL,
    description:
      'Official-source dashboard tracking confirmed and unconfirmed hantavirus outbreak signals.',
    inLanguage: ['en', 'ar', 'fr', 'es'],
    publisher: {
      '@type': 'Organization',
      name: 'Live Outbreak Tracker',
      url: SITE_URL,
    },
    about: {
      '@type': 'Thing',
      name: 'Hantavirus outbreak tracking',
    },
  };

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
          strategy="afterInteractive"
        />

        <Script id="google-analytics-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_TAG_ID}');
          `}
        </Script>

        <MonetagScripts />
        <SmartDirectLink />

        {children}

        <ScrollControls />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </body>
    </html>
  );
}