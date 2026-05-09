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

const DarkOutbreakMap = dynamic<{ points: OutbreakPoint[] }>(
  () =>
    import('@/components/dashboard/DarkOutbreakMap').then(
      (mod) => mod.DarkOutbreakMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#000] text-gray-500">
        Loading map...
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

  const loadData = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
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

      setData({
        global,
        countries,
        points,
        timeline,
        sources,
      });

      setLastClientRefresh(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load outbreak data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

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
      <main className="flex min-h-dvh items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#333] border-t-red-500" />
          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-gray-500">
            {t('loading.dashboard')}
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-bold text-red-400">{t('error.title')}</h1>

          <p className="mt-2 text-sm text-red-200/70">
            {error ?? t('error.message')}
          </p>

          <button
            type="button"
            onClick={() => void loadData('initial')}
            className="mt-5 rounded border border-[#333] bg-[#111] px-4 py-2 text-sm font-bold text-white hover:bg-[#222]"
          >
            {t('error.retry')}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main dir="ltr" className="min-h-dvh bg-[#000] pb-16 text-white">
      <OutbreakStructuredData global={data.global} />

      <div className="grid min-h-dvh grid-cols-1 bg-black lg:grid-cols-[340px_minmax(0,1fr)]">
        <StatsSidebar
          global={data.global}
          countries={data.countries}
          dir={isRtl ? 'rtl' : 'ltr'}
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

        <section className="grid min-h-0 bg-[#000] lg:grid-rows-[auto_auto_minmax(560px,1fr)_320px]">
          <header className="grid min-w-0 gap-3 border-b border-[#222] bg-[#0a0a0a] px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green-500" />
                <span className="truncate">{t('sources.verified')}</span>
              </div>

              <div className="mt-1 truncate text-sm font-bold text-gray-300">
                {topSource ? topSource.name : 'Official health agencies'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2" dir="ltr">
              <LanguageSwitcher
                locale={locale}
                locales={locales}
                label={t('language.label')}
                onChange={setLocale}
              />

              <button
                type="button"
                onClick={() => void loadData('refresh')}
                className="inline-flex h-9 items-center gap-2 rounded border border-[#333] bg-[#1a1a1a] px-3 text-xs font-bold uppercase tracking-wider text-gray-400 hover:bg-[#2a2a2a] hover:text-white transition-colors"
              >
                <RefreshCw
                  className={
                    isRefreshing
                      ? 'h-3.5 w-3.5 animate-spin'
                      : 'h-3.5 w-3.5'
                  }
                />
                {t('actions.refresh')}
              </button>
            </div>
          </header>

        <OutbreakLiveCounter
          global={data.global}
          timeline={data.timeline}
          dir={isRtl ? 'rtl' : 'ltr'}
          isArabic={isRtl}
        />

        <div className="h-[560px] min-h-0 border-b border-[#222] bg-[#000] sm:h-[640px] lg:h-full lg:min-h-[560px]">
          <DarkOutbreakMap points={data.points} />
        </div>

          <div className="grid min-h-0 min-w-0 gap-px border-t border-[#222] bg-[#222] lg:grid-cols-[minmax(0,1fr)_300px]">
            <TimelineChart
              data={data.timeline}
              labels={{
                title: t('chart.title'),
                subtitle: t('chart.subtitle'),
                confirmed: t('chart.confirmed'),
                deaths: t('chart.deaths'),
              }}
            />

            <aside className="bg-[#000] p-4 flex flex-col justify-center">
              <div
                className="rounded border border-[#333] bg-[#0a0a0a] p-4 w-full"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {t('status.title')}
                </div>

                <div className="mt-4 space-y-4 text-xs font-bold text-gray-400">
                  <div className="flex justify-between gap-3">
                    <span>{t('status.officialUpdate')}</span>
                    <span dir="ltr" className="text-gray-200">
                      {formatDateTime(data.global.last_updated)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>{t('status.browserRefresh')}</span>
                    <span dir="ltr" className="text-gray-200">
                      {formatDateTime(lastClientRefresh)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>{t('status.mode')}</span>
                    <span className="text-green-500">{t('status.staticJson')}</span>
                  </div>
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