// components/providers/iot-data-provider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type {
  Resident,
  AlertEvent,
  FallEvent,
  NotificationItem,
  ActivityEvent,
  HealthStatus,
  MovementStatus,
  AlertType,
  AlertSeverity,
} from '@/types';
import { api } from '@/lib/api';
import { ALERT_CONFIG } from '@/lib/constants';

interface IoTDataContextValue {
  residents: Resident[];
  alerts: AlertEvent[];
  fallEvents: FallEvent[];
  notifications: NotificationItem[];
  activities: ActivityEvent[];
  isConnected: boolean;
  lastSync: number;
  loading: boolean;
  refreshData: () => Promise<void>;
  acknowledgeAlert: (alertId: string, caretakerName: string) => Promise<void>;
  callResident: (alertId: string) => void;
  callDoctor: (alertId: string) => void;
  notifyFamily: (alertId: string) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  resolveFall: (fallId: string) => Promise<void>;
  startFallResponse: (fallId: string) => Promise<void>;
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'time'>) => void;
}

const IoTDataContext = createContext<IoTDataContextValue | null>(null);

// Helper functions for generating mock data when backend is unavailable
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function driftValue(current: number, range: number, min: number, max: number) {
  const next = current + (Math.random() - 0.5) * range;
  return clamp(Math.round(next), min, max);
}

function driftFloat(current: number, range: number, min: number, max: number, decimals = 1) {
  const next = current + (Math.random() - 0.5) * range;
  return parseFloat(clamp(next, min, max).toFixed(decimals));
}

const MOVEMENTS: MovementStatus[] = ['active', 'resting', 'sleeping'];

export function IoTDataProvider({ children }: { children: React.ReactNode }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [fallEvents, setFallEvents] = useState<FallEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(Date.now());

  const residentsRef = useRef(residents);
  residentsRef.current = residents;

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [residentsData, alertsData, activitiesData, notificationsData] = await Promise.all([
        api.getResidents(),
        api.getAlerts(),
        api.getRecentActivities(10),
        api.getNotifications(),
      ]);

      setResidents(residentsData);
      setAlerts(alertsData);
      setActivities(activitiesData);
      setNotifications(notificationsData);
      setIsConnected(true);
      setLastSync(Date.now());
    } catch (error) {
      console.error('Error fetching data from backend:', error);
      setIsConnected(false);
      
      // Fallback to mock data if backend is unavailable
      // You can import mock data here if needed
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isConnected) {
        try {
          const [residentsData, alertsData] = await Promise.all([
            api.getResidents(),
            api.getAlerts(),
          ]);
          setResidents(residentsData);
          setAlerts(alertsData);
          setLastSync(Date.now());
        } catch (error) {
          console.error('Error refreshing data:', error);
          setIsConnected(false);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Simulate vitals updates (if backend doesn't provide real-time updates)
  useEffect(() => {
    if (!isConnected || residents.length === 0) return;

    const vitalsTimer = setInterval(() => {
      setResidents((prev) =>
        prev.map((r) => {
          if (r.vitals.battery <= 0) return r;
          const v = r.vitals;
          const newHR = driftValue(v.heartRate, 4, 40, 160);
          const newTemp = driftFloat(v.temperature, 0.3, 35.0, 39.5);
          const newSys = driftValue(v.systolic, 5, 75, 190);
          const newDia = driftValue(v.diastolic, 3, 45, 115);
          const newSpo2 = driftValue(v.spo2, 2, 82, 100);
          const newBattery = clamp(v.battery - (Math.random() < 0.15 ? 1 : 0), 0, 100);
          const newSteps = v.steps + (Math.random() < 0.4 ? Math.floor(Math.random() * 12) : 0);
          const movementRoll = Math.random();
          const newMovement: MovementStatus =
            movementRoll < 0.5 ? v.movement : MOVEMENTS[Math.floor(Math.random() * MOVEMENTS.length)];

          return {
            ...r,
            vitals: {
              ...v,
              heartRate: newHR,
              temperature: newTemp,
              systolic: newSys,
              diastolic: newDia,
              spo2: newSpo2,
              battery: newBattery,
              steps: newSteps,
              movement: newMovement,
              lastUpdate: Date.now(),
            },
          };
        })
      );
    }, 5000);

    return () => clearInterval(vitalsTimer);
  }, [isConnected, residents.length]);

  // Push notification (local)
  const pushNotification = useCallback(
    (type: NotificationItem['type'], title: string, message: string, residentId?: string, residentName?: string) => {
      const n: NotificationItem = {
        id: `ntf-${Date.now()}`,
        type,
        title,
        message,
        time: Date.now(),
        read: false,
        residentId,
        residentName,
      };
      setNotifications((prev) => [n, ...prev].slice(0, 50));
    },
    []
  );

  // Push alert (local)
  const pushAlert = useCallback(
    (resident: Resident, type: AlertType, message: string) => {
      const severity: AlertSeverity = ALERT_CONFIG[type].severity;
      const alert: AlertEvent = {
        id: `alt-${Date.now()}`,
        residentId: resident.id,
        residentName: resident.name,
        room: resident.room,
        photo: resident.photo,
        type,
        severity,
        message,
        time: Date.now(),
        acknowledged: false,
      };
      setAlerts((prev) => [alert, ...prev].slice(0, 100));
      pushNotification(type, ALERT_CONFIG[type].label, `${resident.name} — ${message}`, resident.id, resident.name);
      
      // Also try to send to backend
      try {
        // You can add a POST endpoint to save alerts to backend
        // fetch(`${API_BASE_URL}/alerts`, { method: 'POST', body: JSON.stringify(alert) })
      } catch (error) {
        console.error('Error saving alert to backend:', error);
      }
    },
    [pushNotification]
  );

  // Check thresholds for new alerts
  useEffect(() => {
    if (!isConnected || residents.length === 0) return;

    const thresholdTimer = setInterval(() => {
      const current = residentsRef.current;
      current.forEach((r) => {
        const v = r.vitals;
        if (Math.random() > 0.04) return;
        if (v.heartRate > 130) {
          pushAlert(r, 'heart-rate-high', `Heart rate elevated to ${v.heartRate} BPM`);
        } else if (v.heartRate < 45) {
          pushAlert(r, 'heart-rate-low', `Heart rate dropped to ${v.heartRate} BPM — bradycardia`);
        } else if (v.temperature > 38.0) {
          pushAlert(r, 'temperature-high', `Body temperature ${v.temperature}°C — fever detected`);
        } else if (v.spo2 < 90) {
          pushAlert(r, 'spo2-low', `Blood oxygen at ${v.spo2}% — critical`);
        } else if (v.systolic > 160) {
          pushAlert(r, 'bp-high', `Blood pressure ${v.systolic}/${v.diastolic} mmHg`);
        } else if (v.battery < 20 && Math.random() < 0.5) {
          pushAlert(r, 'low-battery', `Device battery at ${Math.round(v.battery)}%`);
        }
      });
    }, 8000);

    return () => clearInterval(thresholdTimer);
  }, [isConnected, residents.length, pushAlert]);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string, caretakerName: string) => {
    try {
      // Try to acknowledge on backend
      await api.acknowledgeAlert(alertId, caretakerName);
      
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, acknowledged: true, acknowledgedBy: caretakerName, acknowledgedAt: Date.now() }
            : a
        )
      );
      
      const alert = alerts.find((a) => a.id === alertId);
      if (alert) {
        pushNotification(
          'emergency-acknowledged',
          'Alert Acknowledged',
          `${caretakerName} handled ${ALERT_CONFIG[alert.type].label} for ${alert.residentName}`,
          undefined,
          alert.residentName
        );
        setActivities((prev) => [
          {
            id: `act-${Date.now()}`,
            type: 'alert',
            message: `Acknowledged ${ALERT_CONFIG[alert.type].label} for ${alert.residentName}`,
            actor: caretakerName,
            time: Date.now(),
            icon: 'check'
          },
          ...prev,
        ].slice(0, 30));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }, [alerts, pushNotification]);

  const callResident = useCallback((alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: 'call',
          message: `Called resident ${alert.residentName} (Room ${alert.room})`,
          actor: 'Sarah Mitchell',
          time: Date.now(),
          icon: 'phone'
        },
        ...prev,
      ].slice(0, 30));
    }
  }, [alerts]);

  const callDoctor = useCallback((alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: 'call',
          message: `Called attending physician for ${alert.residentName}`,
          actor: 'Sarah Mitchell',
          time: Date.now(),
          icon: 'phone'
        },
        ...prev,
      ].slice(0, 30));
    }
  }, [alerts]);

  const notifyFamily = useCallback((alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          type: 'notify',
          message: `Notified family member of ${alert.residentName}`,
          actor: 'Sarah Mitchell',
          time: Date.now(),
          icon: 'bell'
        },
        ...prev,
      ].slice(0, 30));
    }
  }, [alerts]);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const resolveFall = useCallback(async (fallId: string) => {
    try {
      await api.updateFallStatus(fallId, 'resolved');
      setFallEvents((prev) =>
        prev.map((f) => (f.id === fallId ? { ...f, responseStatus: 'resolved' as const } : f))
      );
    } catch (error) {
      console.error('Error resolving fall:', error);
    }
  }, []);

const startFallResponse = useCallback(async (fallId: string) => {
  try {
    await api.updateFallStatus(fallId, 'pending');
    setFallEvents((prev) =>
      prev.map((f) => (f.id === fallId ? { ...f, responseStatus: 'pending' as const } : f))
    );
  } catch (error) {
    console.error('Error starting fall response:', error);
  }
}, []);

  const addActivity = useCallback((activity: Omit<ActivityEvent, 'id' | 'time'>) => {
    setActivities((prev) => [
      { ...activity, id: `act-${Date.now()}`, time: Date.now() },
      ...prev
    ].slice(0, 30));
  }, []);

  return (
    <IoTDataContext.Provider
      value={{
        residents,
        alerts,
        fallEvents,
        notifications,
        activities,
        isConnected,
        lastSync,
        loading,
        refreshData,
        acknowledgeAlert,
        callResident,
        callDoctor,
        notifyFamily,
        markNotificationRead,
        markAllNotificationsRead,
        resolveFall,
        startFallResponse,
        addActivity,
      }}
    >
      {children}
    </IoTDataContext.Provider>
  );
}

export function useIoTData() {
  const ctx = useContext(IoTDataContext);
  if (!ctx) throw new Error('useIoTData must be used within IoTDataProvider');
  return ctx;
}