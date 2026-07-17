'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Search, Heart, Thermometer, Activity, Droplet } from 'lucide-react';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { PageHeader, ChartCard, EmptyState } from '@/components/shared/page-components';
import { TrendAreaChart, MultiLineChart } from '@/components/shared/charts';
import { StatusBadge } from '@/components/shared/status-badges';
import { generateVitalHistory } from '@/lib/health-data';
import { cn } from '@/lib/utils';

const TIME_RANGES = [
  { key: '24h', label: '24H', hours: 24, interval: 60 },
  { key: '7d', label: '7D', hours: 168, interval: 360 },
  { key: '30d', label: '30D', hours: 720, interval: 1440 },
];

export default function HealthHistoryPage() {
  const { residents } = useIoTData();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(residents[0]?.id || '');
  const [timeRange, setTimeRange] = useState('24h');

  const filtered = useMemo(
    () => residents.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase())),
    [residents, search]
  );

  const selected = residents.find((r) => r.id === selectedId) || residents[0];
  const range = TIME_RANGES.find((t) => t.key === timeRange)!;

  const chartData = useMemo(() => {
    if (!selected) return [];
    const history = generateVitalHistory(selected.id, range.hours, range.interval);
    return history.map((h) => ({
      time: new Date(h.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      heartRate: h.heartRate,
      temperature: h.temperature,
      systolic: h.systolic,
      diastolic: h.diastolic,
      spo2: h.spo2,
    }));
  }, [selected, range]);

  if (!selected) return <EmptyState icon={HeartPulse} title="No residents" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health History"
        description="Historical vital signs and health trends"
        icon={HeartPulse}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Resident List Sidebar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search resident..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-blue-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-500"
              aria-label="Search"
            />
          </div>
          <div className="max-h-[500px] space-y-1 overflow-y-auto">
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors',
                  selectedId === r.id 
                    ? 'bg-blue-100 ring-1 ring-blue-300 dark:bg-blue-900/30 dark:ring-blue-700' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <img src={r.photo} alt={r.name} className="h-8 w-8 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Room {r.room}</p>
                </div>
                <span className={cn(
                  'h-2 w-2 rounded-full',
                  r.status === 'healthy' 
                    ? 'bg-green-500 dark:bg-green-400' 
                    : r.status === 'warning' 
                    ? 'bg-orange-500 dark:bg-orange-400' 
                    : 'bg-red-500 dark:bg-red-400'
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Resident Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img src={selected.photo} alt={selected.name} className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selected.age} years · Room {selected.room}</p>
              </div>
              <StatusBadge status={selected.status} size="sm" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              {TIME_RANGES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTimeRange(t.key)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    timeRange === t.key 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 dark:bg-blue-500' 
                      : 'text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Charts Grid with explicit colors */}
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Heart Rate" icon={Heart} description={`${range.label} history`}>
              <TrendAreaChart 
                data={chartData} 
                dataKey="heartRate" 
                color="#EC4899" // Pink-500 for heart rate
                xKey="time" 
                unit=" BPM" 
                height={200} 
              />
            </ChartCard>
            <ChartCard title="Blood Pressure" icon={Activity} description={`${range.label} history`}>
              <MultiLineChart 
                data={chartData} 
                xKey="time" 
                lines={[
                  { key: 'systolic', color: '#EF4444', name: 'Systolic' }, // Red-500
                  { key: 'diastolic', color: '#3B82F6', name: 'Diastolic' }, // Blue-500
                ]} 
                height={200} 
              />
            </ChartCard>
            <ChartCard title="Body Temperature" icon={Thermometer} description={`${range.label} history`}>
              <TrendAreaChart 
                data={chartData} 
                dataKey="temperature" 
                color="#F59E0B" // Amber-500 for temperature
                xKey="time" 
                unit="°C" 
                height={200} 
              />
            </ChartCard>
            <ChartCard title="Blood Oxygen" icon={Droplet} description={`${range.label} history`}>
              <TrendAreaChart 
                data={chartData} 
                dataKey="spo2" 
                color="#06B6D4" // Cyan-500 for oxygen
                xKey="time" 
                unit="%" 
                height={200} 
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}