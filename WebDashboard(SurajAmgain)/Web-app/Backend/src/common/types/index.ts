export type HealthStatus = 'healthy' | 'warning' | 'emergency';
export type MovementStatus = 'active' | 'resting' | 'sleeping' | 'no-movement';
export type AlertType = 
  | 'heart-rate-high' 
  | 'heart-rate-low'
  | 'bp-high' 
  | 'bp-low'
  | 'spo2-low'
  | 'temperature-high'
  | 'fall-detected'
  | 'no-movement'
  | 'low-battery'
  | 'left-bed'
  | 'device-disconnected';

export interface Resident {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
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
  device: Device;
  vitals: Vitals;
  indoorLocation: string;
  joinedDate: string;
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

export interface AlertEvent {
  id: string;
  residentId: string;
  residentName: string;
  room: string;
  photo: string;
  type: AlertType;
  severity: 'critical' | 'warning' | 'info';
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
  responseStatus: 'pending' | 'resolved' | 'dispatched';
  assignedCaretaker: string;
  responseTimeSeconds: number;
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
  type: 'alert' | 'medication' | 'rounds' | 'device' | 'resident' | 'report';
  message: string;
  actor: string;
  time: number;
  icon: string;
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

export interface Device {
  id: string;
  model: string;
  firmware: string;
  assignedDate: string;
}

export interface Vitals {
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