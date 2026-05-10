export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical' | 'unknown';

export type OutbreakSourceType =
  | 'official'
  | 'health-agency'
  | 'early-warning'
  | 'news';

export type OutbreakSourceConfidence = 'high' | 'medium' | 'low';

export type OutbreakMetrics = {
  confirmed_cases: number;
  suspected_cases: number;
  probable_cases: number;
  possible_cases: number;
  under_investigation_cases: number;
  pending_cases: number;
  ruled_out_cases: number;
  negative_cases: number;
  unconfirmed_cases: number;
  total_identified_cases: number;
  deaths: number;
  hospitalized: number;
  recovered: number;
};

export type OutbreakCurrentEvent = OutbreakMetrics & {
  event_name: string;
  risk_level: RiskLevel;
  source?: string | null;
  source_id?: string | null;
  source_url?: string | null;
  published_at?: string | null;
};

export type OutbreakHistoricalContext = {
  country?: string;
  cumulative_cases?: number | null;
  period_label?: string;
  scope?: string;
};

export type OutbreakGlobalStats = {
  disease: string;
  event_name?: string | null;

  tracked_countries?: number;

  total_confirmed: number;
  total_deaths: number;
  total_recovered: number;

  total_suspected?: number;
  total_probable?: number;
  total_possible?: number;
  total_under_investigation?: number;
  total_pending?: number;
  total_unconfirmed?: number;
  total_ruled_out?: number;
  total_negative?: number;
  total_identified_cases?: number;
  total_hospitalized?: number;

  affected_countries: number;
  global_risk_level: RiskLevel;
  last_updated: string;
  source_label: string;
  primary_event_url?: string | null;

  current_outbreak?: OutbreakCurrentEvent;
  historical_context?: OutbreakHistoricalContext | null;
  data_notes?: string[];
};

export type OutbreakCountry = {
  country: string;
  region?: string;

  is_country?: boolean;

  confirmed: number;
  suspected?: number;
  probable?: number;
  possible?: number;
  under_investigation?: number;
  pending?: number;
  unconfirmed?: number;
  total_identified?: number;
  ruled_out?: number;
  negative?: number;

  deaths: number;
  recovered?: number;
  hospitalized?: number;
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

  region?: string;
  is_country?: boolean;

  confirmed: number;
  suspected?: number;
  probable?: number;
  possible?: number;
  under_investigation?: number;
  pending?: number;
  unconfirmed?: number;
  total_identified?: number;

  deaths: number;
  lat: number;
  lng: number;

  source: string;
  source_url?: string | null;
  risk_level: RiskLevel;
};

export type OutbreakTimelineItem = {
  date: string;

  confirmed: number;
  suspected?: number;
  probable?: number;
  possible?: number;
  under_investigation?: number;
  pending?: number;
  unconfirmed?: number;
  total_identified?: number;

  deaths: number;
  recovered?: number;

  source?: string | null;
  source_id?: string | null;
  source_url?: string | null;
};

export type OutbreakSourceStatus = {
  ok: number;
  failed: number;
  last_status_code?: number | null;
  last_error?: string | null;
};

export type OutbreakSource = {
  id: string;
  name: string;
  url: string;
  type: OutbreakSourceType;
  last_checked_at: string;
  confidence: OutbreakSourceConfidence;
  usage?: string;
  status?: OutbreakSourceStatus;
};

export type OutbreakOfficialEvent = {
  source: string;
  source_id: string;
  type: 'current_outbreak' | 'historical_context' | string;
  title: string;
  summary: string;
  url: string;
  published_at?: string;
  metrics?: OutbreakMetrics;
  countries?: Array<{
    country: string;
    region?: string;
    lat: number;
    lng: number;
  }>;
  risk_level?: RiskLevel;
  raw_hash?: string;
  tracking_scope?: {
    confirmed?: boolean;
    suspected?: boolean;
    probable?: boolean;
    possible?: boolean;
    under_investigation?: boolean;
    pending?: boolean;
    ruled_out?: boolean;
    negative?: boolean;
  };
  data_correction?: {
    applied: boolean;
    reason: string;
    confirmed_cases?: number;
    suspected_cases?: number;
    total_identified_cases?: number;
    deaths?: number;
  };
  [key: string]: unknown;
};

export type OutbreakFetchLogItem = {
  ok: boolean;
  source_id: string;
  url: string;
  status_code?: number | null;
  error?: string | null;
};

export type OutbreakDashboardData = {
  global: OutbreakGlobalStats;
  countries: OutbreakCountry[];
  points: OutbreakPoint[];
  timeline: OutbreakTimelineItem[];
  sources: OutbreakSource[];
  officialEvents?: OutbreakOfficialEvent[];
  historicalContext?: unknown;
  fetchLog?: OutbreakFetchLogItem[];
};