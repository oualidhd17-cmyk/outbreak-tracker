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
    <div className="flex h-[320px] min-h-[320px] w-full min-w-0 flex-col bg-[#000] px-5 py-4 text-white sm:h-[340px] lg:h-full lg:min-h-0">
      <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {labels.title}
          </div>

          <h2 className="mt-1 truncate text-sm font-bold text-gray-300">
            {labels.subtitle}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-4 text-xs font-bold text-gray-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            {labels.confirmed}
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
            {labels.deaths}
          </div>
        </div>
      </div>

      <div className="relative min-h-0 min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#222" strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="date"
              minTickGap={20}
              tick={{ fill: '#777', fontSize: 10, fontWeight: 600 }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: '#777', fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatNumber(Number(value))}
              width={45}
            />

            <Tooltip
              contentStyle={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
              itemStyle={{ fontWeight: 700 }}
              labelStyle={{
                color: '#aaa',
                marginBottom: '4px',
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
              activeDot={{ r: 5, strokeWidth: 0, fill: '#ef4444' }}
            />

            <Line
              type="monotone"
              dataKey="deaths"
              stroke="#ffffff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}