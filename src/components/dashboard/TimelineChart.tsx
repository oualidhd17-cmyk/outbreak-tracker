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
    <div className="flex h-[320px] min-h-[320px] w-full min-w-0 flex-col bg-transparent text-white sm:h-[340px] lg:h-full lg:min-h-[300px]">
      <div className="mb-6 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {labels.title}
          </div>
          <h2 className="mt-1.5 truncate text-sm font-bold text-gray-200">
            {labels.subtitle}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            {labels.confirmed}
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            {labels.deaths}
          </div>
        </div>
      </div>

      <div className="relative flex-1 w-full min-h-[200px]">
        <div className="absolute inset-0">

        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="date"
              minTickGap={20}
              tick={{ fill: '#888', fontSize: 10, fontWeight: 600 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: '#888', fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatNumber(Number(value))}
              width={45}
            />

            <Tooltip
              contentStyle={{
                background: 'rgba(10,10,10,0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              itemStyle={{ fontWeight: 700 }}
              labelStyle={{
                color: '#aaa',
                marginBottom: '6px',
                textTransform: 'uppercase',
                fontSize: '10px',
                letterSpacing: '0.05em'
              }}
              formatter={(value, name) => [
                formatNumber(Number(value)),
                name === 'confirmed' ? labels.confirmed : labels.deaths,
              ]}
            />

            <Line
              type="monotone"
              dataKey="confirmed"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
            />

            <Line
              type="monotone"
              dataKey="deaths"
              stroke="#ffffff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
}