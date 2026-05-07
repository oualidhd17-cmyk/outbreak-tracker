export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical' | 'unknown';

export type OutbreakGlobalStats = {
  disease: string;
  total_confirmed: number;
  total_deaths: number;
  total_recovered: number;
  affected_countries: number;
  global_risk_level: RiskLevel;
  last_updated: string;
  source_label: string;
};

export type OutbreakCountry = {
  country: string;
  region?: string;
  confirmed: number;
  deaths: number;
  recovered?: number;
  active?: number;
  lat: number;
  lng: number;
  risk_level: RiskLevel;
  last_updated?: string;
};

export type OutbreakPoint = {
  id: string;
  name: string;
  country: string;
  confirmed: number;
  deaths: number;
  lat: number;
  lng: number;
  source: string;
  source_url?: string;
  risk_level: RiskLevel;
};

export type OutbreakTimelineItem = {
  date: string;
  confirmed: number;
  deaths: number;
  recovered?: number;
};

export type OutbreakSource = {
  id: string;
  name: string;
  url: string;
  type: 'official' | 'health-agency' | 'early-warning' | 'news';
  last_checked_at: string;
  confidence: 'high' | 'medium' | 'low';
};

export type OutbreakDashboardData = {
  global: OutbreakGlobalStats;
  countries: OutbreakCountry[];
  points: OutbreakPoint[];
  timeline: OutbreakTimelineItem[];
  sources: OutbreakSource[];
};