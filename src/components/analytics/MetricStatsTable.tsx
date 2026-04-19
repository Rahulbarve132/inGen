'use client';
import { GeneratorData } from '@/types';
import { useMemo } from 'react';
import { TrendingDown, TrendingUp, BarChart2, Sigma } from 'lucide-react';

const METRICS: { key: keyof GeneratorData; label: string; unit: string; color: string }[] = [
  { key: 'temperature', label: 'Temperature', unit: '°C',   color: '#3b82f6' },
  { key: 'vibration',   label: 'Vibration',   unit: 'mm/s', color: '#8b5cf6' },
  { key: 'current',     label: 'Current',     unit: 'A',    color: '#eab308' },
  { key: 'fuelLevel',   label: 'Fuel Level',  unit: '%',    color: '#10b981' },
];

interface Row {
  label: string;
  unit: string;
  color: string;
  min: string;
  avg: string;
  max: string;
  stddev: string;
}

export function MetricStatsTable({ data }: { data: GeneratorData[] }) {
  const rows: Row[] = useMemo(() => {
    return METRICS.map(({ key, label, unit, color }) => {
      const vals = data.map(d => d[key] as number);
      if (!vals.length) return { label, unit, color, min: '--', avg: '--', max: '--', stddev: '--' };
      const min = Math.min(...vals).toFixed(2);
      const max = Math.max(...vals).toFixed(2);
      const avg = (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2);
      const mean = +avg;
      const stddev = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length).toFixed(2);
      return { label, unit, color, min, avg, max, stddev };
    });
  }, [data]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
      <div className="mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-semibold text-white">Aggregated Metric Statistics</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Computed across all currently filtered readings</p>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[480px] sm:min-w-0 px-4 sm:px-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-3">Metric</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 px-3">
                  <span className="flex items-center justify-end gap-1"><TrendingDown size={12} className="text-emerald-500" />Min</span>
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 px-3">
                  <span className="flex items-center justify-end gap-1"><BarChart2 size={12} className="text-blue-500" />Avg</span>
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 px-3">
                  <span className="flex items-center justify-end gap-1"><TrendingUp size={12} className="text-red-500" />Max</span>
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pl-3">
                  <span className="flex items-center justify-end gap-1"><Sigma size={12} />σ</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.map(row => (
                <tr key={row.label} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 sm:py-4 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-white">{row.label}</span>
                        <span className="text-xs text-slate-500 ml-1">({row.unit})</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 text-right px-3">
                    <span className="font-mono text-xs sm:text-sm text-emerald-400 font-medium">{row.min}</span>
                  </td>
                  <td className="py-3 sm:py-4 text-right px-3">
                    <span className="font-mono text-xs sm:text-sm text-blue-400 font-medium">{row.avg}</span>
                  </td>
                  <td className="py-3 sm:py-4 text-right px-3">
                    <span className="font-mono text-xs sm:text-sm text-red-400 font-medium">{row.max}</span>
                  </td>
                  <td className="py-3 sm:py-4 text-right pl-3">
                    <span className="font-mono text-xs sm:text-sm text-slate-400">{row.stddev}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
