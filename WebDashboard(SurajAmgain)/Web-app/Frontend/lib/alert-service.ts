// lib/alert-service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface EmergencyAlert {
  _id?: string;
  card_id: string;
  msg: string;
  lat: number;
  lng: number;
  timestamp: number;
  receivedAt?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  status: 'pending' | 'responding' | 'resolved';
}

export interface Notification {
  id: string;
  type: 'emergency' | 'fall' | 'alert';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

class AlertService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  // Fetch all alerts from backend
  async getAlerts(): Promise<EmergencyAlert[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/data/alerts`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  // Fetch alerts for a specific device
  async getDeviceAlerts(cardId: string): Promise<EmergencyAlert[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/data/alerts/${cardId}`);
      if (!response.ok) throw new Error('Failed to fetch device alerts');
      return response.json();
    } catch (error) {
      console.error('Error fetching device alerts:', error);
      return [];
    }
  }

  // Acknowledge an alert
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/data/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ acknowledgedBy }),
      });
      if (!response.ok) throw new Error('Failed to acknowledge alert');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }

  // Add notification locally
  addNotification(notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: Date.now(),
    };
    this.notifications = [newNotification, ...this.notifications];
    this.notifyListeners();
    return newNotification;
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Mark notification as read
  markAsRead(id: string) {
    this.notifications = this.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifyListeners();
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.notifyListeners();
  }

  // Subscribe to notification updates
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  // Poll for new alerts from backend (every 5 seconds)
  startPolling(interval: number = 5000) {
    setInterval(async () => {
      const alerts = await this.getAlerts();
      // Check for new unacknowledged alerts
      const pendingAlerts = alerts.filter(a => a.status === 'pending' || !a.acknowledged);
      pendingAlerts.forEach(alert => {
        // Check if we already have this alert in notifications
        const exists = this.notifications.some(n => n.data?._id === alert._id);
        if (!exists) {
          this.addNotification({
            type: 'emergency',
            title: `🚨 ${alert.msg}`,
            message: `Device ${alert.card_id} at ${alert.lat}, ${alert.lng}`,
            data: alert,
          });
        }
      });
    }, interval);
  }
}

export const alertService = new AlertService();