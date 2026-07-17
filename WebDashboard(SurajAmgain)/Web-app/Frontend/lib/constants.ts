import {
  LayoutDashboard,
  Users,
  Activity,
  Siren,
  HeartPulse,
  PersonStanding,
  Watch,
  FileBarChart,
  Bell,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: 'activeAlerts' | 'emergencyCases' | 'fallsToday' | 'unreadNotifications';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Live Monitoring', href: '/live-monitoring', icon: Activity },
  { label: 'Emergency Alerts', href: '/emergency-alerts', icon: Siren, badgeKey: 'activeAlerts' },
  { label: 'Health History', href: '/health-history', icon: HeartPulse },
  { label: 'Fall Detection', href: '/fall-detection', icon: PersonStanding, badgeKey: 'fallsToday' },
  { label: 'Device Status', href: '/device-status', icon: Watch },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
  { label: 'Notifications', href: '/notifications', icon: Bell, badgeKey: 'unreadNotifications' },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const ALERT_CONFIG: Record<
  AlertType,
  { label: string; severity: AlertSeverity; color: string; bgColor: string }
> = {
  'heart-rate-high': {
    label: 'High Heart Rate',
    severity: 'critical',
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  'heart-rate-low': {
    label: 'Low Heart Rate',
    severity: 'critical',
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  'temperature-high': {
    label: 'High Temperature',
    severity: 'warning',
    color: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'temperature-low': {
    label: 'Low Temperature',
    severity: 'warning',
    color: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'bp-high': {
    label: 'High Blood Pressure',
    severity: 'warning',
    color: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'bp-low': {
    label: 'Low Blood Pressure',
    severity: 'warning',
    color: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'fall-detected': {
    label: 'Fall Detected',
    severity: 'critical',
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  'no-movement': {
    label: 'No Movement Detected',
    severity: 'warning',
    color: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'device-disconnected': {
    label: 'Device Disconnected',
    severity: 'warning',
    color: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  'low-battery': {
    label: 'Low Battery',
    severity: 'info',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  'spo2-low': {
    label: 'Low Oxygen Level',
    severity: 'critical',
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  'left-bed': {
    label: 'Resident Left Bed',
    severity: 'info',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
};

export const STATUS_CONFIG: Record<
  HealthStatus,
  { label: string; color: string; bgColor: string; dot: string }
> = {
  healthy: {
    label: 'Healthy',
    color: 'text-green-500 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    dot: 'bg-green-500 dark:bg-green-400',
  },
  warning: {
    label: 'Needs Attention',
    color: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    dot: 'bg-orange-500 dark:bg-orange-400',
  },
  emergency: {
    label: 'Emergency',
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    dot: 'bg-red-500 dark:bg-red-400',
  },
};

export const MOVEMENT_CONFIG: Record<MovementStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-green-500 dark:text-green-400' },
  resting: { label: 'Resting', color: 'text-blue-600 dark:text-blue-400' },
  sleeping: { label: 'Sleeping', color: 'text-gray-400 dark:text-gray-500' },
  'no-movement': { label: 'No Movement', color: 'text-red-500 dark:text-red-400' },
};

export const VITAL_RANGES = {
  heartRate: { min: 60, max: 100, criticalMin: 45, criticalMax: 130 },
  temperature: { min: 36.1, max: 37.2, criticalMin: 35.0, criticalMax: 38.5 },
  systolic: { min: 90, max: 130, criticalMin: 80, criticalMax: 160 },
  diastolic: { min: 60, max: 85, criticalMin: 50, criticalMax: 100 },
  spo2: { min: 95, max: 100, criticalMin: 88, criticalMax: 100 },
};

import type { AlertType, AlertSeverity, HealthStatus, MovementStatus } from '@/types';