import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Newspaper,
  Search,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

import { getRelatedTrends, getTrendBySlug, loadTrends } from '@/lib/trends';

type TrendPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
    };
  }

  return {
    title: trend.seo?.title || trend.title,
    description: trend.seo?.description || trend.description,
    keywords: trend.seo?.keywords || [trend.keyword],
    alternates: {
      canonical: `/trend/${trend.slug}`,
    },
    openGraph: {
      title: trend.seo?.title || trend.title,
      description: trend.seo?.description || trend.description,
      type: 'article',
      url: `/trend/${trend.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: trend.seo?.title || trend.title,
      description: trend.seo?.description || trend.description,
    },
  };
}

export default async function TrendDetailPage({ params }: TrendPageProps) {
  const { slug } = await params;
  const trend = getTrendBySlug(slug);

  if (!trend) {
    notFound();
  }

  const relatedTrends = getRelatedTrends(trend.slug, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: trend.title,
    description: trend.description,
    datePublished: trend.published_at,
    dateModified: trend.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `/trend/${trend.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'HantaUpdates',
    },
    about: {
      '@type': 'Thing',
      name: trend.keyword,
    },
  };

  return (
    <main className="min-h-dvh bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/trends"
          className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/45 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to trends
        </Link>

        <section className="mt-5 overflow-hidden border border-white/10 bg-[#050505]">
          <div className="relative p-5 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_36%)]" />

            <div className="relative">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Live trend
                </span>

                <span className="border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                  {trend.category}
                </span>

                <span className="border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                  {trend.geo}
                </span>
              </div>

              <h1 className="mt-5 max-w-5xl text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">
                {trend.keyword}
              </h1>

              <p className="mt-5 max-w-4xl text-sm leading-8 text-white/62 sm:text-base">
                {trend.description}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="border border-[#252525] bg-[#0b0b0b] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
                    Search volume
                  </p>
                  <div className="mt-2 text-2xl font-black text-red-400">
                    {trend.search_volume || trend.traffic_label || 'Unknown'}
                  </div>
                </div>

                <div className="border border-[#252525] bg-[#0b0b0b] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
                    Last updated
                  </p>
                  <div className="mt-2 text-sm font-bold leading-7 text-white">
                    {formatDate(trend.updated_at)}
                  </div>
                </div>

                <div className="border border-[#252525] bg-[#0b0b0b] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
                    Focus area
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-bold text-white">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    {trend.map_focus?.label || 'Global'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4">
            <article className="border border-white/10 bg-[#050505] p-5 sm:p-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
                <Search className="h-3.5 w-3.5" />
                Trend context
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                What this page tracks
              </h2>

              <p className="mt-4 text-sm leading-8 text-white/60">
                This page is generated from public search and news signals. It
                is designed for calm awareness, source discovery, and SEO
                coverage around the keyword{' '}
                <strong className="text-white">{trend.keyword}</strong>.
              </p>

              {trend.related_queries.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                    Related queries
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {trend.related_queries.map((query) => (
                      <span
                        key={query}
                        className="border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/55"
                      >
                        {query}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>

            <section className="border border-white/10 bg-[#050505] p-5 sm:p-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                <Newspaper className="h-3.5 w-3.5" />
                Source links
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                Latest visible sources
              </h2>

              <div className="mt-5 grid gap-3">
                {trend.sources.length === 0 ? (
                  <div className="border border-white/10 bg-white/[0.025] p-4 text-sm text-white/45">
                    No source links were attached to this trend during the last
                    update.
                  </div>
                ) : (
                  trend.sources.map((source) => (
                    <a
                      key={`${source.title}-${source.url}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.045]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-base font-black leading-7 text-white group-hover:text-red-200">
                            {source.title}
                          </h3>

                          <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-white/35">
                            {source.source} · {formatDate(source.published_at)}
                          </p>
                        </div>

                        <ExternalLink className="h-4 w-4 shrink-0 text-white/35 group-hover:text-white" />
                      </div>

                      {source.summary ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/50">
                          {source.summary}
                        </p>
                      ) : null}
                    </a>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="grid h-fit gap-4">
            <section className="border border-amber-300/20 bg-[#0b0903] p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center border border-amber-300/25 bg-amber-300/10 text-amber-200">
                <ShieldAlert className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-lg font-black text-white">
                Information only
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/55">
                This trend page does not provide medical advice, diagnosis, or
                treatment. Always follow official public-health guidance.
              </p>
            </section>

            {trend.source_url ? (
              <a
                href={trend.source_url}
                target="_blank"
                rel="noreferrer"
                className="group border border-white/10 bg-[#050505] p-5 transition hover:border-white/20 hover:bg-white/[0.035]"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                  Original trend URL
                </p>

                <div className="mt-3 inline-flex items-center gap-2 text-sm font-black text-white group-hover:text-red-200">
                  Open trend source
                  <ExternalLink className="h-4 w-4" />
                </div>
              </a>
            ) : null}

            {relatedTrends.length > 0 ? (
              <section className="border border-white/10 bg-[#050505] p-5">
                <h2 className="text-base font-black text-white">
                  Related trends
                </h2>

                <div className="mt-4 grid gap-2">
                  {relatedTrends.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/trend/${item.slug}`}
                      className="border border-white/10 bg-white/[0.025] p-3 transition hover:border-white/20 hover:bg-white/[0.045]"
                    >
                      <p className="line-clamp-1 text-sm font-black text-white">
                        {item.keyword}
                      </p>

                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                        {item.geo} · {item.traffic_label || 'Live'}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </main>
  );
}