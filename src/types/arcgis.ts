export type ArcgisCaseStatus =
  | 'confirmed'
  | 'deceased'
  | 'suspected'
  | 'monitoring'
  | 'unknown';

export type ArcgisCaseItem = {
  id: string;
  status: ArcgisCaseStatus;
  title: string;
  details: string;
  last_location: string;
  country: string;
  lat: number;
  lng: number;
  source_url?: string;
};

export type ArcgisDashboardData = {
  checked_at: string;
  source: string;
  cases: ArcgisCaseItem[];
};