export type TrendCategory =
  | 'public-health'
  | 'emergency'
  | 'sports'
  | 'politics'
  | 'news';

export type TrendSource = {
  title: string;
  url: string;
  source: string;
  published_at: string;
  summary: string;
};

export type TrendMapFocus = {
  label: string;
  lat: number;
  lng: number;
  zoom: number;
};

export type TrendSeo = {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
};

export type TrendItem = {
  id: string;
  slug: string;
  keyword: string;
  title: string;
  description: string;
  category: TrendCategory;
  geo: string;
  search_volume: string;
  traffic_label: string;
  published_at: string;
  updated_at: string;
  first_seen_at?: string;
  score: number;
  source_url: string;
  sources: TrendSource[];
  related_queries: string[];
  map_focus: TrendMapFocus;
  seo: TrendSeo;
  views_hint?: number;
};