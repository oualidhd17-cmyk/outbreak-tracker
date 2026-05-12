'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

import { LanguageSwitcher } from '@/components/dashboard/LanguageSwitcher';
import { StatsSidebar } from '@/components/dashboard/StatsSidebar';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
import { OutbreakStructuredData } from '@/components/seo/OutbreakStructuredData';
import { DashboardInfoLinks } from '@/components/trust/DashboardInfoLinks';
import { useI18n } from '@/i18n/useI18n';
import {
  loadCountries,
  loadGlobalStats,
  loadPoints,
  loadSources,
  loadTimeline,
} from '@/lib/data';
import { formatDateTime } from '@/lib/format';
import type {
  OutbreakDashboardData,
  OutbreakPoint,
  OutbreakSource,
} from '@/types/outbreak';
import { OutbreakLiveCounter } from './OutbreakLiveCounter';

const DarkOutbreakMap = dynamic<{
  points: OutbreakPoint[];
  selectedCountry?: string | null;
  onSelectCountry?: (country: string) => void;
}>(
  () =>
    import('@/components/dashboard/DarkOutbreakMap').then(
      (mod) => mod.DarkOutbreakMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#030303] text-gray-500">
        <div className="animate-pulse">Loading map...</div>
      </div>
    ),
  },
);

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function getTopSource(sources: OutbreakSource[]): OutbreakSource | null {
  if (sources.length === 0) {
    return null;
  }
  return sources.find((source) => source.confidence === 'high') ?? sources[0];
}

export function OutbreakDashboard() {
  const { locale, locales, setLocale, t } = useI18n();
  const isRtl = locale === 'ar';

  const [data, setData] = useState<OutbreakDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastClientRefresh, setLastClientRefresh] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const loadData = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      try {
        if (mode === 'initial') {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        setError(null);

        const [global, countries, points, timeline, sources] = await Promise.all([
          loadGlobalStats(),
          loadCountries(),
          loadPoints(),
          loadTimeline(),
          loadSources(),
        ]);

        setData({ global, countries, points, timeline, sources });
        setLastClientRefresh(new Date().toISOString());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load outbreak data');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData('initial');
    }, 0);

    const timer = window.setInterval(() => {
      void loadData('refresh');
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(timer);
    };
  }, [loadData]);

  const topSource = data ? getTopSource(data.sources) : null;

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#030303] text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-gray-400">
            {t('loading.dashboard')}
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#030303] px-6 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center backdrop-blur-md">
          <h1 className="text-2xl font-bold text-red-400">{t('error.title')}</h1>
          <p className="mt-3 text-sm leading-relaxed text-red-200/70">
            {error ?? t('error.message')}
          </p>
          <button
            type="button"
            onClick={() => void loadData('initial')}
            className="mt-6 inline-flex rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            {t('error.retry')}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main dir="ltr" className="min-h-dvh bg-[#030303] pb-16 text-white selection:bg-red-500/30">
      <OutbreakStructuredData global={data.global} />

      <div className="flex flex-col lg:flex-row min-h-dvh items-stretch bg-[#030303]">
        <StatsSidebar
          global={data.global}
          countries={data.countries}
          dir={isRtl ? 'rtl' : 'ltr'}
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
          labels={{
            appTitle: t('app.title'),
            appSubtitle: t('app.subtitle'),
            totalConfirmed: t('stats.totalConfirmed'),
            deaths: t('stats.deaths'),
            countries: t('stats.countries'),
            lastUpdate: t('stats.lastUpdate'),
            confirmedByCountry: t('stats.confirmedByCountry'),
            sidebarAd: t('ads.sidebar'),
          }}
        />

        <section className="flex-1 flex flex-col min-w-0 bg-[#050505]">
          <header className="sticky top-0 z-[800] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 bg-[#030303]/80 px-5 py-4 backdrop-blur-xl">
            <div className="min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="truncate">{t('sources.verified')}</span>
              </div>
              <div className="mt-1.5 truncate text-sm font-bold text-gray-200">
                {topSource ? topSource.name : 'Official health agencies'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3" dir="ltr">
              <LanguageSwitcher
                locale={locale}
                locales={locales}
                label={t('language.label')}
                onChange={setLocale}
              />

              <button
                type="button"
                onClick={() => void loadData('refresh')}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-bold uppercase tracking-wider text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className={isRefreshing ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
                {t('actions.refresh')}
              </button>

              {selectedCountry ? (
                <button
                  type="button"
                  onClick={() => setSelectedCountry(null)}
                  className="inline-flex h-9 items-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-4 text-xs font-bold uppercase tracking-wider text-yellow-300 transition hover:bg-yellow-400/20"
                >
                  Clear focus
                </button>
              ) : null}
            </div>
          </header>

          <OutbreakLiveCounter
            global={data.global}
            timeline={data.timeline}
            dir={isRtl ? 'rtl' : 'ltr'}
            isArabic={isRtl}
          />

          <div className="relative h-[55vh] min-h-[450px] lg:h-[60vh] border-b border-white/5 bg-[#080808]">
            <DarkOutbreakMap
              points={data.points}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6 p-4 sm:p-6 bg-[#030303]">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm shadow-xl">
              <TimelineChart
                data={data.timeline}
                labels={{
                  title: t('chart.title'),
                  subtitle: t('chart.subtitle'),
                  confirmed: t('chart.confirmed'),
                  deaths: t('chart.deaths'),
                }}
              />
            </div>

            <aside className="flex flex-col gap-4">
              <div
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm shadow-xl"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  {t('status.title')}
                </div>

                <div className="mt-5 space-y-4 text-xs font-medium text-gray-400">
                  <div className="flex justify-between items-center gap-3">
                    <span>{t('status.officialUpdate')}</span>
                    <span dir="ltr" className="text-gray-200 font-bold bg-white/5 px-2 py-1 rounded">
                      {formatDateTime(data.global.last_updated)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <span>{t('status.browserRefresh')}</span>
                    <span dir="ltr" className="text-gray-200 font-bold bg-white/5 px-2 py-1 rounded">
                      {formatDateTime(lastClientRefresh)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <span>{t('status.mode')}</span>
                    <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">
                      {t('status.staticJson')}
                    </span>
                  </div>

                  {selectedCountry ? (
                    <div className="flex justify-between items-center gap-3 border-t border-white/5 pt-4 mt-2">
                      <span>{isRtl ? 'النقطة المحددة' : 'Focused location'}</span>
                      <span className="text-yellow-300 font-bold">{selectedCountry}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>

      <DashboardInfoLinks />
    </main>
  );
}