export type ArcgisCaseStatus =
  | 'confirmed'
  | 'deceased'
  | 'suspected'
  | 'monitoring'
  | 'unknown';

export type ArcgisCaseItem = {
  id: string;
  layer?: string;
  status: ArcgisCaseStatus;
  raw_status?: string;
  title: string;
  details: string;
  last_location: string;
  country: string;
  lat: number;
  lng: number;
  source_url?: string;
  exposed_at?: string;
};

export type ArcgisCountryItem = {
  country: string;
  region: string;
  is_country: boolean;
  confirmed: number;
  suspected: number;
  probable: number;
  possible: number;
  under_investigation: number;
  pending: number;
  unconfirmed: number;
  total_identified: number;
  ruled_out: number;
  negative: number;
  deaths: number;
  recovered: number;
  hospitalized: number;
  active: number;
  lat: number;
  lng: number;
  risk_level: string;
  last_updated: string;
};

export type ArcgisDashboardData = {
  checked_at: string;
  source: string;
  dashboard_url?: string;
  dashboard_item_id?: string;
  note?: string;
  cases: ArcgisCaseItem[];
  countries: ArcgisCountryItem[];
};