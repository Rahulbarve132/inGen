'use client';
import { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { toggle } = useSidebar();

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 sm:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 w-full">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — visible only on mobile */}
        <button
          className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors shrink-0"
          onClick={toggle}
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate leading-tight">
            Generator Monitoring System
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 hidden sm:block">
            {currentTime || '—'}
          </p>
        </div>
      </div>

      {/* Right: status pill + bell + avatar */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Status pill — hidden on xs */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            System Online
          </span>
        </div>

        {/* Bell + avatar */}
        <div className="flex items-center gap-2 sm:gap-3 sm:border-l sm:border-slate-200 dark:border-slate-800 sm:pl-4">
          <ThemeToggle />
          <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors relative p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
          </button>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shrink-0">
            OP
          </div>
        </div>
      </div>
    </header>
  );
}
