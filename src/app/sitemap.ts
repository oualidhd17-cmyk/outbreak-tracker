import type { MetadataRoute } from 'next';

import { SEO_PAGES } from '@/lib/seo-pages';
import {
  getSiteUrl,
  loadArcgisServerData,
  loadLatestArticles,
  slugify,
} from '@/lib/server-data';
import { loadTrends } from '@/lib/trends';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes = [
    '',
    '/about',
    '/sources',
    '/faq',
    '/medical-disclaimer',
    '/trends',
  ];

  const staticItems: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'hourly' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));

  const seoItems: MetadataRoute.Sitemap = SEO_PAGES.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  const arcgis = loadArcgisServerData();

  const countryItems: MetadataRoute.Sitemap = arcgis.countries.map((country) => ({
    url: `${siteUrl}/hantavirus/${slugify(country.country)}`,
    lastModified: country.last_updated ? new Date(country.last_updated) : now,
    changeFrequency: 'daily',
    priority: 0.86,
  }));

  const caseItems: MetadataRoute.Sitemap = arcgis.cases.map((item) => ({
    url: `${siteUrl}/case/${item.id}`,
    lastModified: arcgis.checked_at ? new Date(arcgis.checked_at) : now,
    changeFrequency: 'daily',
    priority: 0.78,
  }));

  const latestItems: MetadataRoute.Sitemap = loadLatestArticles().map(
    (article) => ({
      url: `${siteUrl}/latest/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at) : now,
      changeFrequency: 'daily',
      priority: 0.8,
    }),
  );

  let trendItems: MetadataRoute.Sitemap = [];

  try {
    const trends = await loadTrends();

    trendItems = trends.map((trend) => ({
      url: `${siteUrl}/trend/${trend.slug}`,
      lastModified: trend.updated_at ? new Date(trend.updated_at) : now,
      changeFrequency: 'daily',
      priority: 0.72,
    }));
  } catch {
    trendItems = [];
  }

  return [
    ...staticItems,
    ...seoItems,
    ...countryItems,
    ...caseItems,
    ...latestItems,
    ...trendItems,
  ];
}