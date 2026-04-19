'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GeneratorData } from '@/types';

interface MonitoringChartProps {
  data: GeneratorData[];
  dataKey: keyof GeneratorData;
  color: string;
  title: string;
  unit: string;
}

export function MonitoringChart({ data, dataKey, color, title, unit }: MonitoringChartProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[350px] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-slate-400 px-3 py-1 bg-slate-800 rounded-full">{unit}</span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              stroke="#64748b" 
              fontSize={12} 
              tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              minTickGap={30}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey as string} 
              stroke={color} 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: color, stroke: '#0f172a', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
