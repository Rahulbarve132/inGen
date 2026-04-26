'use client';
import useSWR from 'swr';
import axios from 'axios';
import { GeneratorData } from '@/types';
import { useMemo, useState } from 'react';
import {
  AlertTriangle, Thermometer, Activity, Droplets, Filter, RefreshCw, Clock,
} from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

type AlertType = 'all' | 'High Temp' | 'Warn Temp' | 'High Vibration' | 'Warn Vibration' | 'Low Fuel';
type SeverityFilter = 'all' | 'CRITICAL' | 'WARNING';

interface AlertEvent {
  id: string;
  type: Exclude<AlertType, 'all'>;
  severity: 'CRITICAL' | 'WARNING';
  deviceId: string;
  timestamp: string;
  value: string;
  metric: string;
  threshold: string;
}

function classifyAlerts(data: GeneratorData[]): AlertEvent[] {
  const events: AlertEvent[] = [];
  for (const d of data) {
    if (d.temperature > 90)
      events.push({ id: `${d.deviceId}-${d.timestamp}-htemp`, type: 'High Temp', severity: 'CRITICAL', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.temperature.toFixed(1)} °C`, metric: 'Temperature', threshold: '> 90 °C' });
    else if (d.temperature > 80)
      events.push({ id: `${d.deviceId}-${d.timestamp}-wtemp`, type: 'Warn Temp', severity: 'WARNING', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.temperature.toFixed(1)} °C`, metric: 'Temperature', threshold: '> 80 °C' });

    if (d.vibration > 10)
      events.push({ id: `${d.deviceId}-${d.timestamp}-hvib`, type: 'High Vibration', severity: 'CRITICAL', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.vibration.toFixed(2)} mm/s`, metric: 'Vibration', threshold: '> 10 mm/s' });
    else if (d.vibration > 5)
      events.push({ id: `${d.deviceId}-${d.timestamp}-wvib`, type: 'Warn Vibration', severity: 'WARNING', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.vibration.toFixed(2)} mm/s`, metric: 'Vibration', threshold: '> 5 mm/s' });

    if (d.fuelLevel < 20)
      events.push({ id: `${d.deviceId}-${d.timestamp}-fuel`, type: 'Low Fuel', severity: 'WARNING', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.fuelLevel.toFixed(1)} %`, metric: 'Fuel Level', threshold: '< 20 %' });
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const TYPE_ICON: Record<Exclude<AlertType, 'all'>, React.ReactNode> = {
  'High Temp':      <Thermometer size={15} />,
  'Warn Temp':      <Thermometer size={15} />,
  'High Vibration': <Activity size={15} />,
  'Warn Vibration': <Activity size={15} />,
  'Low Fuel':       <Droplets size={15} />,
};

const SEVERITY_STYLE = {
  CRITICAL: {
    row:    'border-red-500/20 bg-red-500/5 hover:bg-red-50 dark:bg-red-500/10',
    badge:  'bg-red-500/20 text-red-400 border border-red-500/30',
    dot:    'bg-red-500',
    icon:   'bg-red-500/20 text-red-400',
    border: 'border-l-red-500',
  },
  WARNING: {
    row:    'border-yellow-500/15 bg-yellow-500/5 hover:bg-yellow-500/8',
    badge:  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    dot:    'bg-yellow-500',
    icon:   'bg-yellow-500/20 text-yellow-400',
    border: 'border-l-yellow-500',
  },
};

const TYPE_FILTER_OPTIONS: { label: AlertType }[] = [
  { label: 'all' },
  { label: 'High Temp' },
  { label: 'Warn Temp' },
  { label: 'High Vibration' },
  { label: 'Warn Vibration' },
  { label: 'Low Fuel' },
];

export default function AlertsPage() {
  const [typeFilter, setTypeFilter]   = useState<AlertType>('all');
  const [severityFilter, setSeverity] = useState<SeverityFilter>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  const { data: rawData, isLoading, mutate } = useSWR<GeneratorData[]>(
    'https://fpcmny11mg.execute-api.eu-north-1.amazonaws.com/data',
    fetcher,
    { refreshInterval: 30000 }
  );

  const alerts = useMemo(() => (rawData ? classifyAlerts(rawData) : []), [rawData]);
  const devices = useMemo(() => rawData ? Array.from(new Set(rawData.map(d => d.deviceId))) : [], [rawData]);

  const filtered = useMemo(() =>
    alerts
      .filter(a => typeFilter === 'all' || a.type === typeFilter)
      .filter(a => severityFilter === 'all' || a.severity === severityFilter)
      .filter(a => deviceFilter === 'all' || a.deviceId === deviceFilter),
    [alerts, typeFilter, severityFilter, deviceFilter]
  );

  const summary = useMemo(() => ({
    critical: alerts.filter(a => a.severity === 'CRITICAL').length,
    warning:  alerts.filter(a => a.severity === 'WARNING').length,
    highTemp: alerts.filter(a => a.type === 'High Temp').length,
    highVib:  alerts.filter(a => a.type === 'High Vibration').length,
    lowFuel:  alerts.filter(a => a.type === 'Low Fuel').length,
  }), [alerts]);

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Alerts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">Real-time threshold breach monitoring across all generator devices</p>
        </div>
        <button
          onClick={() => mutate()}
          className="self-start sm:self-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* ── KPI Summary Strip ── */}
      {!isLoading && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-red-400">{summary.critical}</div>
            <div className="text-xs text-red-400/70 mt-1 font-semibold uppercase tracking-wide">Critical</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">{summary.warning}</div>
            <div className="text-xs text-yellow-400/70 mt-1 font-semibold uppercase tracking-wide">Warning</div>
          </div>
          <div className="bg-red-500/8 border border-red-500/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
            <div className="flex justify-center mb-1"><Thermometer size={13} className="text-red-400" /></div>
            <div className="text-xl sm:text-2xl font-bold text-red-300">{summary.highTemp}</div>
            <div className="text-xs text-slate-500 mt-0.5">High Temp</div>
          </div>
          <div className="hidden sm:block bg-purple-500/8 border border-purple-500/15 rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-1"><Activity size={13} className="text-purple-400" /></div>
            <div className="text-2xl font-bold text-purple-300">{summary.highVib}</div>
            <div className="text-xs text-slate-500 mt-1">High Vib</div>
          </div>
          <div className="hidden sm:block bg-yellow-500/8 border border-yellow-500/15 rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-1"><Droplets size={13} className="text-yellow-400" /></div>
            <div className="text-2xl font-bold text-yellow-300">{summary.lowFuel}</div>
            <div className="text-xs text-slate-500 mt-1">Low Fuel</div>
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            <Filter size={13} />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Severity pill group */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 gap-0.5">
            {(['all', 'CRITICAL', 'WARNING'] as SeverityFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  severityFilter === s
                    ? s === 'CRITICAL' ? 'bg-red-600 text-slate-900 dark:text-white'
                    : s === 'WARNING'  ? 'bg-yellow-600 text-slate-900 dark:text-white'
                    : 'bg-blue-600 text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {/* Type dropdown */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as AlertType)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {TYPE_FILTER_OPTIONS.map(({ label }) => (
              <option key={label} value={label}>{label === 'all' ? 'All Types' : label}</option>
            ))}
          </select>

          {/* Device dropdown */}
          <select
            value={deviceFilter}
            onChange={e => setDeviceFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Devices</option>
            {devices.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
          </select>

          <span className="ml-auto text-xs text-slate-500 whitespace-nowrap">
            <span className="text-slate-900 dark:text-white font-semibold">{filtered.length}</span> / {alerts.length}
          </span>
        </div>
      </div>

      {/* ── Alert List ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm tracking-widest">LOADING ALERTS...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 flex-col gap-3">
            <AlertTriangle size={36} className="text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No alerts match the current filters</p>
            <p className="text-slate-600 text-xs">Try adjusting the severity or type filter</p>
          </div>
        ) : (
          <>
            {/* Desktop table header — hidden on mobile */}
            <div className="hidden sm:grid sm:grid-cols-[1.5rem_2fr_1fr_1.2fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span />
              <span>Alert Type</span>
              <span>Device</span>
              <span>Value</span>
              <span>Threshold</span>
              <span>Severity</span>
              <span className="flex items-center gap-1"><Clock size={11} /> Time</span>
            </div>

            <div className="divide-y divide-slate-800/50">
              {filtered.map((alert) => {
                const s = SEVERITY_STYLE[alert.severity];
                return (
                  <div key={alert.id}>
                    {/* ── Desktop row ── */}
                    <div
                      className={`hidden sm:grid sm:grid-cols-[1.5rem_2fr_1fr_1.2fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 border-l-2 transition-colors ${s.row} ${s.border}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${s.icon}`}>{TYPE_ICON[alert.type]}</div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{alert.type}</div>
                          <div className="text-xs text-slate-500">{alert.metric}</div>
                        </div>
                      </div>
                      <span className="text-sm font-mono font-semibold text-blue-400">{alert.deviceId.toUpperCase()}</span>
                      <span className="text-sm font-mono font-bold" style={{ color: alert.severity === 'CRITICAL' ? '#ef4444' : '#eab308' }}>
                        {alert.value}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{alert.threshold}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge} w-fit`}>{alert.severity}</span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(alert.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* ── Mobile card ── */}
                    <div
                      className={`sm:hidden flex items-start gap-3 px-4 py-3.5 border-l-4 transition-colors ${s.row} ${s.border}`}
                    >
                      {/* Icon */}
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${s.icon}`}>
                        {TYPE_ICON[alert.type]}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{alert.type}</span>
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${s.badge}`}>{alert.severity}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono font-semibold text-blue-400">{alert.deviceId.toUpperCase()}</span>
                          <span className="font-mono font-bold" style={{ color: alert.severity === 'CRITICAL' ? '#ef4444' : '#eab308' }}>{alert.value}</span>
                          <span className="text-slate-600">{alert.threshold}</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          {new Date(alert.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
