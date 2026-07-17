'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PersonStanding,
  MapPin,
  Clock,
  User,
  Check,
  Play,
  Navigation,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { PageHeader, EmptyState, ChartCard } from '@/components/shared/page-components';
import { MultiBarChart } from '@/components/shared/charts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatTimeAgo, formatDuration } from '@/lib/health-data';
import type { FallResponseStatus } from '@/types';

const STATUS_CONFIG: Record<FallResponseStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending Response', color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  responding: { label: 'Responding', color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  resolved: { label: 'Resolved', color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
};

function useElapsedTime(active: boolean, startTime: number) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [active, startTime]);
  return elapsed;
}

export default function FallDetectionPage() {
  const { fallEvents, startFallResponse, resolveFall } = useIoTData();

  const currentFalls = useMemo(
    () => fallEvents.filter((f) => f.responseStatus !== 'resolved'),
    [fallEvents]
  );

  const fallHistory = useMemo(
    () => fallEvents.filter((f) => f.responseStatus === 'resolved').sort((a, b) => b.time - a.time),
    [fallEvents]
  );

  const fallTrend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      days.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        falls: Math.floor(Math.random() * 4),
      });
    }
    return days;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fall Detection"
        description="AI-powered fall detection with emergency response tracking"
        icon={PersonStanding}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/30 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
            <span className="text-sm font-bold text-red-500 dark:text-red-400">{currentFalls.length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">active</span>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current Fall Alerts</h2>
          {currentFalls.length === 0 ? (
            <EmptyState icon={Check} title="No active falls" description="All fall alerts have been resolved." />
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {currentFalls.map((fall, idx) => (
                  <FallAlertCard
                    key={fall.id}
                    fall={fall}
                    index={idx}
                    onStartResponse={() => {
                      startFallResponse(fall.id);
                      toast.success('Response started', { description: `Caretaker dispatched to ${fall.residentName}` });
                    }}
                    onResolve={() => {
                      resolveFall(fall.id);
                      toast.success('Fall resolved', { description: `${fall.residentName} — situation handled` });
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ChartCard title="Falls This Week" description="Daily fall incidents" icon={PersonStanding}>
            <MultiBarChart
              data={fallTrend}
              xKey="label"
              bars={[
                { 
                  key: 'falls', 
                  color: '#EF4444', // Red-500
                  name: 'Falls' 
                }
              ]}
              height={180}
            />
          </ChartCard>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Response Stats</h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg Response Time</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">2m 15s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Falls (30d)</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{fallEvents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Resolution Rate</span>
                <span className="text-sm font-bold text-green-500 dark:text-green-400">100%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg per Day</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">0.5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Fall History</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Resident</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 sm:table-cell">Location</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 md:table-cell">Caretaker</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Response Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">When</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {fallHistory.map((fall) => {
                const status = STATUS_CONFIG[fall.responseStatus];
                return (
                  <tr key={fall.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={fall.photo} alt={fall.residentName} className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{fall.residentName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Room {fall.room}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-gray-400 sm:table-cell">{fall.location}</td>
                    <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-gray-400 md:table-cell">{fall.assignedCaretaker}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{formatDuration(fall.responseTimeSeconds)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(fall.time)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', status.bg, status.color)}>
                        <Check className="h-3 w-3" /> Resolved
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FallAlertCard({
  fall,
  index,
  onStartResponse,
  onResolve,
}: {
  fall: any;
  index: number;
  onStartResponse: () => void;
  onResolve: () => void;
}) {
  const elapsed = useElapsedTime(fall.responseStatus !== 'resolved', fall.time);
  const status = STATUS_CONFIG[fall.responseStatus as FallResponseStatus];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-lg shadow-red-500/10 dark:border-red-900/30 dark:bg-gray-800 dark:shadow-red-500/5"
    >
      <div className="flex items-center gap-2 bg-red-50 px-4 py-2 dark:bg-red-900/20">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 dark:bg-red-400" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 dark:bg-red-400" />
        </span>
        <span className="text-sm font-bold text-red-500 dark:text-red-400">FALL DETECTED</span>
        <span className="ml-auto font-mono text-sm font-bold tabular-nums text-red-500 dark:text-red-400">
          {formatDuration(elapsed)}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4">
          <img src={fall.photo} alt={fall.residentName} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-red-200 dark:ring-red-900/30" />
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{fall.residentName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Room {fall.room}</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                {fall.location}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Assigned: {fall.assignedCaretaker}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                {formatTimeAgo(fall.time)}
              </div>
            </div>
          </div>
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', status.bg, status.color)}>
            {status.label}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {fall.responseStatus === 'pending' && (
            <button
              onClick={onStartResponse}
              className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              <Play className="h-3.5 w-3.5" /> Start Response
            </button>
          )}
          {fall.responseStatus === 'responding' && (
            <button
              onClick={onResolve}
              className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600"
            >
              <Check className="h-3.5 w-3.5" /> Mark Resolved
            </button>
          )}
          <button
            onClick={() => toast.success(`Navigating to ${fall.location}`)}
            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <Navigation className="h-3.5 w-3.5" /> Navigate
          </button>
          <button
            onClick={() => toast.success(`Calling ${fall.residentName}`)}
            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </button>
        </div>
      </div>
    </motion.div>
  );
}