'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren,
  Check,
  Phone,
  Stethoscope,
  Users as UsersIcon,
  Filter,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { PageHeader, EmptyState } from '@/components/shared/page-components';
import { SeverityBadge } from '@/components/shared/status-badges';
import { ALERT_CONFIG } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/health-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CARETAKER_PROFILE } from '@/data/mock-data';
import type { AlertSeverity } from '@/types';

export default function EmergencyAlertsPage() {
  const { alerts, acknowledgeAlert, callResident, callDoctor, notifyFamily } = useIoTData();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const filtered = useMemo(() => {
    return alerts
      .filter((a) => {
        if (!showAcknowledged && a.acknowledged) return false;
        if (severityFilter === 'all') return true;
        if (severityFilter === 'unacknowledged') return !a.acknowledged;
        return a.severity === severityFilter;
      })
      .sort((a, b) => b.time - a.time);
  }, [alerts, severityFilter, showAcknowledged]);

  const stats = useMemo(() => {
    const critical = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length;
    const warning = alerts.filter((a) => a.severity === 'warning' && !a.acknowledged).length;
    const info = alerts.filter((a) => a.severity === 'info' && !a.acknowledged).length;
    return { critical, warning, info };
  }, [alerts]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Alerts"
        description="Critical alerts requiring immediate attention"
        icon={Siren}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/30 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
              <span className="text-sm font-bold text-red-500 dark:text-red-400">{stats.critical}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">critical</span>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Critical', value: stats.critical, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertTriangle },
          { label: 'Warning', value: stats.warning, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: AlertTriangle },
          { label: 'Info', value: stats.info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: AlertTriangle },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={cn('rounded-xl border border-gray-200 p-4 dark:border-gray-700', s.bg)}>
              <Icon className={cn('h-5 w-5', s.color)} />
              <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label} alerts pending</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'unacknowledged', label: 'Pending' },
            { key: 'critical', label: 'Critical' },
            { key: 'warning', label: 'Warning' },
            { key: 'info', label: 'Info' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setSeverityFilter(f.key)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all',
                severityFilter === f.key 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 dark:bg-blue-500 dark:shadow-blue-500/30' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-500"
          />
          Show acknowledged
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Siren} title="No alerts found" description="All clear — no alerts matching your criteria." />
      ) : (
        <div className="relative">
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((alert, idx) => {
                const config = ALERT_CONFIG[alert.type];
                const isCritical = alert.severity === 'critical';
                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className="relative flex gap-4"
                  >
                    <div className={cn(
                      'relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-4 border-white dark:border-gray-800',
                      config.bgColor
                    )}>
                      <img src={alert.photo} alt={alert.residentName} className="h-full w-full rounded-xl object-cover" />
                      {isCritical && !alert.acknowledged && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 dark:bg-red-400" />
                          <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500 dark:bg-red-400 border-2 border-white dark:border-gray-800" />
                        </span>
                      )}
                    </div>

                    <div className={cn(
                      'flex-1 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm dark:bg-gray-800',
                      isCritical && !alert.acknowledged 
                        ? 'border-red-300 shadow-lg shadow-red-500/20 dark:border-red-700 dark:shadow-red-500/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    )}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{alert.residentName}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Room {alert.room}</span>
                            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', config.bgColor, config.color)}>
                              {config.label}
                            </span>
                            <SeverityBadge severity={alert.severity} />
                          </div>
                          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{alert.message}</p>
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(alert.time)}
                            {alert.acknowledged && (
                              <>
                                <span className="mx-1">·</span>
                                <Check className="h-3 w-3 text-green-500 dark:text-green-400" />
                                <span className="text-green-500 dark:text-green-400">Acknowledged by {alert.acknowledgedBy}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {!alert.acknowledged && (
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => {
                                acknowledgeAlert(alert.id, CARETAKER_PROFILE.name);
                                toast.success('Alert acknowledged', { description: `${alert.residentName} — ${config.label}` });
                              }}
                              className="flex items-center gap-1 rounded-lg bg-green-100 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                            >
                              <Check className="h-3.5 w-3.5" /> Acknowledge
                            </button>
                            <button
                              onClick={() => {
                                callResident(alert.id);
                                toast.success(`Calling ${alert.residentName}`, { description: `Room ${alert.room}` });
                              }}
                              className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                              <Phone className="h-3.5 w-3.5" /> Call
                            </button>
                            <button
                              onClick={() => {
                                callDoctor(alert.id);
                                toast.success('Calling attending physician', { description: `For ${alert.residentName}` });
                              }}
                              className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                              <Stethoscope className="h-3.5 w-3.5" /> Doctor
                            </button>
                            <button
                              onClick={() => {
                                notifyFamily(alert.id);
                                toast.success('Family notified', { description: `Emergency contact for ${alert.residentName}` });
                              }}
                              className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                              <UsersIcon className="h-3.5 w-3.5" /> Family
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}