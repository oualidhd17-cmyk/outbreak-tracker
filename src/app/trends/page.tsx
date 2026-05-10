import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';

import { loadTrends } from '@/lib/trends';

export const metadata: Metadata = {
  title: 'Live Health Trends | HantaUpdates',
  description:
    'Public-health related search trends and source links tracked by HantaUpdates.',
  alternates: {
    canonical: '/trends',
  },
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

export default function TrendsPage() {
  const trends = loadTrends();

  return (
    <main className="min-h-dvh bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <section className="mt-5 border border-white/10 bg-[#050505] p-5 sm:p-7">
          <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
            <TrendingUp className="h-3.5 w-3.5" />
            Programmatic SEO
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">
            Live Health Trends
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-white/58 sm:text-base">
            Automatically generated pages for public-health related search
            trends. Each page includes context, source links, and a clear
            medical disclaimer.
          </p>
        </section>

        <section className="mt-4 grid gap-3">
          {trends.length === 0 ? (
            <div className="border border-white/10 bg-[#050505] p-6 text-sm text-white/50">
              No trend pages generated yet. Run the trend update script first.
            </div>
          ) : (
            trends.map((trend) => (
              <Link
                key={trend.slug}
                href={`/trend/${trend.slug}`}
                className="group grid gap-4 border border-white/10 bg-[#050505] p-4 transition hover:border-white/20 hover:bg-white/[0.035] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <h2 className="text-lg font-black tracking-[-0.03em] text-white group-hover:text-red-200">
                    {trend.keyword}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-white/50">
                    {trend.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                    <span>{trend.category}</span>
                    <span>•</span>
                    <span>{trend.geo}</span>
                    <span>•</span>
                    <span>{formatDate(trend.updated_at)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {trend.traffic_label ? (
                    <span className="border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-200">
                      {trend.traffic_label}
                    </span>
                  ) : null}

                  <span className="border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                    Open
                  </span>
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  );
}