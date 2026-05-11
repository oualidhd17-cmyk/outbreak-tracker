import fs from 'node:fs';
import path from 'node:path';

import type { ArcgisCaseItem, ArcgisDashboardData } from '@/types/arcgis';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

export function readDataJson<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'https://hantamap.online'
  ).replace(/\/$/, '');
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function unslugify(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function loadArcgisServerData(): ArcgisDashboardData {
  return readDataJson<ArcgisDashboardData>('arcgis_dashboard.json', {
    checked_at: '',
    source: 'ArcGIS independent research dashboard',
    cases: [],
    countries: [],
  });
}

export function loadLatestArticles(): Array<{
  id: string;
  slug: string;
  title: string;
  description: string;
  country: string;
  status: string;
  case_id: string;
  published_at: string;
  updated_at: string;
  source_url: string;
}> {
  return readDataJson('latest_articles.json', []);
}

export function findCountryBySlug(slug: string) {
  const data = loadArcgisServerData();

  return data.countries.find((country) => slugify(country.country) === slug);
}

export function findCaseById(id: string): ArcgisCaseItem | undefined {
  const data = loadArcgisServerData();

  return data.cases.find((item) => item.id === id);
}

export function getCasesByCountrySlug(slug: string): ArcgisCaseItem[] {
  const data = loadArcgisServerData();

  return data.cases.filter((item) => slugify(item.country) === slug);
}