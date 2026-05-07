import type {
  OutbreakCountry,
  OutbreakGlobalStats,
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