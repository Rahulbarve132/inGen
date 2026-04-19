import { GeneratorData } from '@/types';
import { getStatus, formatTime, cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

export function DataTable({ data }: { data: GeneratorData[] }) {
  // Sort latest first
  const sortedData = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
          <Activity size={18} className="text-blue-500" />
          Recent Activity Log
        </h3>
        <span className="text-xs sm:text-sm text-slate-400">Latest 20 records</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[520px]">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs sm:text-sm">
              <th className="p-3 sm:p-4 font-medium">Time</th>
              <th className="p-3 sm:p-4 font-medium">Temp</th>
              <th className="p-3 sm:p-4 font-medium hidden sm:table-cell">Vibration</th>
              <th className="p-3 sm:p-4 font-medium hidden sm:table-cell">Current</th>
              <th className="p-3 sm:p-4 font-medium">Fuel</th>
              <th className="p-3 sm:p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedData.map((row, i) => {
              const status = getStatus({ temperature: row.temperature, vibration: row.vibration });
              const rowColors = {
                NORMAL:   'hover:bg-slate-800/50',
                WARNING:  'bg-yellow-500/5 hover:bg-yellow-500/10',
                CRITICAL: 'bg-red-500/5 hover:bg-red-500/10',
              };
              const badgeColors = {
                NORMAL:   'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                WARNING:  'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
                CRITICAL: 'bg-red-500/10 text-red-500 border border-red-500/20',
              };
              return (
                <tr key={`${row.timestamp}-${i}`} className={cn('transition-colors', rowColors[status])}>
                  <td className="p-3 sm:p-4 text-slate-300 font-mono text-xs sm:text-sm whitespace-nowrap">{formatTime(row.timestamp)}</td>
                  <td className="p-3 sm:p-4 text-slate-300 text-xs sm:text-sm">{row.temperature} °C</td>
                  <td className="p-3 sm:p-4 text-slate-300 text-xs sm:text-sm hidden sm:table-cell">{row.vibration} mm/s</td>
                  <td className="p-3 sm:p-4 text-slate-300 text-xs sm:text-sm hidden sm:table-cell">{row.current} A</td>
                  <td className="p-3 sm:p-4 text-slate-300 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 sm:w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden xs:block">
                        <div className="h-full bg-blue-500" style={{ width: `${row.fuelLevel}%` }} />
                      </div>
                      <span className="text-xs">{row.fuelLevel}%</span>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className={cn('px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-semibold rounded-full whitespace-nowrap', badgeColors[status])}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">
                  No data available for this device.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
