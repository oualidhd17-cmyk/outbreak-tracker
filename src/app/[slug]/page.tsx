import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SEO_PAGES } from '@/lib/seo-pages';
import { getSiteUrl } from '@/lib/server-data';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getSeoPage(slug: string) {
  return SEO_PAGES.find((page) => page.slug === slug);
}

export function generateStaticParams() {
  return SEO_PAGES.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page) {
    return {};
  }

  const siteUrl = getSiteUrl();

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: `${siteUrl}/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${siteUrl}/${page.slug}`,
      siteName: 'HantaMap',
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [`${siteUrl}/opengraph-image`],
    },
  };
}

export default async function SeoTopicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    mainEntityOfPage: `${getSiteUrl()}/${page.slug}`,
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

      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl md:p-10">
          <div className="text-xs font-black uppercase tracking-[0.28em] text-red-400">
            Live Public Health Tracker
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl">
            {page.h1}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
            {page.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-500"
            >
              Open Live Map
            </Link>

            <Link
              href="/sources"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-wider text-gray-200 transition hover:bg-white/10"
            >
              View Sources
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {page.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-white/10 bg-[#070707] p-6"
            >
              <h2 className="text-xl font-black text-white">{section.title}</h2>

              <p className="mt-3 leading-7 text-gray-400">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm leading-7 text-yellow-100">
          Independent tracker based on public map signals and source links. This
          site is not medical advice and is not an official health authority.
        </div>
      </section>
    </main>
  );
}