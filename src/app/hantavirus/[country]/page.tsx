import fs from 'node:fs';
import path from 'node:path';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';

import { formatDateTime, formatNumber } from '@/lib/format';
import type {
  OutbreakCountry,
  OutbreakGlobalStats,
  OutbreakOfficialEvent,
} from '@/types/outbreak';

type PageProps = {
  params: Promise<{
    country: string;
  }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hantamap.online';
const DATA_DIR = path.join(process.cwd(), 'public', 'data');

function readJson<T>(fileName: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadCountries(): OutbreakCountry[] {
  return readJson<OutbreakCountry[]>('countries.json', []);
}

function loadGlobal(): OutbreakGlobalStats | null {
  return readJson<OutbreakGlobalStats | null>('global.json', null);
}

function loadOfficialEvents(): OutbreakOfficialEvent[] {
  return readJson<OutbreakOfficialEvent[]>('official_events.json', []);
}

function findCountryBySlug(slug: string): OutbreakCountry | null {
  return (
    loadCountries().find((country) => slugify(country.country) === slug) ?? null
  );
}

export function generateStaticParams() {
  return loadCountries().map((country) => ({
    country: slugify(country.country),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const country = findCountryBySlug(countrySlug);

  if (!country) {
    return {
      title: 'Hantavirus location update',
    };
  }

  const title = `${country.country} Hantavirus Update`;
  const description = `Latest official-source hantavirus tracking summary for ${country.country}. Confirmed: ${country.confirmed}, suspected: ${country.suspected ?? 0}, deaths: ${country.deaths}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/hantavirus/${countrySlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/hantavirus/${countrySlug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function HantavirusCountryPage({ params }: PageProps) {
  const { country: countrySlug } = await params;

  const country = findCountryBySlug(countrySlug);
  const global = loadGlobal();
  const events = loadOfficialEvents();

  if (!country || !global) {
    notFound();
  }

  const totalIdentified = country.total_identified ?? country.confirmed;
  const suspected = country.suspected ?? 0;
  const probable = country.probable ?? 0;
  const possible = country.possible ?? 0;
  const underInvestigation = country.under_investigation ?? 0;
  const pending = country.pending ?? 0;
  const unconfirmed =
    country.unconfirmed ??
    suspected + probable + possible + underInvestigation + pending;

  const relatedEvents = events.filter((event) => {
    return (event.countries ?? []).some((item) => {
      return slugify(item.country) === countrySlug;
    });
  });

  const primaryUrl = global.primary_event_url ?? global.current_outbreak?.source_url;

  return (
    <main className="min-h-dvh bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/45 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <section className="mt-5 overflow-hidden border border-white/10 bg-[#050505]">
          <div className="relative p-5 sm:p-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_36%)]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Official-source location page
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">
                {country.country} Hantavirus Update
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-8 text-white/58 sm:text-base">
                Current public-health tracking summary for this affected
                location. This page is informational only and does not provide
                medical advice.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  {country.region || 'Region unavailable'}
                </span>

                <span className="border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-red-200">
                  Risk: {country.risk_level}
                </span>

                <span className="border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  Updated: {formatDateTime(country.last_updated ?? global.last_updated)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-white/10 bg-[#050505] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              Confirmed
            </p>
            <div className="mt-2 font-mono text-4xl font-black text-red-500">
              {formatNumber(country.confirmed)}
            </div>
          </div>

          <div className="border border-white/10 bg-[#050505] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              Suspected
            </p>
            <div className="mt-2 font-mono text-4xl font-black text-amber-300">
              {formatNumber(suspected)}
            </div>
          </div>

          <div className="border border-white/10 bg-[#050505] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              Total identified
            </p>
            <div className="mt-2 font-mono text-4xl font-black text-white">
              {formatNumber(totalIdentified)}
            </div>
          </div>

          <div className="border border-white/10 bg-[#050505] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              Deaths
            </p>
            <div className="mt-2 font-mono text-4xl font-black text-white">
              {formatNumber(country.deaths)}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="border border-white/10 bg-[#050505] p-5 sm:p-6">
            <h2 className="text-xl font-black tracking-[-0.04em] text-white">
              Case classification
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ['Probable', probable],
                ['Possible', possible],
                ['Under investigation', underInvestigation],
                ['Pending', pending],
                ['Unconfirmed total', unconfirmed],
                ['Hospitalized', country.hospitalized ?? 0],
                ['Recovered', country.recovered ?? 0],
                ['Active estimate', country.active ?? 0],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between gap-4 border border-white/10 bg-white/[0.025] px-4 py-3"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                    {label}
                  </span>
                  <span className="font-mono text-lg font-black text-white">
                    {formatNumber(Number(value))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-white/10 bg-[#050505] p-5">
            <h2 className="text-base font-black text-white">
              Source and status
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-7 text-white/55">
              <p>
                Primary event:{' '}
                <span className="font-bold text-white">
                  {global.event_name ?? 'Current outbreak event'}
                </span>
              </p>

              <p>
                Data mode:{' '}
                <span className="font-bold text-emerald-300">Static JSON</span>
              </p>

              <p>
                Coordinates:{' '}
                <span className="font-mono text-white">
                  {country.lat}, {country.lng}
                </span>
              </p>

              {primaryUrl ? (
                <a
                  href={primaryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/60 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  Open primary source
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </aside>
        </section>

        <section className="mt-4 border border-white/10 bg-[#050505] p-5 sm:p-6">
          <h2 className="text-xl font-black tracking-[-0.04em] text-white">
            Related official events
          </h2>

          <div className="mt-5 grid gap-3">
            {relatedEvents.length === 0 ? (
              <div className="border border-white/10 bg-white/[0.025] p-4 text-sm text-white/45">
                No related official event entries found for this location.
              </div>
            ) : (
              relatedEvents.map((event) => (
                <a
                  key={`${event.source_id}-${event.url}`}
                  href={event.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.045]"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                    {event.source} · {event.published_at || 'Date unavailable'}
                  </p>

                  <h3 className="mt-2 text-base font-black text-white group-hover:text-red-200">
                    {event.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-white/50">
                    {event.summary}
                  </p>
                </a>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}