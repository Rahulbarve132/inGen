'use client';
import { BrainCircuit, Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { PredictionData } from '@/types';

export function PredictionCard({ data }: { data: PredictionData }) {
  const isAnomaly = data.anomaly || data.predicted_power < data.min_expected || data.predicted_power > data.max_expected;

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 shadow-lg ${
      isAnomaly 
        ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:shadow-red-900/20' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700'
    }`}>
      {/* Background glow for anomaly */}
      {isAnomaly && (
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full pointer-events-none"></div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isAnomaly ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">{data.device_id}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              {isAnomaly ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
                  <AlertTriangle size={12} /> ANOMALY DETECTED
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                  <CheckCircle size={12} /> NORMAL OPERATION
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Confidence</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {(data.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <BrainCircuit size={14} className="text-purple-500" />
            PREDICTED POWER
          </div>
          <div className={`text-3xl font-bold ${isAnomaly ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
            {data.predicted_power.toFixed(1)} <span className="text-sm text-slate-500">kW</span>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <Activity size={14} className="text-blue-500" />
            MOVING AVERAGE
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {data.moving_avg.toFixed(1)} <span className="text-sm text-slate-500">kW</span>
          </div>
        </div>
      </div>

      {/* Expected Range Bar */}
      <div className="mt-2">
        <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <span>Min Expected: {data.min_expected.toFixed(0)} kW</span>
          <span>Max Expected: {data.max_expected.toFixed(0)} kW</span>
        </div>
        
        {/* Visualization of the prediction within the range */}
        <div className="relative h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
          {/* We'll map the range [min_expected * 0.8, max_expected * 1.2] to 0-100% */}
          {(() => {
            const rangeMin = data.min_expected * 0.8;
            const rangeMax = data.max_expected * 1.2;
            const rangeDiff = rangeMax - rangeMin;
            
            const minPos = ((data.min_expected - rangeMin) / rangeDiff) * 100;
            const maxPos = ((data.max_expected - rangeMin) / rangeDiff) * 100;
            const predPos = ((data.predicted_power - rangeMin) / rangeDiff) * 100;
            const avgPos = ((data.moving_avg - rangeMin) / rangeDiff) * 100;

            return (
              <>
                {/* Safe Zone */}
                <div 
                  className="absolute h-full bg-emerald-500/20 dark:bg-emerald-500/30 border-x border-emerald-500/50"
                  style={{ left: `${minPos}%`, width: `${maxPos - minPos}%` }}
                />
                
                {/* Moving Average Marker */}
                <div 
                  className="absolute h-full w-1 bg-slate-400 dark:bg-slate-500 z-10"
                  style={{ left: `${avgPos}%` }}
                  title="Moving Average"
                />

                {/* Prediction Marker */}
                <div 
                  className={`absolute h-5 w-5 -ml-2.5 rounded-full border-4 shadow-sm z-20 ${isAnomaly ? 'bg-red-500 border-red-200 dark:border-red-900' : 'bg-blue-500 border-blue-200 dark:border-blue-900'}`}
                  style={{ left: `${predPos}%` }}
                  title="Predicted Power"
                />
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
