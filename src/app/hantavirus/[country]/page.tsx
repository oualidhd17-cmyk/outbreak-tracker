import fs from 'node:fs';
import path from 'node:path';

import Link from 'next/link';
import type { Metadata } from 'next';

import type { OutbreakCountry, OutbreakPoint } from '@/types/outbreak';

type CountryPageProps = {
  params: Promise<{
    country: string;
  }>;
};

function readJsonFile<T>(fileName: string, fallback: T): T {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', fileName);
    const raw = fs.readFileSync(filePath, 'utf-8');

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function unslugify(value: string): string {
  return decodeURIComponent(value)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat('en-US').format(Number(value || 0));
}

function findCountryBySlug(
  countries: OutbreakCountry[],
  countrySlug: string,
): OutbreakCountry | null {
  const decodedSlug = decodeURIComponent(countrySlug).toLowerCase();

  return (
    countries.find((country) => slugify(country.country) === decodedSlug) ??
    countries.find((country) => country.country.toLowerCase() === decodedSlug) ??
    null
  );
}

function getCountryPoints(
  points: OutbreakPoint[],
  countryName: string,
): OutbreakPoint[] {
  const normalizedCountry = countryName.toLowerCase();

  return points.filter((point) => point.country.toLowerCase() === normalizedCountry);
}

export async function generateStaticParams() {
  const countries = readJsonFile<OutbreakCountry[]>('countries.json', []);

  return countries
    .filter((country) => country.country)
    .map((country) => ({
      country: slugify(country.country),
    }));
}

export async function generateMetadata({
  params,
}: CountryPageProps): Promise<Metadata> {
  const { country } = await params;
  const countries = readJsonFile<OutbreakCountry[]>('countries.json', []);
  const row = findCountryBySlug(countries, country);

  const countryName = row?.country ?? unslugify(country);
  const total =
    row?.total_identified ??
    Number(row?.confirmed || 0) + Number(row?.suspected || 0);

  return {
    title: `${countryName} Hantavirus 2026 Live Cases | HantaMap`,
    description: `Track Hantavirus 2026 updates in ${countryName}. Confirmed, suspected, monitoring and death signals with live map data.`,
    alternates: {
      canonical: `/hantavirus/${slugify(countryName)}`,
    },
    openGraph: {
      title: `${countryName} Hantavirus 2026 Live Tracker`,
      description: `${countryName} currently has ${formatNumber(total)} tracked Hantavirus-related signals on HantaMap.`,
      url: `/hantavirus/${slugify(countryName)}`,
      type: 'article',
    },
  };
}

export default async function HantavirusCountryPage({ params }: CountryPageProps) {
  const { country } = await params;

  const countries = readJsonFile<OutbreakCountry[]>('countries.json', []);
  const points = readJsonFile<OutbreakPoint[]>('points.json', []);

  const row = findCountryBySlug(countries, country);
  const countryName = row?.country ?? unslugify(country);
  const countryPoints = row ? getCountryPoints(points, row.country) : [];

  const confirmed = Number(row?.confirmed || 0);
  const suspected = Number(row?.suspected || 0);
  const monitoring = Number(row?.under_investigation || 0);
  const deaths = Number(row?.deaths || 0);
  const total =
    Number(row?.total_identified || 0) ||
    confirmed + suspected + monitoring + deaths;

  if (!row) {
    return (
      <main className="min-h-dvh bg-black px-5 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-widest text-red-400 hover:text-red-300"
          >
            ← Back to live map
          </Link>

          <h1 className="mt-8 text-3xl font-black">
            Hantavirus data not found for {countryName}
          </h1>

          <p className="mt-3 text-sm leading-7 text-gray-400">
            This location is not currently available in the generated static
            dataset. Return to the live tracker to view the latest mapped
            locations.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-black text-white">
      <section className="border-b border-white/10 bg-[#050505] px-5 py-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="text-xs font-black uppercase tracking-[0.22em] text-red-400 hover:text-red-300"
          >
            ← Back to live Hantavirus map
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-gray-500">
                Hantavirus 2026 Location Tracker
              </div>

              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Hantavirus in {countryName}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400">
                Live static dashboard page for Hantavirus-related signals in{' '}
                <strong className="text-gray-200">{countryName}</strong>. Data
                may include confirmed, suspected, monitoring and deceased
                categories depending on the imported public tracking source.
              </p>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
              <div className="text-xs font-black uppercase tracking-widest text-red-300">
                Total tracked signals
              </div>

              <div className="mt-3 font-mono text-6xl font-black text-red-500">
                {formatNumber(total)}
              </div>

              <div className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                Last update: {row.last_updated || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">
              Confirmed
            </div>

            <div className="mt-3 font-mono text-4xl font-black text-red-500">
              {formatNumber(confirmed)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">
              Suspected
            </div>

            <div className="mt-3 font-mono text-4xl font-black text-yellow-300">
              {formatNumber(suspected)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">
              Monitoring
            </div>

            <div className="mt-3 font-mono text-4xl font-black text-lime-200">
              {formatNumber(monitoring)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">
              Deceased
            </div>

            <div className="mt-3 font-mono text-4xl font-black text-purple-400">
              {formatNumber(deaths)}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-12">
        <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#050505]">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-black">Mapped cases and signals</h2>

            <p className="mt-1 text-sm text-gray-500">
              Individual map points currently associated with {countryName}.
            </p>
          </div>

          {countryPoints.length === 0 ? (
            <div className="px-5 py-8 text-sm text-gray-500">
              No individual points are available for this location yet.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {countryPoints.map((point) => (
                <article
                  key={point.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[120px_minmax(0,1fr)_180px]"
                >
                  <div>
                    <div className="font-mono text-2xl font-black text-red-500">
                      {formatNumber(point.total_identified || 1)}
                    </div>

                    <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Signal
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-black text-white">{point.name}</h3>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      Confirmed: {formatNumber(point.confirmed)} · Suspected:{' '}
                      {formatNumber(point.suspected || 0)} · Monitoring:{' '}
                      {formatNumber(point.under_investigation || 0)} · Deaths:{' '}
                      {formatNumber(point.deaths)}
                    </p>

                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-600">
                      Coordinates: {point.lat}, {point.lng}
                    </p>
                  </div>

                  <div className="flex items-start lg:justify-end">
                    {point.source_url ? (
                      <a
                        href={point.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black uppercase tracking-wider text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        Open source
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#050505] px-5 py-8">
        <div className="mx-auto max-w-6xl text-sm leading-7 text-gray-500">
          <strong className="text-gray-300">Disclaimer:</strong> This is an
          independent tracker based on public data signals. It is not medical
          advice and should not replace official guidance from health agencies.
        </div>
      </section>
    </main>
  );
}