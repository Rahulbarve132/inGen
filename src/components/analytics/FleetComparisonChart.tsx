'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { GeneratorData } from '@/types';
import { useMemo } from 'react';

interface FleetComparisonChartProps {
  data: GeneratorData[];
}

export function FleetComparisonChart({ data }: FleetComparisonChartProps) {
  const chartData = useMemo(() => {
    if (!data.length) return [];
    const devices = Array.from(new Set(data.map(d => d.deviceId)));
    return devices.map(deviceId => {
      const recs = data.filter(d => d.deviceId === deviceId);
      const avg = (key: keyof GeneratorData) =>
        (recs.reduce((s, d) => s + (d[key] as number), 0) / recs.length);
      return {
        device: deviceId.toUpperCase(),
        Temperature: +avg('temperature').toFixed(1),
        Vibration: +avg('vibration').toFixed(2),
        Current: +avg('current').toFixed(1),
        'Fuel Level': +avg('fuelLevel').toFixed(1),
      };
    });
  }, [data]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 h-[280px] sm:h-[350px] flex flex-col">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-white">Fleet Performance Comparison</h3>
        <p className="text-xs sm:text-sm text-slate-400">Average values per device across selected time range</p>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="device" stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', border: '1px solid #334155' }}
              itemStyle={{ color: '#f8fafc' }}
              cursor={{ fill: 'rgba(100,116,139,0.08)' }}
            />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '8px' }} />
            <Bar dataKey="Temperature" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Vibration" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Current" fill="#eab308" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Fuel Level" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
