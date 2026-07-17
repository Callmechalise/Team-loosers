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
  vitals: ResidentVitals;
  indoorLocation: string;
  joinedDate: string;
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
