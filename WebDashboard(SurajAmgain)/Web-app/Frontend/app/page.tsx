'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, HeartPulse, Siren, Watch, Ambulance, PersonStanding, Heart, Thermometer, Activity, Battery, ArrowRight, Check, Pill, ClipboardList, User, FileBarChart, Phone, Bell, } from 'lucide-react';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { StatCard } from '@/components/shared/stat-card';
import { ChartCard, PageHeader } from '@/components/shared/page-components';
import { TrendAreaChart, MultiLineChart, MultiBarChart, DonutChart } from '@/components/shared/charts';
import { StatusBadge } from '@/components/shared/status-badges';
import { BatteryIndicator, SignalIndicator } from '@/components/shared/vital-display';
import { ALERT_CONFIG } from '@/lib/constants';
import { generateVitalHistory, generateAlertTrend, generateBatteryDistribution, formatTimeAgo } from '@/lib/health-data';
import { CARETAKER_PROFILE } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import { LayoutDashboard } from 'lucide-react';

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  check: Check,
  pill: Pill,
  clipboard: ClipboardList,
  user: User,
  chart: FileBarChart,
  watch: Watch,
  phone: Phone,
  bell: Bell,
};

export default function DashboardPage() {
  const { residents, alerts, activities, notifications, isConnected, lastSync } = useIoTData();

  const stats = useMemo(() => {
    const healthy = residents.filter((r) => r.status === 'healthy').length;
    const activeAlerts = alerts.filter((a) => !a.acknowledged).length;
    const devicesOnline = residents.filter((r) => r.vitals.battery > 0).length;
    const emergency = residents.filter((r) => r.status === 'emergency').length;
    const fallsToday = alerts.filter((a) => a.type === 'fall-detected' && Date.now() - a.time < 86400000).length;
    return {
      total: residents.length,
      healthy,
      activeAlerts,
      devicesOnline,
      emergency,
      fallsToday,
    };
  }, [residents, alerts]);

  const heartRateData = useMemo(() => {
    return residents
      .filter((r) => r.status === 'emergency' || r.status === 'warning')
      .slice(0, 4)
      .flatMap((r) => {
        const history = generateVitalHistory(r.id, 24, 60);
        return history.slice(-12).map((h) => ({
          time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          [r.name.split(' ')[0]]: h.heartRate,
        }));
      })
      .reduce((acc, cur) => {
        const existing = acc.find((a) => a.time === cur.time);
        if (existing) Object.assign(existing, cur);
        else acc.push(cur);
        return acc;
      }, [] as Array<Record<string, any>>);
  }, [residents]);

  const tempData = useMemo(() => {
    const history = generateVitalHistory('res-001', 24, 120);
    return history.slice(-12).map((h) => ({
      time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      temperature: h.temperature,
    }));
  }, []);

  const bpData = useMemo(() => {
    const history = generateVitalHistory('res-002', 24, 120);
    return history.slice(-12).map((h) => ({
      time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      systolic: h.systolic,
      diastolic: h.diastolic,
    }));
  }, []);

  const alertTrend = useMemo(() => generateAlertTrend(7), []);
  const batteryDist = useMemo(() => generateBatteryDistribution(), []);
console.log(batteryDist);
  const recentAlerts = useMemo(
    () => [...alerts].sort((a, b) => b.time - a.time).slice(0, 6),
    [alerts]
  );

  const liveDevices = useMemo(
    () => [...residents].sort((a, b) => a.vitals.battery - b.vitals.battery).slice(0, 6),
    [residents]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${CARETAKER_PROFILE.name.split(' ')[0]} — here's your facility overview`}
        icon={LayoutDashboard}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <span className={cn('relative flex h-2 w-2')}>
              {isConnected && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75 dark:bg-green-400" />}
              <span className={cn('relative inline-flex h-2 w-2 rounded-full', isConnected ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400')} />
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {isConnected ? 'Live · Synced' : 'Reconnecting...'}
            </span>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-3">
        <StatCard label="Active Alerts" value={stats.activeAlerts} icon={Siren} color="warning" trend={-8} trendLabel="vs yesterday" index={2} />
        <StatCard label="Emergency" value={stats.emergency} icon={Ambulance} color="destructive" index={4} />
        <StatCard label="Falls Today" value={stats.fallsToday} icon={PersonStanding} color="destructive" index={5} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Heart Rate Trends"
          description="At-risk residents — last 12 hours"
          icon={Heart}
          action={<Link href="/live-monitoring" className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">View live</Link>}
        >
          <TrendAreaChart data={heartRateData} dataKey={Object.keys(heartRateData[0] || { time: '' }).filter((k) => k !== 'time')[0] || 'time'} color="#EF4444" xKey="time" unit=" BPM" height={220} />
        </ChartCard>

        <ChartCard
          title="Blood Pressure Trends"
          description="Systolic vs Diastolic — last 12 hours"
          icon={Activity}
        >
          <MultiLineChart
            data={bpData}
            xKey="time"
            lines={[
              {
                key: 'systolic',
                color: '#2563EB', // blue-600
                name: 'Systolic',
              },
              {
                key: 'diastolic',
                color: '#DC2626', // red-600
                name: 'Diastolic',
              },
            ]}
            height={220}
          />
        </ChartCard>

        <ChartCard
          title="Emergency Alerts — Last 7 Days"
          description="Alerts by severity per day"
          icon={Siren}
        >
          <MultiBarChart
            data={alertTrend}
            xKey="label"
            bars={[
              { key: 'critical', color: '#ef4444', name: 'Critical' },
              { key: 'warning', color: '#f59e0b', name: 'Warning' },
              { key: 'info', color: '#3b82f6', name: 'Info' },
            ]}
            stacked
            height={220}
          />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Device Battery Status"
          description="Distribution across all devices"
          icon={Battery}
          className="lg:col-span-1"
        >
          <DonutChart data={batteryDist} height={220} />
          <div className="mt-3 space-y-1.5">
            {batteryDist.map((b) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
                  <span className="text-gray-500 dark:text-gray-400">{b.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{b.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Recent Alerts */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <Siren className="h-5 w-5 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Alerts</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Latest emergency and warning alerts</p>
              </div>
            </div>
            <Link href="/emergency-alerts" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentAlerts.map((alert, idx) => {
              const config = ALERT_CONFIG[alert.type];
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border border-gray-200/60 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-700/50',
                    !alert.acknowledged && config.severity === 'critical' && 'border-red-200/30 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/20'
                  )}
                >
                  <img src={alert.photo} alt={alert.residentName} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{alert.residentName}</p>
                      <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold', config.bgColor, config.color)}>
                        {config.label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{alert.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(alert.time)}</p>
                    {alert.acknowledged ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-500 dark:text-green-400">
                        <Check className="h-3 w-3" /> Acked
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-orange-500 dark:text-orange-400">Pending</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activities & Live Device Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Caretaker actions and events</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {activities.slice(0, 6).map((act, idx) => {
              const Icon = ACTIVITY_ICONS[act.icon] || Check;
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">{act.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{act.actor} · {formatTimeAgo(act.time)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Live Device Status */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Watch className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live Device Status</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Lowest battery levels first</p>
              </div>
            </div>
            <Link href="/device-status" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {liveDevices.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 rounded-xl border border-gray-200/60 p-2.5 dark:border-gray-700/60"
              >
                <img src={r.photo} alt={r.name} className="h-8 w-8 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Room {r.room} · {r.device.model}</p>
                </div>
                <div className="flex items-center gap-3">
                  <SignalIndicator signal={r.vitals.signal} />
                  <BatteryIndicator battery={r.vitals.battery} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}