import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { MonetagScripts } from '@/components/monetag/MonetagScripts';
import { SmartDirectLink } from '@/components/monetag/SmartDirectLink';
import { ScrollControls } from '@/components/ui/ScrollControls';
import { InstallPrompt } from '@/components/ui/InstallPrompt';

// 👇 استيراد البيانات المولدة برمجياً لمحركات البحث
import seoKeywords from '../../public/data/seo-keywords.json';

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://hantamap.online'
).replace(/\/$/, '');

const googleAnalyticsId =
  process.env.NEXT_PUBLIC_GA_ID || process.env.GA_ID || 'G-YBK28FJ69W';

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // 👇 استخدام العناوين الديناميكية من السكربت
  title: {
    default: seoKeywords.seo_title,
    template: `%s | Hantavirus Map Live 2026`,
  },
  description: seoKeywords.seo_description,
  keywords: seoKeywords.keywords, // حقن مئات الكلمات المفتاحية تلقائياً
  
  manifest: '/manifest.json',
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
    title: seoKeywords.seo_title, // مزامنة مع SEO Title الجديد
    description: seoKeywords.seo_description,
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
    title: seoKeywords.seo_title,
    description: seoKeywords.seo_description,
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

        {/* 👇 الإعلانات والبيانات الحساسة - لا يتم تغييرها 👇 */}
        <MonetagScripts />
        <SmartDirectLink />
        <ScrollControls />
        <InstallPrompt />

        {children}
      </body>
    </html>
  );
}