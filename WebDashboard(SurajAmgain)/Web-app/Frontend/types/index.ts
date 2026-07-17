// types/index.ts

export type HealthStatus = 'healthy' | 'warning' | 'emergency';
export type ConnectionStatus = 'online' | 'offline';
export type MovementStatus = 'active' | 'resting' | 'sleeping' | 'no-movement';
export type Gender = 'male' | 'female';

export type AlertType =
  | 'heart-rate-high'
  | 'heart-rate-low'
  | 'temperature-high'
  | 'temperature-low'
  | 'bp-high'
  | 'bp-low'
  | 'fall-detected'
  | 'no-movement'
  | 'device-disconnected'
  | 'low-battery'
  | 'spo2-low'
  | 'left-bed';

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type FallResponseStatus = 'pending' | 'responding' | 'resolved';

// Backend Vitals Type (matches MongoDB schema)
export interface BackendVitals {
  heartRate: number;
  temperature: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  steps: number;
  movement: MovementStatus;
  fallDetected: boolean;
  battery: number;
  signal: number;
  lastUpdate: number;
}

// Backend Resident Type (matches what MongoDB returns)
export interface BackendResident {
  _id: string;
  id?: string; // Sometimes id is also included
  name: string;
  age: number;
  gender: Gender;
  photo: string;
  room: string;
  bed: string;
  building: string;
  floor: string;
  medicalConditions: string[];
  allergies: string[];
  assignedCaretaker: string;
  status: HealthStatus;
  emergencyContacts: EmergencyContact[];
  medicalHistory: MedicalHistoryEntry[];
  medications: Medication[];
  device: {
    id: string;
    model: string;
    firmware: string;
    assignedDate: string;
  };
  vitals: BackendVitals;
  indoorLocation: string;
  joinedDate: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

// For Frontend Display (if you need to transform data)
export interface Resident {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  photo: string;
  room: string;
  bed: string;
  building: string;
  floor: string;
  medicalConditions: string[];
  allergies: string[];
  assignedCaretaker: string;
  status: HealthStatus;
  emergencyContacts: EmergencyContact[];
  medicalHistory: MedicalHistoryEntry[];
  medications: Medication[];
  device: {
    id: string;
    model: string;
    firmware: string;
    assignedDate: string;
  };
  vitals: {
    heartRate: number;
    temperature: number;
    systolic: number;
    diastolic: number;
    spo2: number;
    steps: number;
    movement: MovementStatus;
    fallDetected: boolean;
    battery: number;
    signal: number;
    lastUpdate: number;
  };
  indoorLocation: string;
  joinedDate: string;
}

export interface VitalReading {
  timestamp: number;
  heartRate: number;
  temperature: number;
  systolic: number;
  diastolic: number;
  spo2: number;
}

export interface ResidentVitals {
  heartRate: number;
  temperature: number;
  systolic: number;
  diastolic: number;
  spo2: number;
  steps: number;
  movement: MovementStatus;
  fallDetected: boolean;
  battery: number;
  signal: number;
  lastUpdate: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  time: string;
  taken: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface MedicalHistoryEntry {
  id: string;
  condition: string;
  diagnosedDate: string;
  notes: string;
}

export interface AlertEvent {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  photo: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  time: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
}

export interface FallEvent {
  id: string;
  residentId: string;
  residentName: string;
  photo: string;
  room: string;
  location: string;
  time: number;
  responseStatus: FallResponseStatus;
  assignedCaretaker: string;
  responseTimeSeconds: number;
}

export interface IoTDevice {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  model: string;
  firmware: string;
  battery: number;
  signal: number;
  lastSync: number;
  connection: ConnectionStatus;
}

export interface NotificationItem {
  id: string;
  type: AlertType | 'medication-reminder' | 'emergency-acknowledged';
  title: string;
  message: string;
  time: number;
  read: boolean;
  residentId?: string;
  residentName?: string;
}

export interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  actor: string;
  time: number;
  icon: string;
}

export interface Caretaker {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo: string;
  shift: string;
  residentsAssigned: number;
}

// Alerts (Backend)
export interface Alert {
  _id: string;
  residentId: string;
  residentName: string;
  room: string;
  photo: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  time: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
}

// Falls (Backend)
export interface Fall {
  _id: string;
  residentId: string;
  residentName: string;
  photo: string;
  room: string;
  location: string;
  time: number;
  responseStatus: 'pending' | 'resolved' | 'dispatched';
  assignedCaretaker: string;
  responseTimeSeconds: number;
}

// Notifications (Backend)
export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  time: number;
  read: boolean;
  residentId?: string;
  residentName?: string;
}

// Activities (Backend)
export interface Activity {
  _id: string;
  type: string;
  message: string;
  actor: string;
  time: number;
  icon: string;
}

// IoT Data (Backend)
export interface IoTData {
  _id: string;
  card_id: string;
  heartrate: number;
  spo2: number;
  timestamp: number;
  receivedAt: string;
  fallDetected: boolean;
  btn_alert: boolean;
  lat: number;
  long: number;
}

// Dashboard Data
export interface DashboardData {
  residents: {
    total: number;
    healthy: number;
    warning: number;
    emergency: number;
  };
  alerts: {
    unacknowledged: number;
    total: number;
  };
  vitals: {
    avgHeartRate: number;
    avgTemperature: number;
    avgSpo2: number;
    avgBattery: number;
  };
  falls: {
    recent: number;
    total: number;
  };
  activities: {
    recent: Activity[];
  };
  notifications: {
    unread: number;
  };
}