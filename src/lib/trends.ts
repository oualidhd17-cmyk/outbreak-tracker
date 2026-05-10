import fs from 'node:fs';
import path from 'node:path';

import type { TrendItem } from '@/types/trends';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'trends.json');

export function loadTrends(): TrendItem[] {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return [];
    }

    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is TrendItem => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as TrendItem).slug === 'string' &&
        typeof (item as TrendItem).keyword === 'string'
      );
    });
  } catch {
    return [];
  }
}

export function getTrendBySlug(slug: string): TrendItem | null {
  return loadTrends().find((item) => item.slug === slug) ?? null;
}

export function getRelatedTrends(currentSlug: string, limit = 6): TrendItem[] {
  return loadTrends()
    .filter((item) => item.slug !== currentSlug)
    .slice(0, limit);
}