import Link from 'next/link';
import { Activity, AlertTriangle, Clock3, Globe2, Skull } from 'lucide-react';

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

function slugifyCountry(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
      className="flex min-h-0 flex-col border-r border-[#222] bg-[#000000] text-gray-200 lg:h-full"
    >
      <div className="bg-[#111] px-5 py-5 border-b border-[#222]">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2">
          <Activity className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{labels.appTitle}</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide uppercase">
          {global.disease}
        </h1>
        <p className="mt-1 text-xs text-gray-400 leading-relaxed">{labels.appSubtitle}</p>
      </div>

      <div className="flex flex-col bg-[#000] px-5 py-6 border-b border-[#222]">
        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{labels.totalConfirmed}</div>
        <div
          dir="ltr"
          className="mt-2 font-mono text-5xl sm:text-6xl font-bold tracking-tight text-red-500"
        >
          {formatNumber(global.total_confirmed)}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded border border-[#222] bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <Skull className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{labels.deaths}</span>
            </div>
            <div dir="ltr" className="mt-2 font-mono text-2xl font-bold text-white">
              {formatNumber(global.total_deaths)}
            </div>
          </div>

          <div className="rounded border border-[#222] bg-[#0a0a0a] p-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <Globe2 className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{labels.countries}</span>
            </div>
            <div dir="ltr" className="mt-2 font-mono text-2xl font-bold text-white">
              {formatNumber(global.affected_countries)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          <Clock3 className="h-4 w-4" />
          <span className="font-bold uppercase tracking-wider">{labels.lastUpdate}:</span>
          <span className="text-gray-300 font-bold" dir="ltr">{formatDateTime(global.last_updated)}</span>
        </div>
      </div>

      <div className="bg-[#111] px-5 py-4 border-b border-[#222] flex justify-between items-center shrink-0">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-300">
          {labels.confirmedByCountry}
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400 border border-red-500/20">
          <AlertTriangle className="h-3 w-3" />
          {global.global_risk_level}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#000] pb-4">
        {sortedCountries.map((country) => {
          const countrySlug = slugifyCountry(country.country);

          return (
            <Link
              key={country.country}
              href={`/hantavirus/${countrySlug}`}
              className="group grid grid-cols-[80px_1fr_auto] items-center gap-3 border-b border-[#1a1a1a] px-5 py-3 hover:bg-[#111] transition-colors"
              dir="ltr"
            >
              <div className="font-mono text-base font-bold text-red-500">
                {formatNumber(country.confirmed)}
              </div>
              <div className="truncate text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                {country.country}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 group-hover:text-gray-400 transition-colors">
                View
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}