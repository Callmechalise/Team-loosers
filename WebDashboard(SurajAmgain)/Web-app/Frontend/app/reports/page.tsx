'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {FileBarChart, FileText, FileSpreadsheet, Calendar, TrendingUp, Heart, Thermometer, Siren, PersonStanding, Watch, Sparkles} from 'lucide-react';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { PageHeader, ChartCard } from '@/components/shared/page-components';
import { TrendAreaChart, MultiBarChart, DonutChart, MultiLineChart } from '@/components/shared/charts';
import { generateAlertTrend, generateBatteryDistribution } from '@/lib/health-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const REPORT_TYPES = [
  { key: 'daily', label: 'Daily Report', icon: Calendar, desc: 'Today\u2019s overview' },
  { key: 'weekly', label: 'Weekly Report', icon: TrendingUp, desc: 'Last 7 days' },
  { key: 'monthly', label: 'Monthly Report', icon: FileBarChart, desc: 'Last 30 days' },
];

export default function ReportsPage() {
  const { residents, alerts, fallEvents } = useIoTData();
  const [reportType, setReportType] = useState('weekly');
  const [generating, setGenerating] = useState(false);

  const days = reportType === 'daily' ? 1 : reportType === 'weekly' ? 7 : 30;

  const healthTrend = useMemo(() => {
    const data = [];
    const points = reportType === 'daily' ? 24 : reportType === 'weekly' ? 7 : 30;
    for (let i = points; i >= 0; i--) {
      data.push({
        label: reportType === 'daily'
          ? `${i}h`
          : new Date(Date.now() - i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgHR: Math.round(72 + Math.random() * 12 - 6),
        avgTemp: parseFloat((36.7 + Math.random() * 0.6 - 0.3).toFixed(1)),
      });
    }
    return data;
  }, [reportType]);

  const alertTrend = useMemo(() => generateAlertTrend(days), [days]);
  const batteryDist = useMemo(() => generateBatteryDistribution(), []);
  const fallTrend = useMemo(() => {
    const data = [];
    const points = reportType === 'daily' ? 24 : reportType === 'weekly' ? 7 : 30;
    for (let i = points; i >= 0; i--) {
      data.push({
        label: reportType === 'daily'
          ? `${i}h`
          : new Date(Date.now() - i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        falls: Math.floor(Math.random() * 3),
      });
    }
    return data;
  }, [reportType]);

  const devicePerf = useMemo(() => {
    const data = [];
    const points = reportType === 'daily' ? 24 : reportType === 'weekly' ? 7 : 30;
    for (let i = points; i >= 0; i--) {
      data.push({
        label: reportType === 'daily'
          ? `${i}h`
          : new Date(Date.now() - i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uptime: Math.round(95 + Math.random() * 5),
        syncs: Math.round(800 + Math.random() * 200),
      });
    }
    return data;
  }, [reportType]);

  const summaryStats = useMemo(() => ({
    avgHR: Math.round(residents.reduce((sum, r) => sum + r.vitals.heartRate, 0) / residents.length),
    avgTemp: parseFloat((residents.reduce((sum, r) => sum + r.vitals.temperature, 0) / residents.length).toFixed(1)),
    totalAlerts: alerts.length,
    totalFalls: fallEvents.length,
  }), [residents, alerts, fallEvents]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success(`${REPORT_TYPES.find((r) => r.key === reportType)?.label} generated`, {
        description: 'Report is ready for download.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and export comprehensive health and device reports"
        icon={FileBarChart}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Exporting to PDF', { description: `${REPORT_TYPES.find((r) => r.key === reportType)?.label}` })}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <FileText className="h-4 w-4 text-red-500 dark:text-red-400" /> PDF
            </button>
            <button
              onClick={() => toast.success('Exporting to Excel', { description: `${REPORT_TYPES.find((r) => r.key === reportType)?.label}` })}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-500 dark:text-green-400" /> Excel
            </button>
          </div>
        }
      />

      {/* Report Type Selector */}
      <div className="grid gap-3 sm:grid-cols-3">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          const isActive = reportType === rt.key;
          return (
            <button
              key={rt.key}
              onClick={() => setReportType(rt.key)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                isActive 
                  ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-600/20 ring-1 ring-blue-600/30 dark:border-blue-500 dark:bg-blue-900/20 dark:shadow-blue-500/20' 
                  : 'border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50'
              )}
            >
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                isActive 
                  ? 'bg-blue-600 text-white dark:bg-blue-500' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={cn(
                  'text-sm font-bold',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                )}>{rt.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{rt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Avg Heart Rate', value: `${summaryStats.avgHR}`, unit: 'BPM', icon: Heart, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Avg Temperature', value: `${summaryStats.avgTemp}`, unit: '°C', icon: Thermometer, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
          { label: 'Total Alerts', value: `${summaryStats.totalAlerts}`, unit: '', icon: Siren, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Total Falls', value: `${summaryStats.totalFalls}`, unit: '', icon: PersonStanding, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', s.bg)}>
                <Icon className={cn('h-5 w-5', s.color)} />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                {s.value}<span className="text-sm font-normal text-gray-500 dark:text-gray-400"> {s.unit}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Generate Report Button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:shadow-blue-500/30 dark:hover:bg-blue-600"
      >
        <Sparkles className={cn('h-4 w-4', generating && 'animate-spin')} />
        {generating ? 'Generating report...' : `Generate ${REPORT_TYPES.find((r) => r.key === reportType)?.label}`}
      </button>

      {/* Charts Grid with explicit colors */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Health Trends" description="Average heart rate over period" icon={Heart}>
          <TrendAreaChart 
            data={healthTrend} 
            dataKey="avgHR" 
            color="#EC4899" // Pink-500 for heart rate
            xKey="label" 
            unit=" BPM" 
            height={200} 
          />
        </ChartCard>
        
        <ChartCard title="Emergency Trends" description="Alerts by severity" icon={Siren}>
          <MultiBarChart 
            data={alertTrend} 
            xKey="label" 
            bars={[
              { key: 'critical', color: '#EF4444', name: 'Critical' }, // Red-500
              { key: 'warning', color: '#F59E0B', name: 'Warning' },   // Amber-500
              { key: 'info', color: '#3B82F6', name: 'Info' },         // Blue-500
            ]} 
            stacked 
            height={200} 
          />
        </ChartCard>
        
        <ChartCard title="Average Temperature" description="Facility-wide temperature trend" icon={Thermometer}>
          <TrendAreaChart 
            data={healthTrend} 
            dataKey="avgTemp" 
            color="#F59E0B" // Amber-500 for temperature
            xKey="label" 
            unit="°C" 
            height={200} 
          />
        </ChartCard>
        
        <ChartCard title="Falls Report" description="Fall incidents over period" icon={PersonStanding}>
          <MultiBarChart 
            data={fallTrend} 
            xKey="label" 
            bars={[
              { key: 'falls', color: '#EF4444', name: 'Falls' } // Red-500
            ]} 
            height={200} 
          />
        </ChartCard>
        
        <ChartCard title="Device Performance" description="Uptime and sync activity" icon={Watch}>
          <MultiLineChart 
            data={devicePerf} 
            xKey="label" 
            lines={[
              { key: 'uptime', color: '#22C55E', name: 'Uptime %' }, // Green-500
            ]} 
            height={200} 
          />
        </ChartCard>
        
        <ChartCard title="Battery Distribution" description="Device battery levels" icon={Watch}>
          <DonutChart data={batteryDist} height={200} />
        </ChartCard>
      </div>
    </div>
  );
}