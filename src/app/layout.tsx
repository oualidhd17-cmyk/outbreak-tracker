import type { Metadata } from 'next';
import Script from 'next/script';

import { MonetagScripts } from '@/components/monetag/MonetagScripts';

import 'leaflet/dist/leaflet.css';
import './globals.css';

const GOOGLE_TAG_ID = 'G-LTLZ50X2S2';
const GOOGLE_ADSENSE_CLIENT = 'ca-pub-7200463371794521';

export const metadata: Metadata = {
  title: 'HantaMap - Hantavirus Tracker',
  description:
    'Live Hantavirus tracker with official-source outbreak data, map, timeline, and verified public health updates.',
  keywords: [
    'Hantavirus',
    'Hantavirus tracker',
    'Hantavirus map',
    'Hantavirus outbreak',
    'HantaMap',
    'virus tracker',
    'outbreak tracker',
  ],
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

        <Script
          id="google-adsense-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <MonetagScripts />
        {children}
      </body>
    </html>
  );
}