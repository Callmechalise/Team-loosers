'use client';

import { useState, useMemo, use } from 'react';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Thermometer, Activity, Droplet, Footprints, Moon, MapPin, Phone, Mail, Watch, Pill, Clock, Calendar, User, Shield, Siren, Check, Stethoscope, Battery, Wifi} from 'lucide-react';
import Link from 'next/link';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { PageHeader, ChartCard } from '@/components/shared/page-components';
import { StatusBadge, ConnectionBadge, MovementBadge, SeverityBadge } from '@/components/shared/status-badges';
import { VitalRow, BatteryIndicator, SignalIndicator } from '@/components/shared/vital-display';
import { TrendAreaChart, MultiLineChart } from '@/components/shared/charts';
import { generateVitalHistory, formatTimeAgo } from '@/lib/health-data';
import { ALERT_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TIME_RANGES = [
  { key: '24h', label: '24 Hours', hours: 24, interval: 60 },
  { key: '7d', label: '7 Days', hours: 168, interval: 360 },
  { key: '30d', label: '30 Days', hours: 720, interval: 1440 },
];

export default function ResidentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { residents, alerts } = useIoTData();
  const [timeRange, setTimeRange] = useState('24h');

  const resident = residents.find((r) => r.id === id);
  if (!resident) notFound();

  const range = TIME_RANGES.find((t) => t.key === timeRange)!;

  const history = useMemo(
    () => generateVitalHistory(resident.id, range.hours, range.interval),
    [resident.id, range]
  );

  const chartData = history.map((h) => ({
    time: new Date(h.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    heartRate: h.heartRate,
    temperature: h.temperature,
    systolic: h.systolic,
    diastolic: h.diastolic,
    spo2: h.spo2,
    activity: Math.floor(Math.random() * 100),
    sleep: Math.floor(Math.random() * 8),
  }));

  const residentAlerts = useMemo(
    () => alerts.filter((a) => a.residentId === resident.id).sort((a, b) => b.time - a.time).slice(0, 8),
    [alerts, resident.id]
  );

  const vitalSummary = [
    { icon: Heart, label: 'Heart Rate', value: resident.vitals.heartRate, unit: 'BPM', color: 'text-destructive' },
    { icon: Thermometer, label: 'Temperature', value: resident.vitals.temperature, unit: '°C', color: 'text-warning' },
    { icon: Activity, label: 'Blood Pressure', value: `${resident.vitals.systolic}/${resident.vitals.diastolic}`, unit: 'mmHg', color: 'text-primary' },
    { icon: Droplet, label: 'SpO₂', value: resident.vitals.spo2, unit: '%', color: 'text-info' },
  ];

  return (
    <div className="space-y-6">
      <Link href="/residents" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Residents
      </Link>

      <PageHeader
        title={resident.name}
        description={`${resident.age} years · ${resident.gender} · Room ${resident.room}${resident.bed} · ${resident.building}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={resident.status} />
            <ConnectionBadge status={resident.vitals.battery > 0 ? 'online' : 'offline'} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <img src={resident.photo} alt={resident.name} className="h-28 w-28 rounded-3xl object-cover ring-4 ring-primary/10" />
            <h2 className="mt-4 text-xl font-bold text-foreground">{resident.name}</h2>
            <p className="text-sm text-muted-foreground">{resident.assignedCaretaker}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {resident.medicalConditions.map((c) => (
                <span key={c} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground">Current Vitals</h3>
            <div className="grid grid-cols-2 gap-2">
              {vitalSummary.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.label} className="rounded-xl border border-border/60 bg-secondary/30 p-3">
                    <Icon className={cn('h-4 w-4', v.color)} />
                    <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{v.label}</p>
                    <p className={cn('text-lg font-bold tabular-nums', v.color)}>
                      {v.value}<span className="text-xs font-normal text-muted-foreground"> {v.unit}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'Age', value: `${resident.age} years` },
              { label: 'Gender', value: resident.gender === 'male' ? 'Male' : 'Female' },
              { label: 'Room', value: `${resident.room}${resident.bed}` },
              { label: 'Building', value: resident.building },
              { label: 'Floor', value: resident.floor },
              { label: 'Admitted', value: new Date(resident.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
              { label: 'Allergies', value: resident.allergies.join(', ') || 'None' },
              { label: 'Current Location', value: resident.indoorLocation },
              { label: 'Assigned Caretaker', value: resident.assignedCaretaker },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Emergency Contacts</h3>
            <div className="space-y-2">
              {resident.emergencyContacts.map((ec) => (
                <div key={ec.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{ec.name}</p>
                    <p className="text-xs text-muted-foreground">{ec.relationship}</p>
                  </div>
                  <button
                    onClick={() => toast.success(`Calling ${ec.name}`, { description: ec.phone })}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    {ec.phone}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-soft w-fit">
        {TIME_RANGES.map((t) => (
          <button
            key={t.key}
            onClick={() => setTimeRange(t.key)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
              timeRange === t.key ? 'bg-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:bg-accent'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Heart Rate" description={`${range.label} trend`} icon={Heart}>
          <TrendAreaChart data={chartData} dataKey="heartRate" color="hsl(var(--chart-4))" xKey="time" unit=" BPM" height={200} />
        </ChartCard>
        <ChartCard title="Blood Pressure" description={`${range.label} trend`} icon={Activity}>
          <MultiLineChart data={chartData} xKey="time" lines={[
            { key: 'systolic', color: 'hsl(var(--chart-1))', name: 'Systolic' },
            { key: 'diastolic', color: 'hsl(var(--chart-2))', name: 'Diastolic' },
          ]} height={200} />
        </ChartCard>
        <ChartCard title="Body Temperature" description={`${range.label} trend`} icon={Thermometer}>
          <TrendAreaChart data={chartData} dataKey="temperature" color="hsl(var(--chart-3))" xKey="time" unit="°C" height={200} />
        </ChartCard>
        <ChartCard title="Blood Oxygen (SpO₂)" description={`${range.label} trend`} icon={Droplet}>
          <TrendAreaChart data={chartData} dataKey="spo2" color="hsl(var(--chart-5))" xKey="time" unit="%" height={200} />
        </ChartCard>
        <ChartCard title="Activity Level" description={`${range.label} trend`} icon={Footprints}>
          <TrendAreaChart data={chartData} dataKey="activity" color="hsl(var(--chart-2))" xKey="time" unit="%" height={200} />
        </ChartCard>
        <ChartCard title="Sleep Hours" description={`${range.label} trend`} icon={Moon}>
          <TrendAreaChart data={chartData} dataKey="sleep" color="hsl(var(--chart-1))" xKey="time" unit="h" height={200} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2.5">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Medical History</h3>
          </div>
          <div className="space-y-3">
            {resident.medicalHistory.map((mh) => (
              <div key={mh.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-semibold text-foreground">{mh.condition}</p>
                <p className="text-xs text-muted-foreground">Diagnosed: {new Date(mh.diagnosedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                <p className="text-xs text-muted-foreground">{mh.notes}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2.5">
            <Pill className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Medication Schedule</h3>
          </div>
          <div className="space-y-2">
            {resident.medications.map((med) => (
              <div key={med.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', med.taken ? 'bg-success/10' : 'bg-warning/10')}>
                  {med.taken ? <Check className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-warning" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{med.name} <span className="text-muted-foreground">{med.dosage}</span></p>
                  <p className="text-xs text-muted-foreground">{med.schedule} · {med.time}</p>
                </div>
                <span className={cn('text-xs font-medium', med.taken ? 'text-success' : 'text-warning')}>
                  {med.taken ? 'Taken' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2.5">
            <Watch className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Wearable Device</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
              <span className="text-xs text-muted-foreground">Device ID</span>
              <span className="text-sm font-semibold text-foreground">{resident.device.id}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
              <span className="text-xs text-muted-foreground">Model</span>
              <span className="text-sm font-semibold text-foreground">{resident.device.model}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
              <span className="text-xs text-muted-foreground">Firmware</span>
              <span className="text-sm font-semibold text-foreground">{resident.device.firmware}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
              <span className="text-xs text-muted-foreground">Battery</span>
              <BatteryIndicator battery={resident.vitals.battery} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
              <span className="text-xs text-muted-foreground">Signal</span>
              <SignalIndicator signal={resident.vitals.signal} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
              <span className="text-xs text-muted-foreground">Last Sync</span>
              <span className="text-sm font-semibold text-foreground">{formatTimeAgo(resident.vitals.lastUpdate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2.5">
          <Siren className="h-5 w-5 text-destructive" />
          <h3 className="text-sm font-semibold text-foreground">Recent Alerts</h3>
        </div>
        {residentAlerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No recent alerts for this resident.</p>
        ) : (
          <div className="space-y-2">
            {residentAlerts.map((alert) => {
              const config = ALERT_CONFIG[alert.type];
              return (
                <div key={alert.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
                  <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', config.bgColor)}>
                    <Siren className={cn('h-4 w-4', config.color)} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{config.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(alert.time)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
