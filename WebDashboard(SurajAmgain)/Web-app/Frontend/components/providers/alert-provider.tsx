// components/providers/alert-provider.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { alertService, EmergencyAlert, Notification } from '@/lib/alert-service';

interface AlertContextType {
  alerts: EmergencyAlert[];
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => Promise<void>;
  getDeviceAlerts: (cardId: string) => Promise<EmergencyAlert[]>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load initial alerts
  useEffect(() => {
    const loadAlerts = async () => {
      const data = await alertService.getAlerts();
      setAlerts(data);
    };
    loadAlerts();
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    const unsubscribe = alertService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });
    return unsubscribe;
  }, []);

  // Start polling for new alerts
  useEffect(() => {
    alertService.startPolling(5000);
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    alertService.addNotification(notification);
  };

  const markAsRead = (id: string) => {
    alertService.markAsRead(id);
  };

  const markAllAsRead = () => {
    alertService.markAllAsRead();
  };

  const acknowledgeAlert = async (alertId: string, acknowledgedBy: string) => {
    await alertService.acknowledgeAlert(alertId, acknowledgedBy);
    // Refresh alerts
    const data = await alertService.getAlerts();
    setAlerts(data);
  };

  const getDeviceAlerts = async (cardId: string) => {
    return alertService.getDeviceAlerts(cardId);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AlertContext.Provider
      value={{
        alerts,
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        acknowledgeAlert,
        getDeviceAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
}