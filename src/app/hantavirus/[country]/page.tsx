import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  findCountryBySlug,
  getCasesByCountrySlug,
  getSiteUrl,
  loadArcgisServerData,
  slugify,
  unslugify,
} from '@/lib/server-data';

type PageProps = {
  params: Promise<{
    country: string;
  }>;
};

export function generateStaticParams() {
  const data = loadArcgisServerData();

  return data.countries.map((country) => ({
    country: slugify(country.country),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  const row = findCountryBySlug(country);
  const countryName = row?.country ?? unslugify(country);
  const siteUrl = getSiteUrl();

  return {
    title: `Hantavirus in ${countryName} 2026 Live Tracker`,
    description: `Live Hantavirus 2026 tracker page for ${countryName}. View confirmed, suspected, deceased and monitoring signals from the independent map dataset.`,
    alternates: {
      canonical: `${siteUrl}/hantavirus/${country}`,
    },
    openGraph: {
      title: `Hantavirus in ${countryName} 2026`,
      description: `Country tracker for ${countryName} with live Hantavirus signal categories.`,
      url: `${siteUrl}/hantavirus/${country}`,
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Hantavirus in ${countryName}`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Hantavirus in ${countryName}`,
      description: `Live Hantavirus tracker for ${countryName}.`,
      images: [`${siteUrl}/opengraph-image`],
    },
  };
}

export default async function CountryPage({ params }: PageProps) {
  const { country } = await params;
  const row = findCountryBySlug(country);

  if (!row) {
    notFound();
  }

  const cases = getCasesByCountrySlug(country);
  const siteUrl = getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Hantavirus in ${row.country} 2026`,
    description: `Independent Hantavirus tracker data for ${row.country}.`,
    url: `${siteUrl}/hantavirus/${country}`,
  };

  return (
    <main className="min-h-dvh bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <section className="mx-auto max-w-6xl px-5 py-10">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-wider text-red-400 hover:text-red-300"
        >
          ← Back to live map
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-10">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-red-400">
            Country Tracker
          </div>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Hantavirus in {row.country}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
            Live independent tracking page for {row.country}. This page is
            generated from the latest public map data and separates confirmed,
            suspected, deceased and monitoring signals.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ['Confirmed', row.confirmed, 'text-red-400'],
            ['Suspected', row.suspected, 'text-yellow-300'],
            ['Monitoring', row.under_investigation, 'text-lime-300'],
            ['Deceased', row.deaths, 'text-purple-300'],
            ['Total', row.total_identified, 'text-white'],
          ].map(([label, value, className]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-white/10 bg-[#070707] p-5"
            >
              <div className="text-xs font-black uppercase tracking-widest text-gray-500">
                {label}
              </div>

              <div className={`mt-3 font-mono text-4xl font-black ${className}`}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#050505] p-6">
          <h2 className="text-2xl font-black">Latest signals in {row.country}</h2>

          <div className="mt-5 divide-y divide-white/10">
            {cases.length === 0 ? (
              <p className="py-5 text-gray-400">No case records available.</p>
            ) : (
              cases.map((item) => (
                <Link
                  key={item.id}
                  href={`/case/${item.id}`}
                  className="block py-5 transition hover:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                      {item.status}
                    </span>

                    {item.exposed_at ? (
                      <span className="text-xs font-bold text-gray-500">
                        {item.exposed_at}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-3 text-lg font-black text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
                    {item.details ||
                      `Latest ${item.status} signal in ${item.country}.`}
                  </p>
                </Link>
              ))
            )}
          </div>
        </section>

        <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm leading-7 text-yellow-100">
          Independent tracker. Data is based on public map signals and source
          links. Verify important health information with official authorities.
        </div>
      </section>
    </main>
  );
}