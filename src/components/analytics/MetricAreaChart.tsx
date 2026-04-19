'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { GeneratorData } from '@/types';

interface MetricAreaChartProps {
  data: GeneratorData[];
  dataKey: keyof GeneratorData;
  color: string;
  title: string;
  unit: string;
}

export function MetricAreaChart({ data, dataKey, color, title, unit }: MetricAreaChartProps) {
  const gradId = `grad-${String(dataKey)}`;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 h-[240px] sm:h-[300px] flex flex-col">
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {unit}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="timestamp"
              stroke="#334155"
              fontSize={11}
              tick={{ fill: '#64748b' }}
              tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              minTickGap={40}
            />
            <YAxis stroke="#334155" fontSize={11} tick={{ fill: '#64748b' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
              itemStyle={{ color: '#f8fafc' }}
              labelFormatter={(l) => new Date(l).toLocaleString()}
            />
            <Area
              type="monotone"
              dataKey={dataKey as string}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: '#0f172a', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
