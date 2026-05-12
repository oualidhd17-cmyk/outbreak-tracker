import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { MonetagScripts } from '@/components/monetag/MonetagScripts';
import { SmartDirectLink } from '@/components/monetag/SmartDirectLink';
import { ScrollControls } from '@/components/ui/ScrollControls';
import { InstallPrompt } from '@/components/ui/InstallPrompt'; // 👈 استدعاء مكون التثبيت

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://hantamap.online'
).replace(/\/$/, '');

const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GA_ID || process.env.GA_ID || 'G-YBK28FJ69W';

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ANDV Hantavirus 2026 Live Map Tracker',
    template: '%s | HantaMap',
  },
  description:
    'Independent ANDV Hantavirus 2026 live tracker with confirmed, suspected, deceased and monitoring map signals.',
  manifest: '/manifest.json', // 👈 إضافة الـ Manifest هنا
  keywords: [
    'hantavirus',
    'hantavirus map',
    'hantavirus tracker',
    'hantavirus outbreak 2026',
    'ANDV hantavirus',
    'MV Hondius hantavirus',
    'hantavirus cruise ship',
  ],
  applicationName: 'HantaMap',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  authors: [{ name: 'HantaMap' }],
  creator: 'HantaMap',
  publisher: 'HantaMap',
  alternates: {
    canonical: siteUrl,
  },
  verification: googleSiteVerification
    ? { google: googleSiteVerification }
    : undefined,
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'HantaMap',
    title: 'ANDV Hantavirus 2026 Live Map Tracker',
    description:
      'Independent ANDV Hantavirus 2026 live tracker with confirmed, suspected, deceased and monitoring map signals.',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ANDV Hantavirus 2026 Live Map Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ANDV Hantavirus 2026 Live Map Tracker',
    description:
      'Independent ANDV Hantavirus 2026 live tracker with confirmed, suspected, deceased and monitoring map signals.',
    images: [`${siteUrl}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `}
            </Script>
          </>
        ) : null}

        <MonetagScripts />
        <SmartDirectLink />
        <ScrollControls />
        
        {/* 👇 ظهور شريط التثبيت هنا 👇 */}
        <InstallPrompt />

        {children}
      </body>
    </html>
  );
}