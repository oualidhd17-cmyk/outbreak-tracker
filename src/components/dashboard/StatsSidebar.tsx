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
        sticky top-0 z-[900]
        flex max-h-[78dvh] min-h-0 flex-col overflow-hidden
        border-b border-[#222] bg-[#050505]
        lg:h-dvh lg:max-h-dvh lg:border-b-0 lg:border-r
      "
    >
      <div className="shrink-0 border-b border-[#222] bg-black px-4 py-4 sm:px-5 sm:py-5">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-500 sm:text-[10px]">
          {labels.appTitle}
        </div>

        <h1 className="mt-1 text-xl font-black uppercase tracking-[0.06em] text-white sm:text-2xl">
          HANTAVIRUS
        </h1>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500 lg:line-clamp-none">
          {labels.appSubtitle}
        </p>
      </div>

      <div className="shrink-0 border-b border-[#222] bg-black px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {labels.totalConfirmed}
            </div>

            <div
              dir="ltr"
              className="mt-1 font-mono text-5xl font-black leading-none tracking-tight text-red-500 sm:text-6xl"
            >
              {formatNumber(totalCases)}
            </div>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-300">
            {global.global_risk_level}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#222] bg-[#090909] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Skull className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{labels.deaths}</span>
            </div>

            <div
              dir="ltr"
              className="mt-2 font-mono text-2xl font-black text-white"
            >
              {formatNumber(global.total_deaths)}
            </div>
          </div>

          <div className="rounded-xl border border-[#222] bg-[#090909] p-3 sm:p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="truncate">{labels.countries}</span>
            </div>

            <div
              dir="ltr"
              className="mt-2 font-mono text-2xl font-black text-white"
            >
              {formatNumber(global.affected_countries)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Clock3 className="h-4 w-4 shrink-0" />

          <span className="font-black uppercase tracking-wider">
            {labels.lastUpdate}:
          </span>

          <span className="font-bold text-gray-300" dir="ltr">
            {formatDateTime(global.last_updated)}
          </span>
        </div>
      </div>

      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[#222] bg-[#080808] px-4 py-3 sm:px-5">
        <div className="min-w-0 text-xs font-black uppercase tracking-widest text-gray-300">
          {labels.confirmedByCountry}
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-400">
          <AlertTriangle className="h-3 w-3" />
          {global.global_risk_level}
        </div>
      </div>

      <div
        className="
          min-h-0 flex-1 overflow-y-auto overscroll-contain bg-black pb-4
          scrollbar-thin scrollbar-track-black scrollbar-thumb-[#333]
        "
      >
        {sortedCountries.length === 0 ? (
          <div className="px-5 py-6 text-sm text-gray-500">
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
                className={[
                  'group grid w-full grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-3 text-left transition sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:px-5',
                  isSelected
                    ? 'border-yellow-400/40 bg-yellow-400/10 shadow-[inset_4px_0_0_rgba(250,204,21,0.95)]'
                    : 'border-[#171717] hover:bg-[#101010]',
                ].join(' ')}
                dir="ltr"
              >
                <div
                  className={[
                    'font-mono text-sm font-black sm:text-base',
                    isSelected ? 'text-yellow-300' : 'text-red-500',
                  ].join(' ')}
                >
                  {formatNumber(total)}
                </div>

                <div
                  className={[
                    'min-w-0 truncate text-xs font-bold uppercase transition sm:text-sm',
                    isSelected
                      ? 'text-yellow-100'
                      : 'text-gray-300 group-hover:text-white',
                  ].join(' ')}
                >
                  {country.country}
                </div>

                <div
                  className={[
                    'text-[9px] font-black uppercase tracking-wider transition sm:text-[10px]',
                    isSelected
                      ? 'text-yellow-200'
                      : 'text-gray-600 group-hover:text-gray-300',
                  ].join(' ')}
                >
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