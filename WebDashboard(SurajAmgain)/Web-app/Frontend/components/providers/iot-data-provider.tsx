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
import {
  RESIDENTS,
  ALERTS_SEED,
  FALL_EVENTS_SEED,
  NOTIFICATIONS_SEED,
  ACTIVITIES_SEED,
} from '@/data/mock-data';
import { ALERT_CONFIG } from '@/lib/constants';

interface IoTDataContextValue {
  residents: Resident[];
  alerts: AlertEvent[];
  fallEvents: FallEvent[];
  notifications: NotificationItem[];
  activities: ActivityEvent[];
  isConnected: boolean;
  lastSync: number;
  acknowledgeAlert: (alertId: string, caretakerName: string) => void;
  callResident: (alertId: string) => void;
  callDoctor: (alertId: string) => void;
  notifyFamily: (alertId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resolveFall: (fallId: string) => void;
  startFallResponse: (fallId: string) => void;
  addActivity: (activity: Omit<ActivityEvent, 'id' | 'time'>) => void;
}

const IoTDataContext = createContext<IoTDataContextValue | null>(null);

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

function computeStatus(vitals: Resident['vitals']): HealthStatus {
  if (vitals.fallDetected) return 'emergency';
  if (vitals.heartRate > 130 || vitals.heartRate < 45) return 'emergency';
  if (vitals.spo2 < 90) return 'emergency';
  if (vitals.temperature > 38.0 || vitals.temperature < 35.5) return 'emergency';
  if (vitals.systolic > 160 || vitals.systolic < 80) return 'emergency';
  if (vitals.heartRate > 100 || vitals.heartRate < 55) return 'warning';
  if (vitals.spo2 < 95) return 'warning';
  if (vitals.temperature > 37.3) return 'warning';
  if (vitals.systolic > 135 || vitals.diastolic > 88) return 'warning';
  if (vitals.battery < 20) return 'warning';
  return 'healthy';
}

const MOVEMENTS: MovementStatus[] = ['active', 'resting', 'sleeping'];

let alertCounter = 100;
let notifCounter = 100;
let fallCounter = 100;

export function IoTDataProvider({ children }: { children: React.ReactNode }) {
  const [residents, setResidents] = useState<Resident[]>(RESIDENTS);
  const [alerts, setAlerts] = useState<AlertEvent[]>(ALERTS_SEED);
  const [fallEvents, setFallEvents] = useState<FallEvent[]>(FALL_EVENTS_SEED);
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS_SEED);
  const [activities, setActivities] = useState<ActivityEvent[]>(ACTIVITIES_SEED);
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState(Date.now());

  const residentsRef = useRef(residents);
  residentsRef.current = residents;

  const pushNotification = useCallback(
    (type: NotificationItem['type'], title: string, message: string, residentId?: string, residentName?: string) => {
      notifCounter++;
      const n: NotificationItem = {
        id: `ntf-${notifCounter}`,
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

  const pushAlert = useCallback(
    (resident: Resident, type: AlertType, message: string) => {
      alertCounter++;
      const severity: AlertSeverity = ALERT_CONFIG[type].severity;
      const alert: AlertEvent = {
        id: `alt-${alertCounter}`,
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
    },
    [pushNotification]
  );

  const updateVitals = useCallback(() => {
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

        const newVitals = {
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
        };
        const newStatus = computeStatus(newVitals);
        return { ...r, vitals: newVitals, status: newStatus };
      })
    );
    setLastSync(Date.now());
  }, []);

  const checkThresholds = useCallback(() => {
    const current = residentsRef.current;
    current.forEach((r) => {
      const v = r.vitals;
      if (Math.random() > 0.04) return;
      if (v.heartRate > 130) {
        pushAlert(r, 'heart-rate-high', `Heart rate elevated to ${v.heartRate} BPM`);
      } else if (v.heartRate < 45) {
        pushAlert(r, 'heart-rate-low', `Heart rate dropped to ${v.heartRate} BPM — bradycardia`);
      } else if (v.temperature > 38.0) {
        pushAlert(r, 'temperature-high', `Body temperature ${v.temperature}\u00b0C — fever detected`);
      } else if (v.spo2 < 90) {
        pushAlert(r, 'spo2-low', `Blood oxygen at ${v.spo2}% — critical`);
      } else if (v.systolic > 160) {
        pushAlert(r, 'bp-high', `Blood pressure ${v.systolic}/${v.diastolic} mmHg`);
      } else if (v.battery < 20 && Math.random() < 0.5) {
        pushAlert(r, 'low-battery', `Device battery at ${Math.round(v.battery)}%`);
      }
    });
  }, [pushAlert]);

  useEffect(() => {
    const vitalsTimer = setInterval(updateVitals, 3000);
    const thresholdTimer = setInterval(checkThresholds, 8000);
    const connectionTimer = setInterval(() => {
      setIsConnected((prev) => (Math.random() < 0.02 ? !prev : prev));
    }, 15000);
    return () => {
      clearInterval(vitalsTimer);
      clearInterval(thresholdTimer);
      clearInterval(connectionTimer);
    };
  }, [updateVitals, checkThresholds]);

  const acknowledgeAlert = useCallback((alertId: string, caretakerName: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, acknowledged: true, acknowledgedBy: caretakerName, acknowledgedAt: Date.now() }
          : a
      )
    );
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      pushNotification('emergency-acknowledged', 'Alert Acknowledged', `${caretakerName} handled ${ALERT_CONFIG[alert.type].label} for ${alert.residentName}`, undefined, alert.residentName);
      setActivities((prev) => [
        { id: `act-${Date.now()}`, type: 'alert', message: `Acknowledged ${ALERT_CONFIG[alert.type].label} for ${alert.residentName}`, actor: caretakerName, time: Date.now(), icon: 'check' },
        ...prev,
      ].slice(0, 30));
    }
  }, [alerts, pushNotification]);

  const callResident = useCallback((alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setActivities((prev) => [
        { id: `act-${Date.now()}`, type: 'call', message: `Called resident ${alert.residentName} (Room ${alert.room})`, actor: 'Sarah Mitchell', time: Date.now(), icon: 'phone' },
        ...prev,
      ].slice(0, 30));
    }
  }, [alerts]);

  const callDoctor = useCallback((alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setActivities((prev) => [
        { id: `act-${Date.now()}`, type: 'call', message: `Called attending physician for ${alert.residentName}`, actor: 'Sarah Mitchell', time: Date.now(), icon: 'phone' },
        ...prev,
      ].slice(0, 30));
    }
  }, [alerts]);

  const notifyFamily = useCallback((alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setActivities((prev) => [
        { id: `act-${Date.now()}`, type: 'notify', message: `Notified family member of ${alert.residentName}`, actor: 'Sarah Mitchell', time: Date.now(), icon: 'bell' },
        ...prev,
      ].slice(0, 30));
    }
  }, [alerts]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const resolveFall = useCallback((fallId: string) => {
    setFallEvents((prev) =>
      prev.map((f) => (f.id === fallId ? { ...f, responseStatus: 'resolved' as const } : f))
    );
  }, []);

  const startFallResponse = useCallback((fallId: string) => {
    setFallEvents((prev) =>
      prev.map((f) => (f.id === fallId ? { ...f, responseStatus: 'responding' as const } : f))
    );
  }, []);

  const addActivity = useCallback((activity: Omit<ActivityEvent, 'id' | 'time'>) => {
    setActivities((prev) => [{ ...activity, id: `act-${Date.now()}`, time: Date.now() }, ...prev].slice(0, 30));
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
