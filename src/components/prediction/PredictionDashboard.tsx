'use client';
import useSWR from 'swr';
import axios from 'axios';
import { PredictionData } from '@/types';
import { PredictionCard } from './PredictionCard';
import { BrainCircuit, RefreshCw, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function PredictionDashboard() {
  const { data, error, isLoading, mutate } = useSWR<PredictionData[]>(
    'https://fpcmny11mg.execute-api.eu-north-1.amazonaws.com/prediction',
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  if (error) return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="bg-red-50 dark:bg-red-500/10 text-red-500 p-8 rounded-2xl border border-red-500/20 text-center max-w-md shadow-2xl shadow-red-900/20">
        <AlertTriangle className="mx-auto mb-4" size={48} />
        <h3 className="text-xl font-bold mb-2">Error Loading Predictions</h3>
        <p className="text-sm opacity-80">Failed to connect to the ML prediction API. Please check your connection.</p>
      </div>
    </div>
  );

  if (isLoading && !data) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-purple-500">
            <BrainCircuit size={24} className="animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest text-sm">RUNNING ML MODELS...</p>
      </div>
    </div>
  );

  const anomaliesCount = data?.filter(d => d.anomaly).length || 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-purple-500/30">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">AI Power Predictions</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Machine learning forecasts based on real-time telemetry</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {anomaliesCount > 0 && (
            <div className="px-4 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm rounded-xl border border-red-200 dark:border-red-800/50 flex items-center gap-2">
              <AlertTriangle size={16} />
              {anomaliesCount} Anomal{anomaliesCount === 1 ? 'y' : 'ies'} Detected
            </div>
          )}
          <button 
            onClick={() => mutate()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* AI Insights Banner */}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Insight 1: Fleet Status */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className={`p-2.5 rounded-xl shrink-0 ${anomaliesCount > 0 ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
              {anomaliesCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Fleet Forecast</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {anomaliesCount > 0 
                  ? `${anomaliesCount} device(s) expected to exceed safe operating thresholds. Immediate review recommended.` 
                  : `All ${data.length} devices are predicted to operate within safe thresholds. No immediate action needed.`}
              </p>
            </div>
          </div>

          {/* Insight 2: Model Confidence */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className="p-2.5 rounded-xl shrink-0 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <BrainCircuit size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Model Accuracy</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Average prediction confidence is <strong>{((data.reduce((acc, curr) => acc + curr.confidence, 0) / data.length) * 100).toFixed(1)}%</strong>. Forecast reliability is currently optimal.
              </p>
            </div>
          </div>

          {/* Insight 3: Power Trend */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className="p-2.5 rounded-xl shrink-0 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Power Trend</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {(() => {
                  const totalPredicted = data.reduce((acc, curr) => acc + curr.predicted_power, 0);
                  const totalAvg = data.reduce((acc, curr) => acc + curr.moving_avg, 0);
                  const diff = ((totalPredicted - totalAvg) / totalAvg) * 100;
                  if (diff > 2) return `Predicted total load is trending ${diff.toFixed(1)}% higher than historical average.`;
                  if (diff < -2) return `Predicted total load is trending ${Math.abs(diff).toFixed(1)}% lower than historical average.`;
                  return 'Predicted power load is stable and aligns closely with the historical moving average.';
                })()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Prediction Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.map(prediction => (
          <PredictionCard key={prediction.device_id} data={prediction} />
        ))}
      </div>

      {/* Comparative Chart */}
      {data && data.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Predicted vs Historical Average</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Comparing ML predicted power against moving average for all devices</p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="device_id" 
                  stroke="#64748b" 
                  fontSize={14}
                  fontWeight={600}
                  tickFormatter={(val) => val.toUpperCase()} 
                />
                <YAxis stroke="#64748b" fontSize={12} unit=" kW" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', padding: '12px' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 700 }}
                  cursor={{ fill: '#334155', opacity: 0.2 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="moving_avg" 
                  name="Moving Average" 
                  fill="#94a3b8" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
                <Bar 
                  dataKey="predicted_power" 
                  name="Predicted Power" 
                  fill="#8b5cf6" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                >
                  {/* We could use cell colors for anomaly, but BarChart makes it slightly complex. Standard purple is fine for premium look */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
