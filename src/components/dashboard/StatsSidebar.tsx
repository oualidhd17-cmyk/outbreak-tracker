import Link from 'next/link';
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
  const isRtl = dir === 'rtl';
  
  // التعديل هنا: تصفية الدول الصفرية قبل عملية الترتيب والعرض
  const sortedCountries = [...countries]
    .filter((c) => c.confirmed > 0 || (c.suspected ?? 0) > 0 || c.deaths > 0)
    .sort((a, b) => b.confirmed - a.confirmed);

  return (
    <aside className="flex flex-col border-r border-[#222] bg-[#050505]">
      <div className="border-b border-[#222] bg-black px-5 py-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">
          {labels.appTitle}
        </div>

        <h1 className="text-2xl font-black uppercase tracking-[0.06em] text-white">
          HANTAVIRUS
        </h1>

        <p className="mt-2 text-xs leading-6 text-gray-500">
          {labels.appSubtitle}
        </p>
      </div>

      <div className="border-b border-[#222] bg-black px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-gray-500">
              {labels.totalConfirmed}
            </div>

            <div
              dir="ltr"
              className="mt-2 font-mono text-6xl font-black leading-none tracking-tight text-red-500"
            >
              {formatNumber(global.total_confirmed)}
            </div>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-300">
            {global.global_risk_level}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#222] bg-[#090909] p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Skull className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{labels.deaths}</span>
            </div>

            <div dir="ltr" className="mt-2 font-mono text-2xl font-black text-white">
              {formatNumber(global.total_deaths)}
            </div>
          </div>

          <div className="rounded-xl border border-[#222] bg-[#090909] p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="truncate">{labels.countries}</span>
            </div>

            <div dir="ltr" className="mt-2 font-mono text-2xl font-black text-white">
              {formatNumber(global.affected_countries)}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Clock3 className="h-4 w-4 shrink-0" />
          <span className="font-black uppercase tracking-wider">
            {labels.lastUpdate}:
          </span>
          <span className="font-bold text-gray-300" dir="ltr">
            {formatDateTime(global.last_updated)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#222] bg-[#080808] px-5 py-4">
        <div className="min-w-0 text-xs font-black uppercase tracking-widest text-gray-300">
          {labels.confirmedByCountry}
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-400">
          <AlertTriangle className="h-3 w-3" />
          {global.global_risk_level}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-black pb-4">
        {sortedCountries.length === 0 ? (
          <div className="px-5 py-6 text-sm text-gray-500">
            No affected locations available.
          </div>
        ) : (
          sortedCountries.map((country) => {
            const countrySlug = slugifyCountry(country.country);

            return (
              <Link
                key={country.country}
                href={`/hantavirus/${countrySlug}`}
                className="group grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#171717] px-5 py-3 transition hover:bg-[#101010]"
                dir="ltr"
              >
                <div className="font-mono text-base font-black text-red-500">
                  {formatNumber(country.confirmed)}
                </div>

                <div className="truncate text-sm font-bold text-gray-300 transition group-hover:text-white">
                  {country.country}
                </div>

                <div className="text-[10px] font-black uppercase tracking-wider text-gray-600 transition group-hover:text-gray-300">
                  {isRtl ? 'فتح' : 'View'}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}