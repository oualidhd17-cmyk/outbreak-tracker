import type { ArcgisDashboardData } from '@/types/arcgis';
import type {
  OutbreakCountry,
  OutbreakFetchLogItem,
  OutbreakGlobalStats,
  OutbreakOfficialEvent,
  OutbreakPoint,
  OutbreakSource,
  OutbreakTimelineItem,
} from '@/types/outbreak';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json() as Promise<T>;
}

async function fetchOptionalJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return await fetchJson<T>(path);
  } catch {
    return fallback;
  }
}

export async function loadGlobalStats(): Promise<OutbreakGlobalStats> {
  return fetchJson<OutbreakGlobalStats>('/data/global.json');
}

export async function loadCountries(): Promise<OutbreakCountry[]> {
  return fetchJson<OutbreakCountry[]>('/data/countries.json');
}

export async function loadPoints(): Promise<OutbreakPoint[]> {
  return fetchJson<OutbreakPoint[]>('/data/points.json');
}

export async function loadTimeline(): Promise<OutbreakTimelineItem[]> {
  return fetchJson<OutbreakTimelineItem[]>('/data/timeline.json');
}

export async function loadSources(): Promise<OutbreakSource[]> {
  return fetchJson<OutbreakSource[]>('/data/sources.json');
}

export async function loadOfficialEvents(): Promise<OutbreakOfficialEvent[]> {
  return fetchOptionalJson<OutbreakOfficialEvent[]>(
    '/data/official_events.json',
    [],
  );
}

export async function loadHistoricalContext(): Promise<unknown> {
  return fetchOptionalJson<unknown>('/data/historical_context.json', {});
}

export async function loadFetchLog(): Promise<OutbreakFetchLogItem[]> {
  return fetchOptionalJson<OutbreakFetchLogItem[]>('/data/fetch_log.json', []);
}

export async function loadArcgisDashboard(): Promise<ArcgisDashboardData> {
  return fetchOptionalJson<ArcgisDashboardData>('/data/arcgis_dashboard.json', {
    checked_at: '',
    source: 'ArcGIS dashboard',
    dashboard_url: '',
    dashboard_item_id: '',
    note: '',
    cases: [],
    countries: [],
  });
}