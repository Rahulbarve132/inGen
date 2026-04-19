'use client';
import useSWR from 'swr';
import axios from 'axios';
import { GeneratorData } from '@/types';
import { getStatus } from '@/lib/utils';
import { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle, Droplets, Server, Thermometer,
} from 'lucide-react';
import { FleetComparisonChart } from './FleetComparisonChart';
import { StatusDonut } from './StatusDonut';
import { MetricAreaChart } from './MetricAreaChart';
import { DeviceHealthCard } from './DeviceHealthCard';
import { MetricStatsTable } from './MetricStatsTable';
import { AlertsBarChart } from './AlertsBarChart';
import { AlertFeedCard } from './AlertFeedCard';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const TIME_RANGES = [
  { label: '1H',  hours: 1 },
  { label: '3H',  hours: 3 },
  { label: '6H',  hours: 6 },
  { label: 'All', hours: Infinity },
] as const;

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<number>(Infinity);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');

  const { data: rawData, isLoading } = useSWR<GeneratorData[]>(
    'https://fpcmny11mg.execute-api.eu-north-1.amazonaws.com/data',
    fetcher,
    { refreshInterval: 30000 }
  );

  /* ── Time-filtered data ── */
  const data = useMemo(() => {
    if (!rawData) return [];
    if (!isFinite(timeRange)) return rawData;
    const cutoff = Date.now() - timeRange * 3_600_000;
    return rawData.filter(d => new Date(d.timestamp).getTime() >= cutoff);
  }, [rawData, timeRange]);

  /* ── Unique devices (from full dataset) ── */
  const devices = useMemo(() => {
    if (!rawData) return [];
    return Array.from(new Set(rawData.map(d => d.deviceId)));
  }, [rawData]);

  /* ── Device + time filtered data (for trend charts & stats) ── */
  const filteredData = useMemo(() => {
    if (selectedDevice === 'all') return data;
    return data.filter(d => d.deviceId === selectedDevice);
  }, [data, selectedDevice]);

  /* ── Fleet-wide KPIs ── */
  const fleetStats = useMemo(() => {
    if (!data.length) return null;
    const critCount = data.filter(d => getStatus(d) === 'CRITICAL').length;
    const warnCount = data.filter(d => getStatus(d) === 'WARNING').length;
    const alertRate = ((critCount + warnCount) / data.length * 100).toFixed(1);
    const uptime    = (100 - critCount / data.length * 100).toFixed(1);
    const avgFuel   = (data.reduce((s, d) => s + d.fuelLevel, 0) / data.length).toFixed(1);
    return { total: data.length, deviceCount: devices.length, critCount, warnCount, alertRate, uptime, avgFuel };
  }, [data, devices]);

  /* ── Alert-type breakdowns ── */
  const alertBreakdown = useMemo(() => {
    if (!data.length) return null;
    const highTemp      = data.filter(d => d.temperature > 90).length;
    const warnTemp      = data.filter(d => d.temperature > 80 && d.temperature <= 90).length;
    const highVib       = data.filter(d => d.vibration > 10).length;
    const warnVib       = data.filter(d => d.vibration > 5 && d.vibration <= 10).length;
    const lowFuel       = data.filter(d => d.fuelLevel < 20).length;
    return { highTemp, warnTemp, highVib, warnVib, lowFuel };
  }, [data]);

  /* ── Loading state ── */
  if (isLoading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 font-medium tracking-widest text-sm">AGGREGATING DATA...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">System Analytics</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Historical trends, aggregated performance metrics &amp; fleet health</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Time-range pills */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 gap-0.5">
            {TIME_RANGES.map(({ label, hours }) => (
              <button
                key={label}
                onClick={() => setTimeRange(hours)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  timeRange === hours
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Device selector */}
          <select
            value={selectedDevice}
            onChange={e => setSelectedDevice(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option value="all">All Devices</option>
            {devices.map(d => (
              <option key={d} value={d}>{d.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Fleet KPI Strip ─── */}
      {fleetStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Readings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/10 rounded-xl"><Activity size={18} className="text-blue-400" /></div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Total Readings</span>
            </div>
            <div className="text-3xl font-bold text-white">{fleetStats.total.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">
              across {fleetStats.deviceCount} device{fleetStats.deviceCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Alert Rate */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/10 rounded-xl"><AlertTriangle size={18} className="text-red-400" /></div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Alert Rate</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {fleetStats.alertRate}<span className="text-lg text-slate-400 ml-0.5">%</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {fleetStats.critCount} critical · {fleetStats.warnCount} warnings
            </div>
          </div>

          {/* Fleet Uptime */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl"><CheckCircle size={18} className="text-emerald-400" /></div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Fleet Uptime</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {fleetStats.uptime}<span className="text-lg text-slate-400 ml-0.5">%</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">based on critical-free readings</div>
          </div>

          {/* Avg Fuel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-xl"><Droplets size={18} className="text-green-400" /></div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Avg Fuel Level</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {fleetStats.avgFuel}<span className="text-lg text-slate-400 ml-0.5">%</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">fleet-wide average</div>
          </div>
        </div>
      )}

      {/* ─── Alert Analytics Section ─── */}
      <section>
        <div className="flex items-center gap-3 mb-4 px-1">
          <AlertTriangle size={18} className="text-red-400" />
          <h2 className="text-base font-semibold text-white">Alert Analytics</h2>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">threshold breach summary</span>
        </div>

        {/* Alert type pill strip */}
        {alertBreakdown && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center hover:bg-red-500/15 transition-colors">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Thermometer size={14} className="text-red-400" />
                <span className="text-xs text-red-400 font-semibold uppercase tracking-wide">High Temp</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{alertBreakdown.highTemp.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">&gt; 90 °C</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center hover:bg-orange-500/15 transition-colors">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Thermometer size={14} className="text-orange-400" />
                <span className="text-xs text-orange-400 font-semibold uppercase tracking-wide">Warn Temp</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">{alertBreakdown.warnTemp.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">80 – 90 °C</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center hover:bg-purple-500/15 transition-colors">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Activity size={14} className="text-purple-400" />
                <span className="text-xs text-purple-400 font-semibold uppercase tracking-wide">High Vib</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{alertBreakdown.highVib.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">&gt; 10 mm/s</div>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center hover:bg-violet-500/15 transition-colors">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Activity size={14} className="text-violet-400" />
                <span className="text-xs text-violet-400 font-semibold uppercase tracking-wide">Warn Vib</span>
              </div>
              <div className="text-2xl font-bold text-violet-400">{alertBreakdown.warnVib.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">5 – 10 mm/s</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center hover:bg-yellow-500/15 transition-colors">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Droplets size={14} className="text-yellow-400" />
                <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">Low Fuel</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{alertBreakdown.lowFuel.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">&lt; 20 %</div>
            </div>
          </div>
        )}

        {/* Alert bar chart + feed side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AlertsBarChart data={data} />
          <AlertFeedCard data={filteredData} limit={15} />
        </div>
      </section>

      {/* ─── Fleet Comparison + Status Donut ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <FleetComparisonChart data={data} />
        </div>
        <div>
          <StatusDonut data={filteredData} />
        </div>
      </div>

      {/* ─── Device Health Cards ─── */}
      <section>
        <div className="flex items-center gap-3 mb-4 px-1">
          <Server size={18} className="text-slate-400" />
          <h2 className="text-base font-semibold text-white">Device Health Overview</h2>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{devices.length} devices</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map(deviceId => (
            <DeviceHealthCard
              key={deviceId}
              deviceId={deviceId}
              data={data.filter(d => d.deviceId === deviceId)}
            />
          ))}
        </div>
      </section>

      {/* ─── Trend Area Charts ─── */}
      <section>
        <div className="flex items-center gap-3 mb-4 px-1">
          <Activity size={18} className="text-slate-400" />
          <h2 className="text-base font-semibold text-white">Metric Trends</h2>
          {selectedDevice !== 'all' && (
            <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              {selectedDevice.toUpperCase()}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <MetricAreaChart title="Temperature Trend" data={filteredData} dataKey="temperature" color="#3b82f6" unit="°C" />
          <MetricAreaChart title="Vibration Trend"   data={filteredData} dataKey="vibration"   color="#8b5cf6" unit="mm/s" />
          <MetricAreaChart title="Current Trend"     data={filteredData} dataKey="current"     color="#eab308" unit="A" />
          <MetricAreaChart title="Fuel Level Trend"  data={filteredData} dataKey="fuelLevel"   color="#10b981" unit="%" />
        </div>
      </section>

      {/* ─── Stats Table ─── */}
      <MetricStatsTable data={filteredData} />

    </div>
  );
}
