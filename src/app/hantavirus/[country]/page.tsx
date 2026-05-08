import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { formatDateTime, formatNumber } from '@/lib/format';
import type { OutbreakCountry } from '@/types/outbreak';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hantamap.online';

type CountryPageProps = {
  params: Promise<{
    country: string;
  }>;
};

function slugifyCountry(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCaseFromSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function loadCountriesFromDisk(): Promise<OutbreakCountry[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'countries.json');
    const content = await readFile(filePath, 'utf8');

    return JSON.parse(content) as OutbreakCountry[];
  } catch {
    return [];
  }
}

async function findCountry(countrySlug: string): Promise<OutbreakCountry | null> {
  const countries = await loadCountriesFromDisk();

  return (
    countries.find((country) => slugifyCountry(country.country) === countrySlug) ??
    null
  );
}

export async function generateStaticParams() {
  const countries = await loadCountriesFromDisk();

  return countries.map((country) => ({
    country: slugifyCountry(country.country),
  }));
}

export async function generateMetadata({
  params,
}: CountryPageProps): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const country = await findCountry(countrySlug);

  const countryName = country?.country ?? titleCaseFromSlug(countrySlug);

  const title = `Hantavirus in ${countryName} | Cases, Deaths & Updates`;
  const description = `Track hantavirus updates in ${countryName}, including confirmed cases, reported deaths, risk level, and last available public-health update.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/hantavirus/${countrySlug}`,
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/hantavirus/${countrySlug}`,
      siteName: 'HantaMap',
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CountryHantavirusPage({
  params,
}: CountryPageProps) {
  const { country: countrySlug } = await params;
  const country = await findCountry(countrySlug);

  if (!country) {
    notFound();
  }

  const confirmed = country.confirmed ?? 0;
  const deaths = country.deaths ?? 0;
  const suspected = country.suspected ?? 0;
  const probable = country.probable ?? 0;
  const possible = country.possible ?? 0;
  const underInvestigation = country.under_investigation ?? 0;
  const pending = country.pending ?? 0;

  const unconfirmed =
    country.unconfirmed ??
    suspected + probable + possible + underInvestigation + pending;

  const totalIdentified = country.total_identified ?? confirmed + unconfirmed;

  const pageTitle = `Hantavirus report for ${country.country}`;
  const canonicalUrl = `${SITE_URL}/hantavirus/${countrySlug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${country.country} hantavirus tracking report`,
    description: `Country-level hantavirus report for ${country.country}, including confirmed cases, unconfirmed signals, deaths, and risk level.`,
    url: canonicalUrl,
    isAccessibleForFree: true,
    keywords: [
      'hantavirus',
      `hantavirus ${country.country}`,
      `${country.country} hantavirus cases`,
      `${country.country} hantavirus outbreak`,
      'outbreak tracker',
      'public health data',
    ],
    spatialCoverage: {
      '@type': 'Place',
      name: country.country,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: country.lat,
        longitude: country.lng,
      },
    },
    variableMeasured: [
      {
        '@type': 'PropertyValue',
        name: 'Confirmed cases',
        value: confirmed,
      },
      {
        '@type': 'PropertyValue',
        name: 'Unconfirmed cases',
        value: unconfirmed,
      },
      {
        '@type': 'PropertyValue',
        name: 'Total identified cases',
        value: totalIdentified,
      },
      {
        '@type': 'PropertyValue',
        name: 'Deaths',
        value: deaths,
      },
      {
        '@type': 'PropertyValue',
        name: 'Risk level',
        value: country.risk_level,
      },
    ],
    dateModified: country.last_updated,
  };

  return (
    <main className="min-h-dvh bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          ← Back to dashboard
        </Link>

        <section className="mt-6 overflow-hidden border border-white/10 bg-[#050505] shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_38%)]" />

            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-300/75">
                Country / Region report
              </p>

              <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                {pageTitle}
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/58 sm:text-base sm:leading-8">
                This report is generated automatically from the confirmed cases
                by country/region dataset. It summarizes the latest available
                Hantavirus values for{' '}
                <strong className="font-semibold text-white">{country.country}</strong>.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="border border-red-400/25 bg-red-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200">
                  Risk: {country.risk_level}
                </span>

                <span className="border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                  Region: {country.region ?? 'Unknown'}
                </span>

                <span className="border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                  Updated: {formatDateTime(country.last_updated)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-white/10 bg-[#050505] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Confirmed cases
            </p>
            <div className="mt-3 font-mono text-4xl font-light tracking-[-0.04em] text-white">
              {formatNumber(confirmed)}
            </div>
          </div>

          <div className="border border-white/10 bg-[#050505] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Unconfirmed signals
            </p>
            <div className="mt-3 font-mono text-4xl font-light tracking-[-0.04em] text-white">
              {formatNumber(unconfirmed)}
            </div>
          </div>

          <div className="border border-white/10 bg-[#050505] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Total identified
            </p>
            <div className="mt-3 font-mono text-4xl font-light tracking-[-0.04em] text-white">
              {formatNumber(totalIdentified)}
            </div>
          </div>

          <div className="border border-white/10 bg-[#050505] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Reported deaths
            </p>
            <div className="mt-3 font-mono text-4xl font-light tracking-[-0.04em] text-red-200">
              {formatNumber(deaths)}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="border border-white/10 bg-[#050505] p-5 sm:p-6">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
              Situation summary
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-8 text-white/58">
              <p>
                The current country/region record for{' '}
                <strong className="font-semibold text-white">{country.country}</strong>{' '}
                shows{' '}
                <strong className="font-semibold text-white">
                  {formatNumber(confirmed)} confirmed cases
                </strong>
                ,{' '}
                <strong className="font-semibold text-white">
                  {formatNumber(unconfirmed)} unconfirmed signals
                </strong>
                , and{' '}
                <strong className="font-semibold text-white">
                  {formatNumber(deaths)} reported deaths
                </strong>
                .
              </p>

              <p>
                Values may change when official sources confirm, reclassify, or
                rule out cases. This report is for public information only and
                does not provide medical advice.
              </p>

              <p>
                For the full global dashboard, interactive map, timeline, and
                source list, return to the main HantaMap dashboard.
              </p>
            </div>
          </article>

          <aside className="border border-white/10 bg-[#050505] p-5">
            <h2 className="text-lg font-semibold text-white">Report details</h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-white/40">Country / Region</dt>
                <dd className="text-right font-medium text-white">{country.country}</dd>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-white/40">Region</dt>
                <dd className="text-right font-medium text-white">
                  {country.region ?? 'Unknown'}
                </dd>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-white/40">Risk level</dt>
                <dd className="text-right font-medium uppercase text-red-200">
                  {country.risk_level}
                </dd>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <dt className="text-white/40">Latitude</dt>
                <dd className="text-right font-mono text-white">{country.lat}</dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-white/40">Longitude</dt>
                <dd className="text-right font-mono text-white">{country.lng}</dd>
              </div>
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}