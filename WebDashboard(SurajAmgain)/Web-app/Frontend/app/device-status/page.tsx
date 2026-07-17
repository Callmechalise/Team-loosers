'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Watch,
  Search,
  Battery,
  Wifi,
  RefreshCw,
  Download,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { PageHeader, EmptyState } from '@/components/shared/page-components';
import { BatteryIndicator, SignalIndicator } from '@/components/shared/vital-display';
import { ConnectionBadge } from '@/components/shared/status-badges';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatTimeAgo } from '@/lib/health-data';

export default function DeviceStatusPage() {
  const { residents } = useIoTData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const devices = useMemo(
    () =>
      residents.map((r) => ({
        id: r.device.id,
        residentId: r.id,
        residentName: r.name,
        room: r.room,
        photo: r.photo,
        model: r.device.model,
        firmware: r.device.firmware,
        battery: r.vitals.battery,
        signal: r.vitals.signal,
        lastSync: r.vitals.lastUpdate,
        connection: (r.vitals.battery > 0 ? 'online' : 'offline') as 'online' | 'offline',
        status: r.status,
      })),
    [residents]
  );

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      const matchesSearch = !search || d.residentName.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || d.connection === filter || (filter === 'low-battery' && d.battery < 30);
      return matchesSearch && matchesFilter;
    });
  }, [devices, search, filter]);

  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter((d) => d.connection === 'online').length,
    offline: devices.filter((d) => d.connection === 'offline').length,
    lowBattery: devices.filter((d) => d.battery < 30).length,
  }), [devices]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Device Status"
        description="Monitor and manage all IoT wearable devices"
        icon={Watch}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-bold text-green-500 dark:text-green-400">{stats.online}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">/ {stats.total} online</span>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total Devices', value: stats.total, icon: Watch, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Online', value: stats.online, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Offline', value: stats.offline, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Low Battery', value: stats.lowBattery, icon: Battery, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', s.bg)}>
                <Icon className={cn('h-5 w-5', s.color)} />
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by device ID or resident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
            aria-label="Search devices"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: 'All' },
            { key: 'online', label: 'Online' },
            { key: 'offline', label: 'Offline' },
            { key: 'low-battery', label: 'Low Battery' },
          ].map((f) => (
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

      {/* Devices Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Watch} title="No devices found" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Device / Resident</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 lg:table-cell">Model</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 lg:table-cell">Firmware</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Battery</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 sm:table-cell">Signal</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 md:table-cell">Last Sync</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((d, idx) => (
                    <motion.tr
                      key={d.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={d.photo} alt={d.residentName} className="h-9 w-9 rounded-lg object-cover" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{d.residentName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{d.id} · Room {d.room}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-gray-400 lg:table-cell">{d.model}</td>
                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-gray-400 lg:table-cell">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono dark:bg-gray-700">{d.firmware}</span>
                      </td>
                      <td className="px-4 py-3">
                        <BatteryIndicator battery={d.battery} />
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <SignalIndicator signal={d.signal} />
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-gray-500 dark:text-gray-400 md:table-cell">{formatTimeAgo(d.lastSync)}</td>
                      <td className="px-4 py-3">
                        <ConnectionBadge status={d.connection} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toast.success('Device assigned', { description: `${d.id} → ${d.residentName}` })}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                            title="Assign Resident"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toast.success('Firmware update started', { description: `${d.id} — ${d.firmware}` })}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                            title="Update Firmware"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toast.success('Device restarting', { description: `${d.id} — ${d.model}` })}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                            title="Restart Device"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}