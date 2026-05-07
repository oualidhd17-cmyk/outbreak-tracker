'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatNumber } from '@/lib/format';
import type { OutbreakTimelineItem } from '@/types/outbreak';

type TimelineChartLabels = {
  title: string;
  subtitle: string;
  confirmed: string;
  deaths: string;
};

type TimelineChartProps = {
  data: OutbreakTimelineItem[];
  labels: TimelineChartLabels;
};

export function TimelineChart({ data, labels }: TimelineChartProps) {
  return (
    <div className="flex h-[320px] min-h-[320px] w-full min-w-0 flex-col bg-[#171717] px-4 py-3 text-white sm:h-[340px] lg:h-full lg:min-h-0">
      <div className="mb-2 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
            {labels.title}
          </div>

          <h2 className="mt-1 truncate text-sm font-semibold text-white/90">
            {labels.subtitle}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            {labels.confirmed}
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            {labels.deaths}
          </div>
        </div>
      </div>

      <div className="relative min-h-0 min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              minTickGap={18}
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
            />

            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.12)' }}
              tickFormatter={(value) => formatNumber(Number(value))}
              width={50}
            />

            <Tooltip
              contentStyle={{
                background: '#0b0b0b',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 0,
                color: '#ffffff',
              }}
              labelStyle={{
                color: 'rgba(255,255,255,0.7)',
              }}
              formatter={(value, name) => [
                formatNumber(Number(value)),
                name === 'confirmed' ? labels.confirmed : labels.deaths,
              ]}
            />

            <Line
              type="monotone"
              dataKey="confirmed"
              stroke="#facc15"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 0, fill: '#facc15' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#facc15' }}
            />

            <Line
              type="monotone"
              dataKey="deaths"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: '#ef4444' }}
              activeDot={{ r: 5, strokeWidth: 0, fill: '#ef4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}