import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusType } from '@/types';

interface KPICardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  status: StatusType;
  trend?: string;
}

export function KPICard({ title, value, unit, icon: Icon, status, trend }: KPICardProps) {
  const statusColors = {
    NORMAL: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    WARNING: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    CRITICAL: 'bg-red-50 dark:bg-red-500/10 text-red-500 border-red-500/20'
  };

  const iconColors = {
    NORMAL: 'text-emerald-500',
    WARNING: 'text-yellow-500',
    CRITICAL: 'text-red-500'
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden group hover:border-slate-300 dark:border-slate-700 transition-colors">
      <div className="absolute top-0 right-0 p-3 sm:p-4">
        <div className={cn('px-2 py-0.5 text-xs font-bold rounded-full border', statusColors[status])}>
          {status}
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className={cn('p-2 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-800', iconColors[status])}>
          <Icon size={20} />
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">{title}</h3>
      </div>
      
      <div className="flex items-baseline gap-1.5 sm:gap-2">
        <span className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{unit}</span>
      </div>
      
      {trend && (
        <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span className="text-emerald-500 font-medium">{trend}</span> since last hour
        </div>
      )}
    </div>
  );
}
