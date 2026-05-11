import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getSiteUrl, loadLatestArticles } from '@/lib/server-data';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return loadLatestArticles().map((article) => ({
    slug: article.slug,
  }));
}

function getArticle(slug: string) {
  return loadLatestArticles().find((article) => article.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return {};
  }

  const siteUrl = getSiteUrl();

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `${siteUrl}/latest/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${siteUrl}/latest/${article.slug}`,
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [`${siteUrl}/opengraph-image`],
    },
  };
}

export default async function LatestArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const siteUrl = getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description,
    url: `${siteUrl}/latest/${article.slug}`,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'HantaMap',
    },
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
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-wider text-red-400 hover:text-red-300"
        >
          ← Live tracker
        </Link>

        <article className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
              {article.status}
            </span>

            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {article.country}
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            {article.title}
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            {article.description}
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5">
            <h2 className="text-xl font-black">Tracker summary</h2>

            <p className="mt-3 leading-7 text-gray-400">
              This update page was generated automatically from the latest public
              Hantavirus tracking data. It is designed to help users find current
              map signals, country pages and source links.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/case/${article.case_id}`}
              className="rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-500"
            >
              Open case page
            </Link>

            <a
              href={article.source_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wider text-gray-200 transition hover:bg-white/10"
            >
              Source link
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}