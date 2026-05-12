import { AlertTriangle, Clock3, Globe2, Skull } from 'lucide-react';

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
  selectedCountry?: string | null;
  onSelectCountry?: (country: string) => void;
};

function normalizeCountry(value: string): string {
  return value.trim().toLowerCase();
}

export function StatsSidebar({
  global,
  countries,
  labels,
  dir = 'ltr',
  selectedCountry,
  onSelectCountry,
}: StatsSidebarProps) {
  const isRtl = dir === 'rtl';

  const sortedCountries = [...countries]
    .filter((country) => {
      return (
        country.confirmed > 0 ||
        (country.suspected ?? 0) > 0 ||
        country.deaths > 0 ||
        (country.total_identified ?? 0) > 0
      );
    })
    .sort((a, b) => {
      const totalA = a.total_identified ?? a.confirmed + (a.suspected ?? 0);
      const totalB = b.total_identified ?? b.confirmed + (b.suspected ?? 0);
      return totalB - totalA;
    });

  const totalCases =
    global.total_identified_cases && global.total_identified_cases > 0
      ? global.total_identified_cases
      : global.total_confirmed;

  return (
    <aside
      dir={dir}
      className="
        relative z-[900]
        flex w-full lg:w-[340px] xl:w-[380px] flex-col
        border-b lg:border-b-0 lg:border-r border-white/5 bg-[#030303]/95 backdrop-blur-2xl
        h-auto lg:h-dvh lg:max-h-dvh lg:overflow-hidden
      "
    >
      {/* App Header */}
      <div className="shrink-0 border-b border-white/5 p-5 lg:p-6 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
          {labels.appTitle}
        </div>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-tight bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent sm:text-3xl">
          HANTAVIRUS
        </h1>
        <p className="mt-2.5 text-xs leading-relaxed text-gray-400 opacity-90">
          {labels.appSubtitle}
        </p>
      </div>

      {/* Main Stats */}
      <div className="shrink-0 border-b border-white/5 p-5 lg:p-6 bg-white/[0.01]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-gray-500">
              {labels.totalConfirmed}
            </div>
            <div
              dir="ltr"
              className="mt-1.5 font-mono text-5xl font-black leading-none tracking-tight text-white drop-shadow-[0_0_12px_rgba(239,68,68,0.4)] sm:text-6xl"
            >
              {formatNumber(totalCases)}
            </div>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            {global.global_risk_level}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Skull className="h-4 w-4 text-gray-300" />
              <span className="truncate">{labels.deaths}</span>
            </div>
            <div dir="ltr" className="mt-2 font-mono text-2xl font-black text-white">
              {formatNumber(global.total_deaths)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Globe2 className="h-4 w-4 text-emerald-400" />
              <span className="truncate">{labels.countries}</span>
            </div>
            <div dir="ltr" className="mt-2 font-mono text-2xl font-black text-white">
              {formatNumber(global.affected_countries)}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-500 bg-white/5 p-3 rounded-xl border border-white/5">
          <Clock3 className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="font-bold uppercase tracking-wider">{labels.lastUpdate}:</span>
          <span className="font-bold text-gray-200" dir="ltr">
            {formatDateTime(global.last_updated)}
          </span>
        </div>
      </div>

      {/* List Header - يظهر في الكمبيوتر فقط (مخفي في الجوال) */}
      <div className="hidden lg:flex sticky top-0 z-10 shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-[#030303]/90 px-5 py-3.5 backdrop-blur-md">
        <div className="min-w-0 text-[11px] font-black uppercase tracking-widest text-gray-400">
          {labels.confirmedByCountry}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-400">
          <AlertTriangle className="h-3 w-3" />
          {global.global_risk_level}
        </div>
      </div>

      {/* Countries List - يظهر في الكمبيوتر فقط (مخفي في الجوال) */}
      <div className="hidden lg:block min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        {sortedCountries.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">
            No affected locations available.
          </div>
        ) : (
          sortedCountries.map((country) => {
            const isSelected =
              selectedCountry !== null &&
              selectedCountry !== undefined &&
              normalizeCountry(selectedCountry) === normalizeCountry(country.country);

            const total =
              country.total_identified && country.total_identified > 0
                ? country.total_identified
                : country.confirmed + (country.suspected ?? 0);

            return (
              <button
                key={country.country}
                type="button"
                onClick={() => onSelectCountry?.(country.country)}
                className={`
                  group grid w-full grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-4 border-b border-white/5 px-5 py-3.5 text-left transition-all
                  ${isSelected ? 'bg-yellow-400/10 shadow-[inset_4px_0_0_rgba(250,204,21,1)]' : 'hover:bg-white/5'}
                `}
                dir="ltr"
              >
                <div className={`font-mono text-base font-black ${isSelected ? 'text-yellow-400' : 'text-red-400'}`}>
                  {formatNumber(total)}
                </div>
                <div className={`min-w-0 truncate text-xs font-bold uppercase transition-colors ${isSelected ? 'text-yellow-100' : 'text-gray-300 group-hover:text-white'}`}>
                  {country.country}
                </div>
                <div className={`text-[10px] font-black uppercase tracking-wider transition-colors px-2 py-1 rounded border ${isSelected ? 'border-yellow-400/30 text-yellow-300 bg-yellow-400/10' : 'border-white/10 text-gray-500 group-hover:text-gray-300 group-hover:border-white/20'}`}>
                  {isRtl ? 'تحديد' : 'Focus'}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}