'use client';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { KPICard } from './KPICard';
import { MonitoringChart } from './MonitoringChart';
import { DataTable } from './DataTable';
import { GeneratorData } from '@/types';
import { getStatus } from '@/lib/utils';
import { Thermometer, Activity, Zap, Droplets, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function Dashboard() {
  const [selectedDevice, setSelectedDevice] = useState<string>('gen-01');
  
  // Real endpoint from instructions
  const { data, error, isLoading } = useSWR<GeneratorData[]>(
    'https://fpcmny11mg.execute-api.eu-north-1.amazonaws.com/data',
    fetcher,
    { refreshInterval: 5000 }
  );

  // Filter data for selected device
  const deviceData = useMemo(() => {
    if (!data) return [];
    return data.filter(d => d.deviceId === selectedDevice);
  }, [data, selectedDevice]);

  // Latest record for current status
  const latestData = useMemo(() => {
    if (!deviceData.length) return null;
    return [...deviceData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }, [deviceData]);

  const uniqueDevices = useMemo(() => {
    if (!data) return ['gen-01', 'gen-02'];
    return Array.from(new Set(data.map(d => d.deviceId)));
  }, [data]);

  // Find recent anomalies (CRITICAL)
  const anomalies = useMemo(() => {
    if (!deviceData.length) return [];
    return deviceData.filter(d => getStatus(d) === 'CRITICAL')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
  }, [deviceData]);

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-red-500/10 text-red-500 p-8 rounded-2xl border border-red-500/20 text-center max-w-md shadow-2xl shadow-red-900/20">
        <AlertTriangle className="mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
        <p className="text-sm opacity-80">Failed to connect to the telemetry API endpoint. Please check your connection.</p>
      </div>
    </div>
  );

  if (isLoading && !data) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-medium tracking-wide">INITIALIZING TELEMETRY STREAM...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Device Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Real-time monitoring and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-400">Select Device:</label>
          <div className="relative">
            <select 
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer pr-10 shadow-sm transition-all hover:border-slate-600 font-medium"
            >
              {uniqueDevices.map(dev => (
                <option key={dev} value={dev}>{dev.toUpperCase()}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Alert System */}
      {anomalies.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-red-900/5 animate-in fade-in slide-in-from-top-4">
          <div className="bg-red-500/20 text-red-500 p-2.5 rounded-xl shadow-inner">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="text-red-500 font-bold mb-1 text-lg">Critical Anomalies Detected</h4>
            <ul className="space-y-1.5 text-sm text-red-400">
              {anomalies.map((anomaly, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  High <span className="font-semibold text-red-300">{anomaly.temperature > 90 ? 'temperature' : 'vibration'}</span> detected at {new Date(anomaly.timestamp).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <KPICard 
          title="Temperature" 
          value={latestData?.temperature ?? '--'} 
          unit="°C" 
          icon={Thermometer} 
          status={latestData ? getStatus({ temperature: latestData.temperature, vibration: 0 }) : 'NORMAL'}
          trend="+2.4%"
        />
        <KPICard 
          title="Vibration" 
          value={latestData?.vibration ?? '--'} 
          unit="mm/s" 
          icon={Activity} 
          status={latestData ? getStatus({ temperature: 0, vibration: latestData.vibration }) : 'NORMAL'}
          trend="-0.5%"
        />
        <KPICard 
          title="Current" 
          value={latestData?.current ?? '--'} 
          unit="A" 
          icon={Zap} 
          status="NORMAL"
        />
        <KPICard 
          title="Fuel Level" 
          value={latestData?.fuelLevel ?? '--'} 
          unit="%" 
          icon={Droplets} 
          status={latestData && latestData.fuelLevel < 20 ? 'WARNING' : 'NORMAL'}
          trend="-1.2%"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <MonitoringChart 
          title="Temperature Timeline" 
          data={deviceData} 
          dataKey="temperature" 
          color="#3b82f6" 
          unit="°C" 
        />
        <MonitoringChart 
          title="Vibration Profile" 
          data={deviceData} 
          dataKey="vibration" 
          color="#8b5cf6" 
          unit="mm/s" 
        />
        <MonitoringChart 
          title="Power Current" 
          data={deviceData} 
          dataKey="current" 
          color="#eab308" 
          unit="A" 
        />
        <MonitoringChart 
          title="Fuel Consumption" 
          data={deviceData} 
          dataKey="fuelLevel" 
          color="#10b981" 
          unit="%" 
        />
      </div>

      {/* Recent Data Table */}
      <DataTable data={deviceData} />
    </div>
  );
}
