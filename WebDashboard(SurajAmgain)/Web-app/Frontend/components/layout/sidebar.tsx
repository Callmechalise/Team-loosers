'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, X } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { residents, alerts, fallEvents, notifications } = useIoTData();

  const badges = useMemo(
    () => ({
      activeAlerts: alerts.filter((a) => !a.acknowledged).length,
      emergencyCases: residents.filter((r) => r.status === 'emergency').length,
      fallsToday: fallEvents.filter(
        (f) => f.responseStatus !== 'resolved' || Date.now() - f.time < 86400000
      ).length,
      unreadNotifications: notifications.filter((n) => !n.read).length,
    }),
    [residents, alerts, fallEvents, notifications]
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/25">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">ElderCare</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Guardian System</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const badgeValue = item.badgeKey ? badges[item.badgeKey] : 0;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 dark:bg-blue-600'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 shrink-0',
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-white'
                )} />
                <span className="flex-1">{item.label}</span>
                {badgeValue > 0 && (
                  <span
                    className={cn(
                      'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold',
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeKey === 'emergencyCases' || item.badgeKey === 'activeAlerts' || item.badgeKey === 'fallsToday'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    )}
                  >
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / System Status */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-gray-50 p-4 shadow-sm dark:border-blue-900/30 dark:from-blue-900/20 dark:via-gray-900 dark:to-gray-900">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">System Status</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75 dark:bg-green-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">All systems operational</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}