import type { Metadata } from 'next';
import Script from 'next/script';

import { DirectLinkOpener } from '@/components/monetag/DirectLinkOpener';
import { MonetagScripts } from '@/components/monetag/MonetagScripts';
import { ScrollControls } from '@/components/ui/ScrollControls';

import 'leaflet/dist/leaflet.css';
import './globals.css';

const GOOGLE_TAG_ID = 'G-LTLZ50X2S2';
const GOOGLE_ADSENSE_CLIENT = 'ca-pub-7200463371794521';

export const metadata: Metadata = {
  title: 'HantaMap - Live Hantavirus Tracker, Map & Outbreak Updates',
  description:
    'Track verified hantavirus outbreak updates, confirmed cases, deaths, affected regions, timelines, and official public health sources on an interactive live map.',
  keywords: [
    'hantavirus tracker',
    'hantavirus map',
    'hantavirus outbreak tracker',
    'hantavirus symptoms',
    'hantavirus prevention',
    'hantavirus transmission',
    'hantavirus cases',
    'hantavirus deaths',
    'hantavirus latest updates',
    'hantavirus outbreak news',
    'hantavirus cruise ship',
    'hantavirus Europe',
    'HantaMap',
  ],
  alternates: {
    canonical: 'https://hantamap.online',
  },
  openGraph: {
    title: 'HantaMap - Live Hantavirus Tracker',
    description:
      'Verified hantavirus outbreak data, interactive map, timeline, and official public health sources.',
    url: 'https://hantamap.online',
    siteName: 'HantaMap',
    type: 'website',
  },
  other: {
    'google-adsense-account': GOOGLE_ADSENSE_CLIENT,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>

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

        <DirectLinkOpener />

        {children}

        <ScrollControls />
      </body>
    </html>
  );
}