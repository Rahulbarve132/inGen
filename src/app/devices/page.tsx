'use client';
import useSWR from 'swr';
import axios from 'axios';
import { GeneratorData } from '@/types';
import { getStatus } from '@/lib/utils';
import { useMemo, useState } from 'react';
import {
  Server, Thermometer, Activity, Zap, Droplets,
  Wifi, Clock, BarChart2, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

/* ── Thresholds ── */
const TEMP_CRIT = 90, TEMP_WARN = 80;
const VIB_CRIT = 10,  VIB_WARN = 5;
const FUEL_LOW = 20;

function calcDeviceStats(records: GeneratorData[]) {
  if (!records.length) return null;
  const sorted = [...records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const latest = sorted[0];
  const oldest = sorted[sorted.length - 1];

  const critCount  = records.filter(d => getStatus(d) === 'CRITICAL').length;
  const warnCount  = records.filter(d => getStatus(d) === 'WARNING').length;
  const normalCount = records.length - critCount - warnCount;
  const healthScore = Math.max(0, Math.round(100 - (critCount / records.length) * 80 - (warnCount / records.length) * 20));

  const avg = (key: keyof GeneratorData) =>
    (records.reduce((s, d) => s + (d[key] as number), 0) / records.length);
  const max = (key: keyof GeneratorData) => Math.max(...records.map(d => d[key] as number));
  const min = (key: keyof GeneratorData) => Math.min(...records.map(d => d[key] as number));

  /* alert breakdown */
  const highTempEvents  = records.filter(d => d.temperature > TEMP_CRIT).length;
  const warnTempEvents  = records.filter(d => d.temperature > TEMP_WARN && d.temperature <= TEMP_CRIT).length;
  const highVibEvents   = records.filter(d => d.vibration > VIB_CRIT).length;
  const warnVibEvents   = records.filter(d => d.vibration > VIB_WARN && d.vibration <= VIB_CRIT).length;
  const lowFuelEvents   = records.filter(d => d.fuelLevel < FUEL_LOW).length;

  return {
    total: records.length,
    latest, oldest,
    critCount, warnCount, normalCount, healthScore,
    avgTemp: avg('temperature'), maxTemp: max('temperature'), minTemp: min('temperature'),
    avgVib:  avg('vibration'),  maxVib:  max('vibration'),  minVib:  min('vibration'),
    avgCurr: avg('current'),    maxCurr: max('current'),    minCurr: min('current'),
    latestFuel: latest.fuelLevel,
    highTempEvents, warnTempEvents, highVibEvents, warnVibEvents, lowFuelEvents,
  };
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
    </div>
  );
}

function MetricRow({
  icon, label, value, unit, pct, color, sub,
}: {
  icon: React.ReactNode; label: string; value: string; unit: string;
  pct?: number; color: string; sub?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <span style={{ color }}>{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-white">{value}</span>
          <span className="text-xs text-slate-500 ml-1">{unit}</span>
        </div>
      </div>
      {pct !== undefined && <MiniBar pct={pct} color={color} />}
      {sub && <p className="text-xs text-slate-600">{sub}</p>}
    </div>
  );
}

function DeviceCard({ deviceId, data }: { deviceId: string; data: GeneratorData[] }) {
  const [expanded, setExpanded] = useState(false);
  const stats = useMemo(() => calcDeviceStats(data), [data]);

  if (!stats) return null;

  const hColor = stats.healthScore > 80 ? '#10b981' : stats.healthScore > 50 ? '#eab308' : '#ef4444';
  const hLabel = stats.healthScore > 80 ? 'Healthy' : stats.healthScore > 50 ? 'Degraded' : 'Critical';

  const currentStatus = getStatus(stats.latest);
  const statusStyle = {
    NORMAL:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    WARNING:  'bg-yellow-500/15  text-yellow-400  border-yellow-500/25',
    CRITICAL: 'bg-red-500/15     text-red-400     border-red-500/25',
  }[currentStatus];

  return (
    <div className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
      currentStatus === 'CRITICAL' ? 'border-red-500/30' :
      currentStatus === 'WARNING'  ? 'border-yellow-500/25' :
      'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              currentStatus === 'CRITICAL' ? 'bg-red-500/20' :
              currentStatus === 'WARNING'  ? 'bg-yellow-500/20' :
              'bg-slate-800'
            }`}>
              <Server size={20} className={
                currentStatus === 'CRITICAL' ? 'text-red-400' :
                currentStatus === 'WARNING'  ? 'text-yellow-400' :
                'text-slate-400'
              } />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{deviceId.toUpperCase()}</h3>
              <p className="text-xs text-slate-500">{stats.total} readings recorded</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: hColor }}>{stats.healthScore}%</div>
            <div className="text-xs font-semibold" style={{ color: hColor }}>{hLabel}</div>
          </div>
        </div>

        {/* Health bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
          <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${stats.healthScore}%`, backgroundColor: hColor }} />
        </div>

        {/* Status + Connection badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
            {currentStatus === 'CRITICAL' ? '⚠ CRITICAL' : currentStatus === 'WARNING' ? '⚡ WARNING' : '✓ NORMAL'}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
            <Wifi size={11} /> Online
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 flex items-center gap-1.5">
            <Clock size={11} />
            {new Date(stats.latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Metric mini-grid */}
        <div className="grid grid-cols-2 gap-4">
          <MetricRow
            icon={<Thermometer size={13} />}
            label="Temperature"
            value={stats.latest.temperature.toFixed(1)} unit="°C"
            pct={(stats.latest.temperature / 120) * 100}
            color={stats.latest.temperature > TEMP_CRIT ? '#ef4444' : stats.latest.temperature > TEMP_WARN ? '#f97316' : '#3b82f6'}
            sub={`Avg ${stats.avgTemp.toFixed(1)} · Max ${stats.maxTemp.toFixed(1)}`}
          />
          <MetricRow
            icon={<Activity size={13} />}
            label="Vibration"
            value={stats.latest.vibration.toFixed(2)} unit="mm/s"
            pct={(stats.latest.vibration / 15) * 100}
            color={stats.latest.vibration > VIB_CRIT ? '#ef4444' : stats.latest.vibration > VIB_WARN ? '#f97316' : '#8b5cf6'}
            sub={`Avg ${stats.avgVib.toFixed(2)} · Max ${stats.maxVib.toFixed(2)}`}
          />
          <MetricRow
            icon={<Zap size={13} />}
            label="Current"
            value={stats.latest.current.toFixed(1)} unit="A"
            pct={(stats.latest.current / 60) * 100}
            color="#eab308"
            sub={`Avg ${stats.avgCurr.toFixed(1)} · Max ${stats.maxCurr.toFixed(1)}`}
          />
          <MetricRow
            icon={<Droplets size={13} />}
            label="Fuel Level"
            value={stats.latestFuel.toFixed(1)} unit="%"
            pct={stats.latestFuel}
            color={stats.latestFuel < FUEL_LOW ? '#eab308' : '#10b981'}
            sub={stats.latestFuel < FUEL_LOW ? '⚠ Low fuel – refill needed' : 'Fuel OK'}
          />
        </div>
      </div>

      {/* Status breakdown bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-t border-slate-800">
        <div className="px-4 py-3 text-center bg-emerald-500/5">
          <div className="text-xl font-bold text-emerald-400">{stats.normalCount}</div>
          <div className="text-xs text-slate-500">Normal</div>
        </div>
        <div className="px-4 py-3 text-center bg-yellow-500/5">
          <div className="text-xl font-bold text-yellow-400">{stats.warnCount}</div>
          <div className="text-xs text-slate-500">Warning</div>
        </div>
        <div className="px-4 py-3 text-center bg-red-500/5">
          <div className="text-xl font-bold text-red-400">{stats.critCount}</div>
          <div className="text-xs text-slate-500">Critical</div>
        </div>
      </div>

      {/* Expand/collapse toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-slate-500 hover:text-slate-300 bg-slate-800/40 border-t border-slate-800 transition-colors"
      >
        {expanded ? <><ChevronUp size={13} /> Hide alert details</> : <><ChevronDown size={13} /> Show alert details</>}
      </button>

      {/* Expanded alert breakdown */}
      {expanded && (
        <div className="p-5 border-t border-slate-800 bg-slate-900/60">
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
            <AlertTriangle size={12} className="text-red-400" /> Alert Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: 'High Temp',       count: stats.highTempEvents,  color: '#ef4444',  icon: <Thermometer size={13} /> },
              { label: 'Warn Temp',       count: stats.warnTempEvents,  color: '#f97316',  icon: <Thermometer size={13} /> },
              { label: 'High Vibration',  count: stats.highVibEvents,   color: '#8b5cf6',  icon: <Activity size={13} /> },
              { label: 'Warn Vibration',  count: stats.warnVibEvents,   color: '#a78bfa',  icon: <Activity size={13} /> },
              { label: 'Low Fuel',        count: stats.lowFuelEvents,   color: '#eab308',  icon: <Droplets size={13} /> },
            ].map(({ label, count, color, icon }) => (
              <div
                key={label}
                className="rounded-xl p-3 border text-center"
                style={{ backgroundColor: `${color}10`, borderColor: `${color}25` }}
              >
                <div className="flex items-center justify-center gap-1 mb-1" style={{ color }}>
                  {icon}
                  <span className="text-xs font-semibold">{label}</span>
                </div>
                <div className="text-xl font-bold" style={{ color }}>{count}</div>
              </div>
            ))}
          </div>

          {/* Time range info */}
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs text-slate-500">
            <div>
              <span className="block text-slate-600 mb-0.5">First reading</span>
              <span className="text-slate-400 font-mono">{new Date(stats.oldest.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div>
              <span className="block text-slate-600 mb-0.5">Latest reading</span>
              <span className="text-slate-400 font-mono">{new Date(stats.latest.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DevicesPage() {
  const { data: rawData, isLoading, mutate } = useSWR<GeneratorData[]>(
    'https://fpcmny11mg.execute-api.eu-north-1.amazonaws.com/data',
    fetcher,
    { refreshInterval: 30000 }
  );

  const devices = useMemo(() => {
    if (!rawData) return [];
    return Array.from(new Set(rawData.map(d => d.deviceId)));
  }, [rawData]);

  const fleetSummary = useMemo(() => {
    if (!rawData?.length) return null;
    const healthy = devices.filter(id => {
      const recs = rawData.filter(d => d.deviceId === id);
      const last = [...recs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      return getStatus(last) === 'NORMAL';
    }).length;
    return { total: devices.length, healthy, degraded: devices.length - healthy };
  }, [rawData, devices]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Connected Devices</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Live generator status, metrics, and alert breakdowns per device</p>
        </div>
        <button
          onClick={() => mutate()}
          className="self-start sm:self-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Fleet summary strip */}
      {fleetSummary && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
            <div className="flex justify-center mb-1 sm:mb-2"><Server size={16} className="text-blue-400" /></div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{fleetSummary.total}</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wide">Devices</div>
          </div>
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
            <div className="flex justify-center mb-1 sm:mb-2"><CheckCircle size={16} className="text-emerald-400" /></div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{fleetSummary.healthy}</div>
            <div className="text-xs text-emerald-400/60 mt-1 font-semibold uppercase tracking-wide">Healthy</div>
          </div>
          <div className="bg-red-500/8 border border-red-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
            <div className="flex justify-center mb-1 sm:mb-2"><AlertTriangle size={16} className="text-red-400" /></div>
            <div className="text-2xl sm:text-3xl font-bold text-red-400">{fleetSummary.degraded}</div>
            <div className="text-xs text-red-400/60 mt-1 font-semibold uppercase tracking-wide">Attention</div>
          </div>
        </div>
      )}

      {/* Device Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-400 text-sm tracking-widest">CONNECTING TO DEVICES...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {devices.map(deviceId => (
            <DeviceCard
              key={deviceId}
              deviceId={deviceId}
              data={(rawData ?? []).filter(d => d.deviceId === deviceId)}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart2 size={14} className="text-slate-400" />
          Alert Thresholds Reference
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'High Temp',       rule: '> 90 °C',     color: '#ef4444' },
            { label: 'Warn Temp',       rule: '80 – 90 °C',  color: '#f97316' },
            { label: 'High Vibration',  rule: '> 10 mm/s',   color: '#8b5cf6' },
            { label: 'Warn Vibration',  rule: '5 – 10 mm/s', color: '#a78bfa' },
            { label: 'Low Fuel',        rule: '< 20 %',      color: '#eab308' },
          ].map(({ label, rule, color }) => (
            <div key={label} className="rounded-xl p-3 border text-center" style={{ borderColor: `${color}25`, backgroundColor: `${color}08` }}>
              <div className="text-xs font-bold mb-0.5" style={{ color }}>{label}</div>
              <div className="text-xs font-mono text-slate-500">{rule}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
