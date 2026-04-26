'use client';
import { GeneratorData } from '@/types';
import { useMemo } from 'react';
import { Thermometer, Droplets, Activity, AlertTriangle } from 'lucide-react';

interface AlertEvent {
  type: 'High Temp' | 'Low Fuel' | 'High Vibration' | 'Warn Temp' | 'Warn Vibration';
  severity: 'CRITICAL' | 'WARNING';
  deviceId: string;
  timestamp: string;
  value: string;
}

function classifyAlerts(data: GeneratorData[]): AlertEvent[] {
  const events: AlertEvent[] = [];
  for (const d of data) {
    if (d.temperature > 90)
      events.push({ type: 'High Temp', severity: 'CRITICAL', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.temperature.toFixed(1)} °C` });
    else if (d.temperature > 80)
      events.push({ type: 'Warn Temp', severity: 'WARNING', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.temperature.toFixed(1)} °C` });

    if (d.vibration > 10)
      events.push({ type: 'High Vibration', severity: 'CRITICAL', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.vibration.toFixed(2)} mm/s` });
    else if (d.vibration > 5)
      events.push({ type: 'Warn Vibration', severity: 'WARNING', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.vibration.toFixed(2)} mm/s` });

    if (d.fuelLevel < 20)
      events.push({ type: 'Low Fuel', severity: 'WARNING', deviceId: d.deviceId, timestamp: d.timestamp, value: `${d.fuelLevel.toFixed(1)} %` });
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const ICON_MAP = {
  'High Temp':      <Thermometer size={15} />,
  'Warn Temp':      <Thermometer size={15} />,
  'High Vibration': <Activity size={15} />,
  'Warn Vibration': <Activity size={15} />,
  'Low Fuel':       <Droplets size={15} />,
};

const STYLE_MAP = {
  CRITICAL: { badge: 'bg-red-500/15 text-red-400 border-red-500/25', icon: 'bg-red-500/20 text-red-400', dot: 'bg-red-500' },
  WARNING:  { badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25', icon: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-500' },
};

export function AlertFeedCard({ data, limit = 12 }: { data: GeneratorData[]; limit?: number }) {
  const alerts = useMemo(() => classifyAlerts(data).slice(0, limit), [data, limit]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Alert Feed</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Latest threshold breaches in the selected window</p>
        </div>
        <span className="text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <AlertTriangle size={12} />
          {alerts.length} events
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12 text-slate-500 text-sm">
          No alert events in the selected time window
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 styled-scrollbar">
          {alerts.map((evt, i) => {
            const s = STYLE_MAP[evt.severity];
            return (
              <div
                key={`${evt.deviceId}-${evt.timestamp}-${evt.type}-${i}`}
                className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 transition-colors"
              >
                {/* Severity dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                {/* Icon */}
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${s.icon}`}>
                  {ICON_MAP[evt.type]}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>
                      {evt.severity}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{evt.type}</span>
                    <span className="text-xs text-slate-500">on {evt.deviceId.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{evt.value}</span>
                    <span className="text-xs text-slate-600">
                      {new Date(evt.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
