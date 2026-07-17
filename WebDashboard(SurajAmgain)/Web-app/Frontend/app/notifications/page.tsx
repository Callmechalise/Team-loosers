'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {Bell, Check, CheckCheck, PersonStanding, Heart, Pill, Droplet, Battery,Moon, WifiOff, Siren, Search} from 'lucide-react';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { PageHeader, EmptyState } from '@/components/shared/page-components';
import { formatTimeAgo } from '@/lib/health-data';
import { cn } from '@/lib/utils';

const NOTIF_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  'fall-detected': { icon: PersonStanding, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  'heart-rate-high': { icon: Heart, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  'heart-rate-low': { icon: Heart, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  'spo2-low': { icon: Droplet, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  'medication-reminder': { icon: Pill, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'low-battery': { icon: Battery, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  'left-bed': { icon: Moon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'device-disconnected': { icon: WifiOff, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  'emergency-acknowledged': { icon: Check, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
  'bp-high': { icon: Siren, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  'bp-low': { icon: Siren, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  'temperature-high': { icon: Siren, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  'no-movement': { icon: Siren, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useIoTData();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesFilter = filter === 'all' || (filter === 'unread' && !n.read) || (filter === 'read' && n.read);
      const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [notifications, filter, search]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notifications`}
        icon={Bell}
        actions={
          <button
            onClick={markAllNotificationsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            aria-label="Search notifications"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'read', label: 'Read' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
                filter === f.key 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 dark:bg-blue-500 dark:shadow-blue-500/30' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((n, idx) => {
              const config = NOTIF_ICONS[n.type] || NOTIF_ICONS['emergency-acknowledged'];
              const Icon = config.icon;
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25, delay: idx * 0.02 }}
                  onClick={() => markNotificationRead(n.id)}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all hover:shadow-sm',
                    n.read 
                      ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800' 
                      : 'border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/20'
                  )}
                >
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', config.bg)}>
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{n.message}</p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{formatTimeAgo(n.time)}</p>
                  </div>
                  {n.read && <Check className="h-4 w-4 shrink-0 text-green-500 dark:text-green-400" />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}