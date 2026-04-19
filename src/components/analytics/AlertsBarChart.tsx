'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { GeneratorData } from '@/types';
import { useMemo } from 'react';

interface AlertsBarChartProps {
  data: GeneratorData[];
}

const THRESHOLDS = {
  highTemp:      { label: 'High Temp',      test: (d: GeneratorData) => d.temperature > 90,  color: '#ef4444' },
  warnTemp:      { label: 'Warn Temp',      test: (d: GeneratorData) => d.temperature > 80 && d.temperature <= 90, color: '#f97316' },
  highVibration: { label: 'High Vibration', test: (d: GeneratorData) => d.vibration > 10,    color: '#8b5cf6' },
  warnVibration: { label: 'Warn Vibration', test: (d: GeneratorData) => d.vibration > 5 && d.vibration <= 10, color: '#a78bfa' },
  lowFuel:       { label: 'Low Fuel',       test: (d: GeneratorData) => d.fuelLevel < 20,    color: '#eab308' },
} as const;

export function AlertsBarChart({ data }: AlertsBarChartProps) {
  const chartData = useMemo(() => {
    const devices = Array.from(new Set(data.map(d => d.deviceId)));
    return devices.map(deviceId => {
      const recs = data.filter(d => d.deviceId === deviceId);
      const result: Record<string, string | number> = { device: deviceId.toUpperCase() };
      for (const [key, { label, test }] of Object.entries(THRESHOLDS)) {
        result[label] = recs.filter(test).length;
      }
      return result;
    });
  }, [data]);

  const totals = useMemo(() => {
    const result: Record<string, number> = {};
    for (const [, { label, test }] of Object.entries(THRESHOLDS)) {
      result[label] = data.filter(test).length;
    }
    return result;
  }, [data]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[350px] flex flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Alert Distribution by Device</h3>
          <p className="text-sm text-slate-400 mt-0.5">Threshold breach counts per device</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {Object.entries(THRESHOLDS).map(([key, { label, color }]) => (
            <span
              key={key}
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {totals[label] ?? 0} {label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="device" stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', border: '1px solid #334155' }}
              itemStyle={{ color: '#f8fafc' }}
              cursor={{ fill: 'rgba(100,116,139,0.08)' }}
            />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '8px' }} />
            {Object.entries(THRESHOLDS).map(([key, { label, color }]) => (
              <Bar key={key} dataKey={label} fill={color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
