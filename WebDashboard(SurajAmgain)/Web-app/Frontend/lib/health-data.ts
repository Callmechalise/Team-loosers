import type { VitalReading } from '@/types';

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateVitalHistory(
  residentId: string,
  hours: number,
  intervalMinutes: number
): VitalReading[] {
  const readings: VitalReading[] = [];
  const numPoints = Math.ceil((hours * 60) / intervalMinutes);
  const now = Date.now();
  const seedBase = residentId.charCodeAt(residentId.length - 1) || 1;

  for (let i = numPoints; i >= 0; i--) {
    const timestamp = now - i * intervalMinutes * 60 * 1000;
    const r = seededRandom(seedBase + i);
    const r2 = seededRandom(seedBase * 2 + i);
    const r3 = seededRandom(seedBase * 3 + i);
    const r4 = seededRandom(seedBase * 4 + i);
    const r5 = seededRandom(seedBase * 5 + i);

    const hourOfDay = new Date(timestamp).getHours();
    const isNight = hourOfDay >= 22 || hourOfDay < 6;
    const hrBase = isNight ? 58 : 75;
    const heartRate = Math.round(hrBase + r * 20 - 5);
    const temperature = parseFloat((36.6 + r2 * 0.8 - 0.3).toFixed(1));
    const systolic = Math.round(118 + r3 * 30 - 10);
    const diastolic = Math.round(76 + r4 * 18 - 6);
    const spo2 = Math.round(96 + r5 * 4 - 1);

    readings.push({ timestamp, heartRate, temperature, systolic, diastolic, spo2 });
  }
  return readings;
}

export function generateAlertTrend(days: number) {
  const trend = [];
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    trend.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      critical: Math.floor(Math.random() * 4),
      warning: Math.floor(Math.random() * 8) + 2,
      info: Math.floor(Math.random() * 6) + 1,
    });
  }
  return trend;
}

// In your health-data.ts or wherever generateBatteryDistribution is defined:

export function generateBatteryDistribution() {
  return [
    { name: 'Excellent (>80%)', value: Math.floor(Math.random() * 8) + 4, color: '#22C55E' },  // green-500
    { name: 'Good (60-80%)', value: Math.floor(Math.random() * 6) + 6, color: '#3B82F6' },    // blue-500
    { name: 'Fair (40-60%)', value: Math.floor(Math.random() * 5) + 5, color: '#F59E0B' },    // amber-500
    { name: 'Low (20-40%)', value: Math.floor(Math.random() * 4) + 3, color: '#F97316' },     // orange-500
    { name: 'Critical (<20%)', value: Math.floor(Math.random() * 3) + 1, color: '#EF4444' },  // red-500
  ];
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
