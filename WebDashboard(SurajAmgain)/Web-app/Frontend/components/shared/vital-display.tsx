'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Thermometer, Activity, Droplet } from 'lucide-react';
import type { Resident } from '@/types';
import { cn } from '@/lib/utils';

interface VitalRowProps {
  resident: Resident;
  compact?: boolean;
}

function getVitalStatus(value: number, min: number, max: number, critMin: number, critMax: number) {
  if (value < critMin || value > critMax) return 'critical';
  if (value < min || value > max) return 'warning';
  return 'healthy';
}

const vitalColors = {
  healthy: 'text-green-500 dark:text-green-400',
  warning: 'text-orange-500 dark:text-orange-400',
  critical: 'text-red-500 dark:text-red-400',
};

export function VitalRow({ resident, compact = false }: VitalRowProps) {
  const v = resident.vitals;
  const hrStatus = getVitalStatus(v.heartRate, 60, 100, 45, 130);
  const tempStatus = getVitalStatus(v.temperature, 36.1, 37.2, 35.0, 38.5);
  const bpStatus = getVitalStatus(v.systolic, 90, 130, 80, 160);
  const spo2Status = getVitalStatus(v.spo2, 95, 100, 88, 100);

  const vitals = [
    { icon: Heart, label: 'Heart Rate', value: v.heartRate, unit: 'BPM', status: hrStatus, animate: true },
    { icon: Thermometer, label: 'Temp', value: v.temperature, unit: '°C', status: tempStatus },
    { icon: Activity, label: 'BP', value: `${v.systolic}/${v.diastolic}`, unit: 'mmHg', status: bpStatus },
    { icon: Droplet, label: 'SpO₂', value: v.spo2, unit: '%', status: spo2Status },
  ];

  return (
    <div className={cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4')}>
      {vitals.map((vital) => {
        const Icon = vital.icon;
        return (
          <div
            key={vital.label}
            className={cn(
              'flex items-center gap-2 rounded-lg border border-gray-200/60 bg-gray-100/30 px-2.5 py-2 dark:border-gray-700/60 dark:bg-gray-800/30',
            )}
          >
            <Icon className={cn(
              'h-4 w-4 shrink-0',
              vitalColors[vital.status as keyof typeof vitalColors],
              vital.animate && vital.status !== 'healthy' && 'animate-pulse'
            )} />
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{vital.label}</p>
              <p className={cn('text-sm font-bold tabular-nums', vitalColors[vital.status as keyof typeof vitalColors])}>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={String(vital.value)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    {vital.value}
                  </motion.span>
                </AnimatePresence>
                <span className="ml-0.5 text-xs font-normal text-gray-500 dark:text-gray-400">{vital.unit}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BatteryIndicator({ battery, showLabel = true }: { battery: number; showLabel?: boolean }) {
  const color = battery > 50 
    ? 'bg-green-500 dark:bg-green-400' 
    : battery > 20 
    ? 'bg-orange-500 dark:bg-orange-400' 
    : 'bg-red-500 dark:bg-red-400';
  
  const textColor = battery > 50 
    ? 'text-green-500 dark:text-green-400' 
    : battery > 20 
    ? 'text-orange-500 dark:text-orange-400' 
    : 'text-red-500 dark:text-red-400';
  
  const borderColor = battery > 50 
    ? 'border-green-500 dark:border-green-400' 
    : battery > 20 
    ? 'border-orange-500 dark:border-orange-400' 
    : 'border-red-500 dark:border-red-400';

  return (
    <div className="flex items-center gap-2">
      <div className={cn('relative h-4 w-7 rounded-sm border-2 opacity-70', borderColor)}>
        <div 
          className={cn('absolute inset-0.5 rounded-[1px] transition-all', color)} 
          style={{ width: `${Math.max(battery, 4)}%` }} 
        />
        <div 
          className={cn('absolute -right-1 top-1/2 h-2 w-0.5 -translate-y-1/2 rounded-r', borderColor)} 
        />
      </div>
      {showLabel && <span className={cn('text-xs font-semibold tabular-nums', textColor)}>{Math.round(battery)}%</span>}
    </div>
  );
}

export function SignalIndicator({ signal }: { signal: number }) {
  const bars = signal > 75 ? 4 : signal > 50 ? 3 : signal > 25 ? 2 : 1;
  const colorClass = signal > 60 
    ? 'bg-green-500 dark:bg-green-400' 
    : signal > 30 
    ? 'bg-orange-500 dark:bg-orange-400' 
    : 'bg-red-500 dark:bg-red-400';
  
  const inactiveClass = 'bg-gray-300 dark:bg-gray-600';

  return (
    <div className="flex items-end gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'w-1 rounded-sm transition-all',
            i <= bars ? colorClass : inactiveClass,
            i === 1 && 'h-1.5',
            i === 2 && 'h-2.5',
            i === 3 && 'h-3.5',
            i === 4 && 'h-4'
          )}
        />
      ))}
    </div>
  );
}