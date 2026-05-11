'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, MapPin, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/i18n/useI18n';
import { loadCountries, loadPoints } from '@/lib/data';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { OutbreakCountry, OutbreakPoint } from '@/types/outbreak';

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function decodeCountrySlug(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export default function HantavirusCountryPage() {
  const params = useParams();
  const { locale } = useI18n();
  const isArabic = locale === 'ar';

  const countrySlug = decodeCountrySlug(params?.country);

  const [countries, setCountries] = useState<OutbreakCountry[]>([]);
  const [points, setPoints] = useState<OutbreakPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPageData() {
      try {
        const [countriesData, pointsData] = await Promise.all([
          loadCountries(),
          loadPoints(),
        ]);

        if (!mounted) {
          return;
        }

        setCountries(countriesData);
        setPoints(pointsData);
      } catch {
        if (!mounted) {
          return;
        }

        setCountries([]);
        setPoints([]);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPageData();

    return () => {
      mounted = false;
    };
  }, []);

  const country = useMemo(() => {
    return (
      countries.find((item) => normalizeSlug(item.country) === countrySlug) ??
      null
    );
  }, [countries, countrySlug]);

  const countryPoints = useMemo(() => {
    if (!country) {
      return [];
    }

    return points.filter(
      (point) => normalizeSlug(point.country) === normalizeSlug(country.country),
    );
  }, [country, points]);

  const totalIdentified =
    country?.total_identified && country.total_identified > 0
      ? country.total_identified
      : (country?.confirmed ?? 0) + (country?.suspected ?? 0);

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#333] border-t-red-500" />
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            Loading location data
          </p>
        </div>
      </main>
    );
  }

  if (!country) {
    return (
      <main
        dir={isArabic ? 'rtl' : 'ltr'}
        className="min-h-dvh bg-black px-4 py-8 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isArabic ? 'العودة إلى اللوحة' : 'Back to dashboard'}
          </Link>

          <section className="mt-6 border border-red-500/25 bg-red-500/10 p-6">
            <h1 className="text-2xl font-black tracking-[-0.04em] text-red-200">
              {isArabic ? 'الموقع غير موجود' : 'Location not found'}
            </h1>

            <p className="mt-3 text-sm leading-7 text-red-100/70">
              {isArabic
                ? 'لا توجد بيانات حالية لهذا الرابط داخل ملفات التتبع.'
                : 'No current outbreak data was found for this location slug.'}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-dvh bg-black px-4 py-8 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {isArabic ? 'العودة إلى اللوحة' : 'Back to dashboard'}
        </Link>

        <section className="mt-6 overflow-hidden border border-white/10 bg-[#050505]">
          <div className="relative p-5 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_36%)]" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
                <MapPin className="h-3.5 w-3.5" />
                {isArabic ? 'صفحة موقع التفشي' : 'Outbreak location page'}
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white sm:text-6xl">
                {country.country}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-8 text-white/58 sm:text-base">
                {isArabic
                  ? 'ملخص مباشر للحالات المرصودة في هذا الموقع اعتمادًا على ملفات JSON المحدثة من مصادر صحية عامة.'
                  : 'A focused summary for this tracked location based on the latest static JSON data generated from public-health sources.'}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                  {country.region || 'Global'}
                </span>

                <span className="border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-red-200">
                  {country.risk_level}
                </span>

                <span className="border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                  {country.is_country ? 'Country' : 'Special location'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#252525] bg-[#0b0b0b] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
              {isArabic ? 'المؤكدة' : 'Confirmed'}
            </p>
            <div dir="ltr" className="mt-2 font-mono text-4xl font-black text-red-500">
              {formatNumber(country.confirmed)}
            </div>
          </div>

          <div className="border border-[#252525] bg-[#0b0b0b] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
              {isArabic ? 'المشتبه بها' : 'Suspected'}
            </p>
            <div dir="ltr" className="mt-2 font-mono text-4xl font-black text-amber-400">
              {formatNumber(country.suspected ?? 0)}
            </div>
          </div>

          <div className="border border-[#252525] bg-[#0b0b0b] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
              {isArabic ? 'إجمالي المرصودة' : 'Total identified'}
            </p>
            <div dir="ltr" className="mt-2 font-mono text-4xl font-black text-white">
              {formatNumber(totalIdentified)}
            </div>
          </div>

          <div className="border border-[#252525] bg-[#0b0b0b] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">
              {isArabic ? 'الوفيات' : 'Deaths'}
            </p>
            <div dir="ltr" className="mt-2 font-mono text-4xl font-black text-white">
              {formatNumber(country.deaths)}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="border border-white/10 bg-[#050505] p-5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isArabic ? 'تفاصيل البيانات' : 'Data details'}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-white/62">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <span>{isArabic ? 'آخر تحديث' : 'Last updated'}</span>
                <span dir="ltr" className="font-bold text-white">
                  {formatDateTime(country.last_updated)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <span>{isArabic ? 'خط العرض' : 'Latitude'}</span>
                <span dir="ltr" className="font-mono font-bold text-white">
                  {country.lat}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <span>{isArabic ? 'خط الطول' : 'Longitude'}</span>
                <span dir="ltr" className="font-mono font-bold text-white">
                  {country.lng}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span>{isArabic ? 'الحالات النشطة التقديرية' : 'Estimated active'}</span>
                <span dir="ltr" className="font-mono font-bold text-white">
                  {formatNumber(country.active ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <aside className="border border-white/10 bg-[#050505] p-5">
            <h2 className="text-base font-black text-white">
              {isArabic ? 'روابط المصادر' : 'Source links'}
            </h2>

            <div className="mt-4 grid gap-3">
              {countryPoints.length === 0 ? (
                <p className="text-sm leading-7 text-white/45">
                  {isArabic
                    ? 'لا توجد مصادر مرتبطة بهذه النقطة حاليًا.'
                    : 'No source links are attached to this point yet.'}
                </p>
              ) : (
                countryPoints.map((point) => (
                  <div
                    key={point.id}
                    className="border border-white/10 bg-white/[0.025] p-4"
                  >
                    <p className="text-sm font-bold leading-6 text-white">
                      {point.name}
                    </p>

                    <p className="mt-2 text-xs leading-6 text-white/45">
                      {point.source}
                    </p>

                    {point.source_url ? (
                      <a
                        href={point.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/50 transition hover:border-white/20 hover:text-white"
                      >
                        {isArabic ? 'فتح المصدر' : 'Open source'}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}