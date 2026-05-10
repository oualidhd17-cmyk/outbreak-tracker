'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Clock3, Globe2, Skull } from 'lucide-react';

import { formatNumber } from '@/lib/format';
import type { OutbreakGlobalStats, OutbreakTimelineItem } from '@/types/outbreak';

type OutbreakLiveCounterProps = {
  global: OutbreakGlobalStats;
  timeline: OutbreakTimelineItem[];
  dir?: 'ltr' | 'rtl';
  isArabic?: boolean;
};

type DurationParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getFirstValidTimelineDate(timeline: OutbreakTimelineItem[]): Date | null {
  const timestamps = timeline
    .map((item) => new Date(item.date).getTime())
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (timestamps.length === 0) {
    return null;
  }

  return new Date(timestamps[0]);
}

function getDurationParts(fromDate: Date, now: Date): DurationParts {
  const diff = Math.max(0, now.getTime() - fromDate.getTime());

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function OutbreakLiveCounter({
  global,
  timeline,
  dir = 'ltr',
  isArabic = false,
}: OutbreakLiveCounterProps) {
  const [now, setNow] = useState(() => new Date());

  const startedAt = useMemo(() => {
    return getFirstValidTimelineDate(timeline) ?? new Date(global.last_updated);
  }, [global.last_updated, timeline]);

  const duration = useMemo(() => {
    return getDurationParts(startedAt, now);
  }, [now, startedAt]);

  const totalCases =
    global.total_identified_cases && global.total_identified_cases > 0
      ? global.total_identified_cases
      : global.total_confirmed;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const labels = {
    badge: isArabic ? 'عداد التفشي المباشر' : 'Live outbreak counter',
    title: isArabic ? 'منذ أول إشارة مرصودة' : 'Since first tracked signal',
    days: isArabic ? 'يوم' : 'Days',
    hours: isArabic ? 'ساعة' : 'Hours',
    minutes: isArabic ? 'دقيقة' : 'Minutes',
    seconds: isArabic ? 'ثانية' : 'Seconds',
    cases: isArabic ? 'إجمالي الحالات' : 'Total cases',
    deaths: isArabic ? 'الوفيات' : 'Deaths',
    countries: isArabic ? 'الدول المتأثرة' : 'Affected countries',
    started: isArabic ? 'بداية الرصد' : 'Tracking started',
  };

  return (
    <section
      dir={dir}
      className="border-b border-[#222] bg-[#050505] px-4 py-4 text-white"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">
            <Clock3 className="h-3.5 w-3.5" />
            {labels.badge}
          </div>

          <h2 className="mt-3 text-xl font-black tracking-[-0.05em] text-white sm:text-2xl">
            {labels.title}
          </h2>

          <p className="mt-1 text-xs font-semibold text-gray-500" dir="ltr">
            {labels.started}:{' '}
            {startedAt.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            })}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3" dir="ltr">
          <div className="rounded-xl border border-[#252525] bg-[#0b0b0b] px-3 py-3 text-center shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
            <div className="font-mono text-2xl font-black text-white sm:text-3xl">
              {formatNumber(duration.days)}
            </div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">
              {labels.days}
            </div>
          </div>

          <div className="rounded-xl border border-[#252525] bg-[#0b0b0b] px-3 py-3 text-center shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
            <div className="font-mono text-2xl font-black text-white sm:text-3xl">
              {pad(duration.hours)}
            </div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">
              {labels.hours}
            </div>
          </div>

          <div className="rounded-xl border border-[#252525] bg-[#0b0b0b] px-3 py-3 text-center shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
            <div className="font-mono text-2xl font-black text-white sm:text-3xl">
              {pad(duration.minutes)}
            </div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-gray-500">
              {labels.minutes}
            </div>
          </div>

          <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-3 text-center shadow-[0_14px_40px_rgba(239,68,68,0.10)]">
            <div className="font-mono text-2xl font-black text-red-400 sm:text-3xl">
              {pad(duration.seconds)}
            </div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-red-300/70">
              {labels.seconds}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3" dir={dir}>
        <div className="rounded-xl border border-[#252525] bg-[#0b0b0b] p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            <Activity className="h-3.5 w-3.5 text-red-500" />
            {labels.cases}
          </div>

          <div dir="ltr" className="mt-2 font-mono text-3xl font-black text-red-500">
            {formatNumber(totalCases)}
          </div>
        </div>

        <div className="rounded-xl border border-[#252525] bg-[#0b0b0b] p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            <Skull className="h-3.5 w-3.5 text-gray-300" />
            {labels.deaths}
          </div>

          <div dir="ltr" className="mt-2 font-mono text-3xl font-black text-white">
            {formatNumber(global.total_deaths)}
          </div>
        </div>

        <div className="rounded-xl border border-[#252525] bg-[#0b0b0b] p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
            <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
            {labels.countries}
          </div>

          <div dir="ltr" className="mt-2 font-mono text-3xl font-black text-emerald-400">
            {formatNumber(global.affected_countries)}
          </div>
        </div>
      </div>
    </section>
  );
}