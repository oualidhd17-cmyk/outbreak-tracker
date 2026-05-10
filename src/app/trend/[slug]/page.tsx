import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  ExternalLink,
  Globe2,
  MapPinned,
  Newspaper,
  Search,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

import { getRelatedTrends, getTrendBySlug, loadTrends } from '@/lib/trends';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hantamap.online';

type TrendPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = 'force-static';

export function generateStaticParams() {
  return loadTrends().map((trend) => ({
    slug: trend.slug,
  }));
}

export async function generateMetadata({
  params,
}: TrendPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trend = getTrendBySlug(slug);

  if (!trend) {
    return {
      title: 'Trend not found | HantaUpdates',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: trend.seo.title,
    description: trend.seo.description,
    keywords: trend.seo.keywords,
    alternates: {
      canonical: `/trend/${trend.slug}`,
    },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/trend/${trend.slug}`,
      title: trend.seo.title,
      description: trend.seo.description,
      siteName: 'HantaUpdates',
    },
    twitter: {
      card: 'summary_large_image',
      title: trend.seo.title,
      description: trend.seo.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
  };
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function TrendPage({ params }: TrendPageProps) {
  const { slug } = await params;
  const trend = getTrendBySlug(slug);

  if (!trend) {
    notFound();
  }

  const relatedTrends = getRelatedTrends(trend.slug, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: trend.seo.title,
        description: trend.seo.description,
        datePublished: trend.published_at,
        dateModified: trend.updated_at,
        author: {
          '@type': 'Organization',
          name: 'HantaUpdates',
        },
        publisher: {
          '@type': 'Organization',
          name: 'HantaUpdates',
          url: SITE_URL,
        },
        mainEntityOfPage: `${SITE_URL}/trend/${trend.slug}`,
        about: {
          '@type': 'Thing',
          name: trend.keyword,
        },
      },
      {
        '@type': 'Dataset',
        name: `${trend.keyword} trend signal`,
        description: trend.description,
        keywords: trend.seo.keywords,
        isAccessibleForFree: true,
        dateModified: trend.updated_at,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is ${trend.keyword}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${trend.keyword} is currently being tracked as a public search and news signal. This page summarizes public context and source links only.`,
            },
          },
          {
            '@type': 'Question',
            name: `Is this ${trend.keyword} page medical advice?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. This page is informational only and does not provide medical advice, diagnosis, or treatment.',
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-dvh bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <section className="mt-5 overflow-hidden border border-white/10 bg-[#050505]">
          <div className="relative p-5 sm:p-7 lg:p-9">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_36%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Live search trend
                </div>

                <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.065em] text-white sm:text-6xl">
                  {trend.keyword}
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
                  {trend.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                    {trend.category}
                  </span>

                  <span className="border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                    GEO: {trend.geo}
                  </span>

                  {trend.traffic_label ? (
                    <span className="border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-red-200">
                      {trend.traffic_label}
                    </span>
                  ) : null}
                </div>
              </div>

              <aside className="border border-white/10 bg-black/45 p-4">
                <div className="grid gap-3">
                  <div className="border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                      <Activity className="h-3.5 w-3.5 text-red-400" />
                      Trend score
                    </div>

                    <div className="mt-2 font-mono text-3xl font-black text-red-400">
                      {trend.score.toLocaleString('en-US')}
                    </div>
                  </div>

                  <div className="border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                      <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
                      Last updated
                    </div>

                    <div className="mt-2 text-sm font-bold text-white">
                      {formatDate(trend.updated_at)}
                    </div>
                  </div>

                  <div className="border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                      <MapPinned className="h-3.5 w-3.5 text-white" />
                      Map focus
                    </div>

                    <div className="mt-2 text-sm font-bold text-white">
                      {trend.map_focus.label}
                    </div>

                    <div className="mt-1 font-mono text-xs text-white/35">
                      {trend.map_focus.lat}, {trend.map_focus.lng}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4">
            <div className="border border-white/10 bg-[#050505] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                <Search className="h-3.5 w-3.5" />
                Search context
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-[-0.045em] text-white">
                Why this page exists
              </h2>

              <p className="mt-4 text-sm leading-8 text-white/58">
                This page is generated when a public search trend appears around{' '}
                <strong className="font-bold text-white">{trend.keyword}</strong>.
                It does not claim that an outbreak is confirmed. It only collects
                trend context, related source links, and public-health signals in
                one place.
              </p>
            </div>

            <div className="border border-amber-300/20 bg-[#0b0903] p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                <ShieldAlert className="h-3.5 w-3.5" />
                Medical disclaimer
              </div>

              <p className="mt-3 text-sm leading-8 text-white/65">
                This page is for information only. It is not medical advice,
                diagnosis, or treatment. Always follow official health authority
                guidance and consult a qualified professional for health decisions.
              </p>
            </div>

            {trend.sources.length > 0 ? (
              <div className="border border-white/10 bg-[#050505] p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                  <Newspaper className="h-3.5 w-3.5" />
                  Related sources
                </div>

                <div className="mt-4 grid gap-3">
                  {trend.sources.map((source) => (
                    <a
                      key={`${source.url}-${source.title}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold leading-6 text-white group-hover:text-red-200">
                            {source.title}
                          </h3>

                          <p className="mt-2 text-xs leading-6 text-white/45">
                            {source.summary}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                            <span>{source.source}</span>
                            <span>•</span>
                            <span>{formatDate(source.published_at)}</span>
                          </div>
                        </div>

                        <ExternalLink className="h-4 w-4 shrink-0 text-white/25 transition group-hover:text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="grid gap-4 self-start">
            {trend.related_queries.length > 0 ? (
              <div className="border border-white/10 bg-[#050505] p-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/40">
                  Related queries
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {trend.related_queries.map((query) => (
                    <span
                      key={query}
                      className="border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/60"
                    >
                      {query}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {relatedTrends.length > 0 ? (
              <div className="border border-white/10 bg-[#050505] p-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/40">
                  More trend pages
                </h2>

                <div className="mt-4 grid gap-2">
                  {relatedTrends.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/trend/${item.slug}`}
                      className="border border-white/10 bg-white/[0.025] p-3 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <div className="text-sm font-bold text-white">
                        {item.keyword}
                      </div>

                      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                        {item.category} · {item.geo}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <a
              href={trend.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-red-200 transition hover:bg-red-500/15"
            >
              Open trend source
              <ExternalLink className="h-4 w-4" />
            </a>
          </aside>
        </section>
      </div>
    </main>
  );
}