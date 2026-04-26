'use client';
import Link from 'next/link';
import { Activity, LayoutDashboard, Bell, Server, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useSidebar } from './SidebarContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Activity,        label: 'Analytics',  href: '/analytics' },
  { icon: Bell,            label: 'Alerts',     href: '/alerts' },
  { icon: Server,          label: 'Devices',    href: '/devices' },
  { icon: TrendingUp,      label: 'Predictions',href: '/prediction' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  /* close drawer on route change */
  useEffect(() => { close(); }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  /* lock body scroll when mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navContent = (
    <>
      {/* Logo row */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="text-blue-500" size={22} />
          GenMonitor
        </h1>
        {/* Close btn only in mobile drawer */}
        <button
          onClick={close}
          className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm',
                isActive
                  ? 'bg-blue-600 text-slate-900 dark:text-white shadow-lg shadow-blue-900/20'
                  : 'hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-white text-slate-500 dark:text-slate-400'
              )}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-600 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live data stream active
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop: sticky sidebar column ── */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 h-screen sticky top-0">
        {navContent}
      </aside>

      {/* ── Mobile: backdrop ── */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-50 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Mobile: slide-in drawer ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
