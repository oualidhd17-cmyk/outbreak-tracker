import type { Metadata } from 'next';
import { MonetagScripts } from '@/components/monetag/MonetagScripts';
import 'leaflet/dist/leaflet.css';
import './globals.css';

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MonetagScripts />
        {children}
      </body>
    </html>
  );
}