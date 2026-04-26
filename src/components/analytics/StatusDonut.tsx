'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GeneratorData } from '@/types';
import { getStatus } from '@/lib/utils';
import { useMemo } from 'react';

interface StatusDonutProps {
  data: GeneratorData[];
}

const COLORS: Record<string, string> = {
  Normal: '#10b981',
  Warning: '#eab308',
  Critical: '#ef4444',
};

export function StatusDonut({ data }: StatusDonutProps) {
  const { chartData, total } = useMemo(() => {
    const counts = { NORMAL: 0, WARNING: 0, CRITICAL: 0 };
    data.forEach(d => { counts[getStatus(d)]++; });
    const items = [
      { name: 'Normal', value: counts.NORMAL },
      { name: 'Warning', value: counts.WARNING },
      { name: 'Critical', value: counts.CRITICAL },
    ].filter(d => d.value > 0);
    return { chartData: items, total: items.reduce((s, d) => s + d.value, 0) };
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 h-[280px] sm:h-[350px] flex flex-col">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Status Distribution</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Reading health breakdown</p>
      </div>
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius="50%"
              outerRadius="70%"
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Legend
              wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
              formatter={(value) => <span style={{ color: COLORS[value] }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '30px' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{total.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-0.5">readings</div>
          </div>
        </div>
      </div>
    </div>
  );
}
