'use client';
import { GeneratorData } from '@/types';
import { getStatus } from '@/lib/utils';
import { useMemo } from 'react';
import { Server } from 'lucide-react';

interface DeviceHealthCardProps {
  deviceId: string;
  data: GeneratorData[];
}

export function DeviceHealthCard({ deviceId, data }: DeviceHealthCardProps) {
  const stats = useMemo(() => {
    if (!data.length) return null;
    const critCount = data.filter(d => getStatus(d) === 'CRITICAL').length;
    const warnCount = data.filter(d => getStatus(d) === 'WARNING').length;
    const normalCount = data.length - critCount - warnCount;
    // Health score: penalise critical heavily, warnings lightly
    const healthScore = Math.max(0, Math.round(100 - (critCount / data.length) * 80 - (warnCount / data.length) * 20));
    const avgTemp = (data.reduce((s, d) => s + d.temperature, 0) / data.length).toFixed(1);
    const avgVib = (data.reduce((s, d) => s + d.vibration, 0) / data.length).toFixed(2);
    const latestFuel = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.fuelLevel ?? 0;
    return { healthScore, normalCount, warnCount, critCount, avgTemp, avgVib, latestFuel, total: data.length };
  }, [data]);

  if (!stats) return null;

  const healthColor =
    stats.healthScore > 80 ? '#10b981' :
    stats.healthScore > 50 ? '#eab308' :
    '#ef4444';

  const healthLabel =
    stats.healthScore > 80 ? 'Healthy' :
    stats.healthScore > 50 ? 'Degraded' :
    'Critical';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 rounded-xl">
            <Server size={20} className="text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{deviceId.toUpperCase()}</h3>
            <p className="text-xs text-slate-500">{stats.total} readings</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: healthColor }}>{stats.healthScore}%</div>
          <div className="text-xs font-medium" style={{ color: healthColor }}>{healthLabel}</div>
        </div>
      </div>

      {/* Health bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${stats.healthScore}%`, backgroundColor: healthColor }}
        />
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-emerald-400">{stats.normalCount}</div>
          <div className="text-xs text-slate-500">Normal</div>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-yellow-400">{stats.warnCount}</div>
          <div className="text-xs text-slate-500">Warning</div>
        </div>
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-red-400">{stats.critCount}</div>
          <div className="text-xs text-slate-500">Critical</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Avg Temperature</span>
          <span className="text-slate-200 font-mono font-medium">{stats.avgTemp} °C</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Avg Vibration</span>
          <span className="text-slate-200 font-mono font-medium">{stats.avgVib} mm/s</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Last Fuel Level</span>
          <span className="font-mono font-medium" style={{ color: stats.latestFuel < 20 ? '#eab308' : '#10b981' }}>
            {stats.latestFuel.toFixed(1)} %
          </span>
        </div>
      </div>
    </div>
  );
}
