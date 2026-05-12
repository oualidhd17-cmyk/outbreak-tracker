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
  return timestamps.length > 0 ? new Date(timestamps[0]) : null;
}

function getDurationParts(fromDate: Date, now: Date): DurationParts {
  const diff = Math.max(0, now.getTime() - fromDate.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
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

    return () => window.clearInterval(timer);
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
    <section dir={dir} className="border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent px-5 py-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <Clock3 className="h-3.5 w-3.5 animate-pulse" />
            {labels.badge}
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {labels.title}
          </h2>
          <p className="mt-2 text-xs font-medium text-gray-400" dir="ltr">
            {labels.started}:{' '}
            <span className="text-gray-300">
              {startedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              })}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4" dir="ltr">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-lg w-full min-w-[70px] sm:min-w-[90px]">
            <div className="font-mono text-2xl sm:text-4xl font-black text-white">{formatNumber(duration.days)}</div>
            <div className="mt-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">{labels.days}</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-lg w-full min-w-[70px] sm:min-w-[90px]">
            <div className="font-mono text-2xl sm:text-4xl font-black text-white">{pad(duration.hours)}</div>
            <div className="mt-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">{labels.hours}</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-lg w-full min-w-[70px] sm:min-w-[90px]">
            <div className="font-mono text-2xl sm:text-4xl font-black text-white">{pad(duration.minutes)}</div>
            <div className="mt-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">{labels.minutes}</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.15)] w-full min-w-[70px] sm:min-w-[90px]">
            <div className="font-mono text-2xl sm:text-4xl font-black text-red-400">{pad(duration.seconds)}</div>
            <div className="mt-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-red-300/80">{labels.seconds}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3" dir={dir}>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-transform hover:-translate-y-1 hover:bg-white/10">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <Activity className="h-4 w-4 text-red-500" />
            {labels.cases}
          </div>
          <div dir="ltr" className="mt-3 font-mono text-4xl font-black text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">
            {formatNumber(totalCases)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-transform hover:-translate-y-1 hover:bg-white/10">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <Skull className="h-4 w-4 text-gray-300" />
            {labels.deaths}
          </div>
          <div dir="ltr" className="mt-3 font-mono text-4xl font-black text-white">
            {formatNumber(global.total_deaths)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md transition-transform hover:-translate-y-1 hover:bg-white/10">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <Globe2 className="h-4 w-4 text-emerald-400" />
            {labels.countries}
          </div>
          <div dir="ltr" className="mt-3 font-mono text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
            {formatNumber(global.affected_countries)}
          </div>
        </div>
      </div>
    </section>
  );
}