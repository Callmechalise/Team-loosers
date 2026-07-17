// app/live-monitoring/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Thermometer, Droplet, Footprints, PersonStanding, Search } from 'lucide-react';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { PageHeader, EmptyState } from '@/components/shared/page-components';
import { StatusBadge, MovementBadge } from '@/components/shared/status-badges';
import { BatteryIndicator, SignalIndicator } from '@/components/shared/vital-display';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/health-data';

export default function LiveMonitoringPage() {
  const { residents } = useIoTData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return residents.filter((r) => {
      const matchesSearch = !search || 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.room.includes(search);
      const matchesFilter = filter === 'all' || r.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [residents, search, filter]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'healthy', label: 'Healthy' },
    { key: 'warning', label: 'Attention' },
    { key: 'emergency', label: 'Emergency' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Monitoring"
        description="Real-time vital signs from all connected IoT devices"
        icon={Activity}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75 dark:bg-green-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 dark:bg-green-400" />
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Streaming live</span>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search resident or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            aria-label="Search"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
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

      {filtered.length === 0 ? (
        <EmptyState icon={Activity} title="No residents matching criteria" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((r, idx) => {
              const v = r.vitals;
              const isCritical = r.status === 'emergency';
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: idx * 0.02 }}
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition-all dark:bg-gray-800',
                    isCritical 
                      ? 'border-red-300 shadow-lg shadow-red-500/20 dark:border-red-700 dark:shadow-red-500/10' 
                      : 'border-gray-200 hover:shadow-md dark:border-gray-700'
                  )}
                >
                  {isCritical && (
                    <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1 dark:bg-red-900/30">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 dark:bg-red-400" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 dark:bg-red-400" />
                      </span>
                      <span className="text-xs font-bold text-red-500 dark:text-red-400">EMERGENCY</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <img src={r.photo} alt={r.name} className="h-11 w-11 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{r.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Room {r.room}</p>
                    </div>
                    <StatusBadge status={r.status} size="sm" />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <VitalTile 
                      icon={Heart} 
                      label="HR" 
                      value={v.heartRate} 
                      unit="BPM" 
                      status={v.heartRate > 100 || v.heartRate < 55 ? 'warning' : 'healthy'} 
                      pulse={isCritical} 
                    />
                    <VitalTile 
                      icon={Thermometer} 
                      label="Temp" 
                      value={v.temperature} 
                      unit="°C" 
                      status={v.temperature > 37.3 ? 'warning' : 'healthy'} 
                    />
                    <VitalTile 
                      icon={Activity} 
                      label="BP" 
                      value={`${v.systolic}/${v.diastolic}`} 
                      unit="" 
                      status={v.systolic > 140 ? 'warning' : 'healthy'} 
                    />
                    <VitalTile 
                      icon={Droplet} 
                      label="SpO₂" 
                      value={v.spo2} 
                      unit="%" 
                      status={v.spo2 < 95 ? 'warning' : 'healthy'} 
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 rounded-lg bg-gray-100/50 px-2.5 py-1.5 dark:bg-gray-700/50">
                      <Footprints className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-gray-900 tabular-nums dark:text-white">{v.steps}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">steps</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-100/50 px-2.5 py-1.5 dark:bg-gray-700/50">
                      <PersonStanding className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <MovementBadge status={v.movement || 'inactive'} />
                    </div>
                  </div>

                  {v.fallDetected && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1.5 dark:bg-red-900/30">
                      <PersonStanding className="h-4 w-4 text-red-500 dark:text-red-400" />
                      <span className="text-xs font-bold text-red-500 dark:text-red-400">Fall Detected</span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-gray-200/60 pt-3 dark:border-gray-700/60">
                    <div className="flex items-center gap-3">
                      <BatteryIndicator battery={v.battery} showLabel={false} />
                      <SignalIndicator signal={v.signal} />
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{formatTimeAgo(v.lastUpdate)}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function VitalTile({
  icon: Icon,
  label,
  value,
  unit,
  status,
  pulse = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  pulse?: boolean;
}) {
  const colors = {
    healthy: 'text-green-500 dark:text-green-400',
    warning: 'text-orange-500 dark:text-orange-400',
    critical: 'text-red-500 dark:text-red-400',
  };
  
  const bgColors = {
    healthy: 'bg-green-100/50 dark:bg-green-900/20',
    warning: 'bg-orange-100/50 dark:bg-orange-900/20',
    critical: 'bg-red-100/50 dark:bg-red-900/20',
  };
  
  return (
    <div className={cn(
      'rounded-lg border border-gray-200/60 px-2.5 py-2 dark:border-gray-700/60',
      bgColors[status]
    )}>
      <div className="flex items-center gap-1.5">
        <Icon className={cn(
          'h-3.5 w-3.5',
          colors[status],
          pulse && 'animate-pulse'
        )} />
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className={cn('mt-0.5 text-base font-bold tabular-nums', colors[status])}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={String(value)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        {unit && <span className="ml-0.5 text-[10px] font-normal text-gray-500 dark:text-gray-400">{unit}</span>}
      </p>
    </div>
  );
}