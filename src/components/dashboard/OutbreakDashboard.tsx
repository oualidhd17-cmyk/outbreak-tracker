'use client';


import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

import { AdSlot } from '@/components/dashboard/AdSlot';
import { LanguageSwitcher } from '@/components/dashboard/LanguageSwitcher';
import { StatsSidebar } from '@/components/dashboard/StatsSidebar';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
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

const DarkOutbreakMap = dynamic<{ points: OutbreakPoint[] }>(
  () =>
    import('@/components/dashboard/DarkOutbreakMap').then(
      (mod) => mod.DarkOutbreakMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#05080b] text-white/50">
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
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
          <p className="mt-4 text-sm uppercase tracking-[0.24em] text-white/45">
            {t('loading.dashboard')}
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-200">{t('error.title')}</h1>

          <p className="mt-2 text-sm text-red-100/70">
            {error ?? t('error.message')}
          </p>

          <button
            type="button"
            onClick={() => void loadData('initial')}
            className="mt-5 border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            {t('error.retry')}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main dir="ltr" className="h-dvh overflow-hidden bg-black text-white">
      <div className="grid h-full grid-cols-[330px_minmax(0,1fr)] bg-black">
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

        <section className="grid min-h-0 grid-rows-[82px_minmax(0,1fr)_286px] bg-black">
          <header className="grid min-h-0 grid-cols-[minmax(0,1fr)_480px] gap-px border-b border-black bg-black">
            <div className="flex min-w-0 items-center bg-[#101010] px-4 py-2">
              <AdSlot id="top-map-ad" variant="top" label={t('ads.topBanner')} />
            </div>

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-[#151515] px-4 py-2">
              <div className="min-w-0" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">{t('sources.verified')}</span>
                </div>

                <div className="mt-1 truncate text-sm text-white/72">
                  {topSource ? topSource.name : 'Official health agencies'}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2" dir="ltr">
                <LanguageSwitcher
                  locale={locale}
                  locales={locales}
                  label={t('language.label')}
                  onChange={setLocale}
                />

                <button
                  type="button"
                  onClick={() => void loadData('refresh')}
                  className="inline-flex h-10 items-center gap-2 border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/65 hover:bg-white/[0.08]"
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
            </div>
          </header>

          <div className="min-h-0 border-b border-black">
            <DarkOutbreakMap points={data.points} />
          </div>

          <div className="grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)_360px] gap-px border-t border-black bg-black">
            <TimelineChart
              data={data.timeline}
              labels={{
                title: t('chart.title'),
                subtitle: t('chart.subtitle'),
                confirmed: t('chart.confirmed'),
                deaths: t('chart.deaths'),
              }}
            />

            <aside className="grid min-h-0 grid-rows-[112px_minmax(0,1fr)] gap-3 bg-[#111111] p-3">
              <div
                className="min-h-0 border border-white/10 bg-white/[0.03] p-3"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                  {t('status.title')}
                </div>

                <div className="mt-2 space-y-2 text-xs text-white/60">
                  <div className="flex justify-between gap-3">
                    <span>{t('status.officialUpdate')}</span>
                    <span dir="ltr" className="text-end text-white/80">
                      {formatDateTime(data.global.last_updated)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>{t('status.browserRefresh')}</span>
                    <span dir="ltr" className="text-end text-white/80">
                      {formatDateTime(lastClientRefresh)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>{t('status.mode')}</span>
                    <span className="text-emerald-300">{t('status.staticJson')}</span>
                  </div>
                </div>
              </div>

              <AdSlot id="bottom-side-ad" variant="side" label={t('ads.chartSide')} />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}