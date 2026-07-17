import { cn } from '@/lib/utils';
import { STATUS_CONFIG } from '@/lib/constants';
import type { HealthStatus, ConnectionStatus, MovementStatus } from '@/types';

export function StatusBadge({ status, size = 'default' }: { status: HealthStatus; size?: 'sm' | 'default' }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        config.bgColor,
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot, status === 'emergency' && 'animate-pulse')} />
      {config.label}
    </span>
  );
}

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        status === 'online' 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
      )}
    >
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        status === 'online' 
          ? 'bg-green-500 dark:bg-green-400' 
          : 'bg-gray-400 dark:bg-gray-500'
      )} />
      {status === 'online' ? 'Online' : 'Offline'}
    </span>
  );
}

export function MovementBadge({ status }: { status: MovementStatus }) {
  const colors: Record<MovementStatus, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    resting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    sleeping: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    'no-movement': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  const labels: Record<MovementStatus, string> = {
    active: 'Active',
    resting: 'Resting',
    sleeping: 'Sleeping',
    'no-movement': 'No Movement',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium', colors[status])}>
      {labels[status]}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: 'critical' | 'warning' | 'info' }) {
  const config = {
    critical: { 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-700 dark:text-red-400', 
      label: 'Critical' 
    },
    warning: { 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      text: 'text-orange-700 dark:text-orange-400', 
      label: 'Warning' 
    },
    info: { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      text: 'text-blue-700 dark:text-blue-400', 
      label: 'Info' 
    },
  }[severity];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', config.bg, config.text)}>
      {config.label}
    </span>
  );
}