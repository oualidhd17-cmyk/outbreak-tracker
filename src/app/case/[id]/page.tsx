import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  findCaseById,
  getSiteUrl,
  loadArcgisServerData,
  slugify,
} from '@/lib/server-data';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  const data = loadArcgisServerData();

  return data.cases.map((item) => ({
    id: item.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = findCaseById(id);

  if (!item) {
    return {};
  }

  const siteUrl = getSiteUrl();

  return {
    title: `${item.title} | Hantavirus Case Tracker`,
    description:
      item.details ||
      `Hantavirus ${item.status} signal in ${item.country}. Independent tracker page generated from public map data.`,
    alternates: {
      canonical: `${siteUrl}/case/${item.id}`,
    },
    openGraph: {
      title: `${item.title} | Hantavirus Tracker`,
      description:
        item.details || `Hantavirus ${item.status} signal in ${item.country}.`,
      url: `${siteUrl}/case/${item.id}`,
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description:
        item.details || `Hantavirus ${item.status} signal in ${item.country}.`,
      images: [`${siteUrl}/opengraph-image`],
    },
  };
}

export default async function CasePage({ params }: PageProps) {
  const { id } = await params;
  const item = findCaseById(id);

  if (!item) {
    notFound();
  }

  const countrySlug = slugify(item.country);
  const siteUrl = getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description:
      item.details || `Hantavirus ${item.status} signal in ${item.country}.`,
    url: `${siteUrl}/case/${item.id}`,
    datePublished: item.exposed_at || undefined,
    dateModified: new Date().toISOString(),
  };

  return (
    <main className="min-h-dvh bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <section className="mx-auto max-w-4xl px-5 py-10">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-wider text-red-400 hover:text-red-300"
          >
            ← Live map
          </Link>

          <Link
            href={`/hantavirus/${countrySlug}`}
            className="text-sm font-bold uppercase tracking-wider text-yellow-300 hover:text-yellow-200"
          >
            {item.country}
          </Link>
        </div>

        <article className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
              {item.status}
            </span>

            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {item.country}
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            {item.title}
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            {item.details ||
              `This page tracks a ${item.status} Hantavirus signal in ${item.country}.`}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="text-xs font-black uppercase tracking-widest text-gray-500">
                Last location
              </div>

              <div className="mt-2 text-xl font-black">{item.last_location}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="text-xs font-black uppercase tracking-widest text-gray-500">
                Coordinates
              </div>

              <div className="mt-2 font-mono text-xl font-black">
                {item.lat}, {item.lng}
              </div>
            </div>
          </div>

          {item.source_url ? (
            <a
              href={item.source_url}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-500"
            >
              Open source
            </a>
          ) : null}
        </article>

        <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm leading-7 text-yellow-100">
          This is an independent tracker page generated from public map data. It
          is not medical advice and is not an official health authority report.
        </div>
      </section>
    </main>
  );
}