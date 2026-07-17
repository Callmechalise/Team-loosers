// lib/api.ts
import {
  BackendResident,
  Resident,
  AlertEvent,
  FallEvent,
  NotificationItem,
  ActivityEvent,
  Caretaker,
  DashboardData,
  IoTData,
  AlertSeverity,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Transform backend resident to frontend resident
function transformResident(backendResident: BackendResident): Resident {
  return {
    id: backendResident._id || backendResident.id || '',
    name: backendResident.name,
    age: backendResident.age,
    gender: backendResident.gender,
    photo: backendResident.photo,
    room: backendResident.room,
    bed: backendResident.bed,
    building: backendResident.building,
    floor: backendResident.floor,
    medicalConditions: backendResident.medicalConditions || [],
    allergies: backendResident.allergies || [],
    assignedCaretaker: backendResident.assignedCaretaker,
    status: backendResident.status,
    emergencyContacts: backendResident.emergencyContacts || [],
    medicalHistory: backendResident.medicalHistory || [],
    medications: backendResident.medications || [],
    device: backendResident.device || {
      id: '',
      model: '',
      firmware: '',
      assignedDate: '',
    },
    vitals: backendResident.vitals || {
      heartRate: 0,
      temperature: 0,
      systolic: 0,
      diastolic: 0,
      spo2: 0,
      steps: 0,
      movement: 'resting',
      fallDetected: false,
      battery: 0,
      signal: 0,
      lastUpdate: Date.now(),
    },
    indoorLocation: backendResident.indoorLocation || '',
    joinedDate: backendResident.joinedDate || new Date().toISOString(),
  };
}

export const api = {
  // ============ Residents ============
  getResidents: async (): Promise<Resident[]> => {
    const data = await fetchApi<BackendResident[]>('/residents');
    return data.map(transformResident);
  },
  
  getResident: async (id: string): Promise<Resident> => {
    const data = await fetchApi<BackendResident>(`/residents/${id}`);
    return transformResident(data);
  },
  
  // ============ Alerts ============
  getAlerts: () => fetchApi<AlertEvent[]>('/alerts'),
  
  getUnacknowledgedAlertsCount: () => 
    fetchApi<{ count: number }>('/alerts/unacknowledged/count'),
  
  getAlertsBySeverity: (severity: AlertSeverity) => 
    fetchApi<AlertEvent[]>(`/alerts/severity/${severity}`),
  
  acknowledgeAlert: (id: string, acknowledgedBy: string) =>
    fetchApi<AlertEvent>(`/alerts/${id}/acknowledge`, {
      method: 'PATCH',
      body: JSON.stringify({ acknowledgedBy }),
    }),
  
  // ============ Falls ============
  getFalls: () => fetchApi<FallEvent[]>('/falls'),
  
  getPendingFalls: () => fetchApi<FallEvent[]>('/falls/pending'),
  
  getFallsByStatus: (status: string) => 
    fetchApi<FallEvent[]>(`/falls/status/${status}`),
  
  updateFallStatus: (id: string, status: string) =>
    fetchApi<FallEvent>(`/falls/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  
  // ============ Notifications ============
  getNotifications: () => fetchApi<NotificationItem[]>('/notifications'),
  
  getUnreadNotifications: () => fetchApi<NotificationItem[]>('/notifications/unread'),
  
  getUnreadCount: () => fetchApi<{ count: number }>('/notifications/unread/count'),
  
  markNotificationAsRead: (id: string) =>
    fetchApi<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  
  markAllNotificationsAsRead: () =>
    fetchApi<{ message: string }>('/notifications/mark-all-read', {
      method: 'PATCH',
    }),
  
  // ============ Activities ============
  getActivities: () => fetchApi<ActivityEvent[]>('/activities'),
  
  getRecentActivities: (limit: number = 5) => 
    fetchApi<ActivityEvent[]>(`/activities/recent?limit=${limit}`),
  
  getActivitiesByActor: (actor: string) =>
    fetchApi<ActivityEvent[]>(`/activities/actor/${encodeURIComponent(actor)}`),
  
  // ============ Caretakers ============
  getCaretakers: () => fetchApi<Caretaker[]>('/caretakers'),
  
  getCaretakerProfile: () => fetchApi<Caretaker>('/caretakers/profile'),
  
  getCaretaker: (id: string) => fetchApi<Caretaker>(`/caretakers/${id}`),
  
  // ============ Dashboard ============
  getDashboard: () => fetchApi<DashboardData>('/dashboard'),
  
  // ============ IoT Data ============
  getIoTData: (deviceId: string, limit: number = 100) =>
    fetchApi<IoTData[]>(`/data/device/${deviceId}?limit=${limit}`),
  
  getLatestIoTData: (deviceId: string) =>
    fetchApi<IoTData>(`/data/device/${deviceId}/latest`),
  
  getAllLatestIoTData: () =>
    fetchApi<IoTData[]>('/data/devices/latest'),
};