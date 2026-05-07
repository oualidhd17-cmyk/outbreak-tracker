import { Activity, AlertTriangle, Clock3, Globe2, Skull } from 'lucide-react';

import { AdSlot } from '@/components/dashboard/AdSlot';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { OutbreakCountry, OutbreakGlobalStats } from '@/types/outbreak';

type StatsSidebarLabels = {
  appTitle: string;
  appSubtitle: string;
  totalConfirmed: string;
  deaths: string;
  countries: string;
  lastUpdate: string;
  confirmedByCountry: string;
  sidebarAd: string;
};

type StatsSidebarProps = {
  global: OutbreakGlobalStats;
  countries: OutbreakCountry[];
  labels: StatsSidebarLabels;
  dir?: 'ltr' | 'rtl';
};

export function StatsSidebar({
  global,
  countries,
  labels,
  dir = 'ltr',
}: StatsSidebarProps) {
  const sortedCountries = [...countries].sort((a, b) => b.confirmed - a.confirmed);

  return (
    <aside
      dir={dir}
      className="flex h-full min-h-0 flex-col border-r border-black bg-[#111111] text-white"
    >
      <div className="border-b border-black bg-[#181818] px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
          <Activity className="h-3.5 w-3.5 shrink-0 text-red-500" />
          <span className="truncate">{labels.appTitle}</span>
        </div>

        <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white">
          {global.disease}
        </h1>

        <p className="mt-1 truncate text-xs text-white/45">{labels.appSubtitle}</p>
      </div>

      <div className="border-b border-black bg-[#0d0d0d] px-4 py-4">
        <div className="text-xs font-semibold text-white/55">{labels.totalConfirmed}</div>

        <div dir="ltr" className="mt-1 font-mono text-[64px] font-light leading-none tracking-[0.08em] text-white">
          {formatNumber(global.total_confirmed)}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2 text-[11px] text-white/45">
              <Skull className="h-3.5 w-3.5 shrink-0 text-red-500" />
              <span className="truncate">{labels.deaths}</span>
            </div>
            <div dir="ltr" className="mt-1 font-mono text-lg text-white">
              {formatNumber(global.total_deaths)}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2 text-[11px] text-white/45">
              <Globe2 className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
              <span className="truncate">{labels.countries}</span>
            </div>
            <div dir="ltr" className="mt-1 font-mono text-lg text-white">
              {formatNumber(global.affected_countries)}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-start gap-2 border border-white/10 bg-white/[0.03] p-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-white/35" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              {labels.lastUpdate}
            </div>
            <div dir="ltr" className="mt-1 truncate text-xs text-white/70">
              {formatDateTime(global.last_updated)}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-black bg-[#151515] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-sm font-semibold leading-5 text-white/85">
            {labels.confirmedByCountry}
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-300">
            <AlertTriangle className="h-3 w-3" />
            {global.global_risk_level}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#1a1a1a]">
        {sortedCountries.map((country) => (
          <div
            key={country.country}
            className="grid grid-cols-[76px_1fr] items-center border-b border-black/70 px-4 py-2.5 transition hover:bg-white/[0.04]"
            dir="ltr"
          >
            <div className="font-mono text-base text-white">
              {formatNumber(country.confirmed)}
            </div>

            <div className="truncate text-sm font-medium text-white/72">
              {country.country}
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-black bg-[#101010] p-3">
        <AdSlot id="left-sidebar-ad" variant="sidebar" label={labels.sidebarAd} />
      </div>
    </aside>
  );
}