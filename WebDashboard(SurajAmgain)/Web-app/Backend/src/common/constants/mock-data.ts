import type {
  Resident,
  AlertEvent,
  FallEvent,
  Caretaker,
  NotificationItem,
  ActivityEvent,
  HealthStatus,
  MovementStatus,
  Medication,
  EmergencyContact,
  MedicalHistoryEntry,
  AlertType,
} from '../types';  // Use relative path, not @/types

const PHOTOS = [
  'https://images.pexels.com/photos/839788/pexels-photo-839788.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/1130693/pexels-photo-1130693.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/3777931/pexels-photo-3777931.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/3779448/pexels-photo-3779448.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/6234574/pexels-photo-6234574.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/6234575/pexels-photo-6234575.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
];

const CARETAKERS: Caretaker[] = [
  {
    id: 'ct-1',
    name: 'Sarah Mitchell',
    role: 'Head Nurse',
    email: 'sarah.mitchell@eldercare.guardian',
    phone: '+1 555-0101',
    photo: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    shift: 'Day Shift (07:00 - 19:00)',
    residentsAssigned: 8,
  },
  {
    id: 'ct-2',
    name: 'James Carter',
    role: 'Senior Caretaker',
    email: 'james.carter@eldercare.guardian',
    phone: '+1 555-0102',
    photo: 'https://images.pexels.com/photos/5214997/pexels-photo-5214997.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    shift: 'Day Shift (07:00 - 19:00)',
    residentsAssigned: 7,
  },
  {
    id: 'ct-3',
    name: 'Emily Rodriguez',
    role: 'Registered Nurse',
    email: 'emily.rodriguez@eldercare.guardian',
    phone: '+1 555-0103',
    photo: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    shift: 'Night Shift (19:00 - 07:00)',
    residentsAssigned: 5,
  },
];

interface ResidentSeed {
  name: string;
  age: number;
  gender: 'male' | 'female';
  room: string;
  bed: string;
  building: string;
  floor: string;
  conditions: string[];
  allergies: string[];
  caretakerId: string;
  status: HealthStatus;
  indoorLocation: string;
  joinedDate: string;
  photoIdx: number;
}

const RESIDENT_SEEDS: ResidentSeed[] = [
  { name: 'Margaret Thompson', age: 82, gender: 'female', room: '101', bed: 'A', building: 'Maple Wing', floor: '1st Floor', conditions: ['Hypertension', 'Arthritis'], allergies: ['Penicillin'], caretakerId: 'ct-1', status: 'healthy', indoorLocation: 'Room 101 — Bed A', joinedDate: '2023-03-15', photoIdx: 0 },
  { name: 'Robert Henderson', age: 78, gender: 'male', room: '101', bed: 'B', building: 'Maple Wing', floor: '1st Floor', conditions: ['Type 2 Diabetes', 'Coronary Heart Disease'], allergies: ['None'], caretakerId: 'ct-1', status: 'warning', indoorLocation: 'Room 101 — Bed B', joinedDate: '2023-05-22', photoIdx: 1 },
  { name: 'Dorothy Patel', age: 85, gender: 'female', room: '102', bed: 'A', building: 'Maple Wing', floor: '1st Floor', conditions: ['Alzheimer\u2019s Disease'], allergies: ['Latex'], caretakerId: 'ct-1', status: 'healthy', indoorLocation: 'Garden Lounge', joinedDate: '2022-11-08', photoIdx: 2 },
  { name: 'William Foster', age: 79, gender: 'male', room: '102', bed: 'B', building: 'Maple Wing', floor: '1st Floor', conditions: ['Parkinson\u2019s Disease', 'Hypertension'], allergies: ['Aspirin'], caretakerId: 'ct-2', status: 'warning', indoorLocation: 'Room 102 — Bed B', joinedDate: '2023-01-19', photoIdx: 3 },
  { name: 'Elizabeth Chen', age: 88, gender: 'female', room: '103', bed: 'A', building: 'Maple Wing', floor: '1st Floor', conditions: ['Atrial Fibrillation', 'Osteoporosis'], allergies: ['Shellfish'], caretakerId: 'ct-1', status: 'emergency', indoorLocation: 'Room 103 — Bed A', joinedDate: '2022-08-04', photoIdx: 4 },
  { name: 'George Wright', age: 76, gender: 'male', room: '103', bed: 'B', building: 'Maple Wing', floor: '1st Floor', conditions: ['COPD', 'Hypertension'], allergies: ['None'], caretakerId: 'ct-2', status: 'healthy', indoorLocation: 'Dining Hall', joinedDate: '2023-07-30', photoIdx: 5 },
  { name: 'Helen Martinez', age: 84, gender: 'female', room: '104', bed: 'A', building: 'Maple Wing', floor: '1st Floor', conditions: ['Type 2 Diabetes'], allergies: ['Sulfa drugs'], caretakerId: 'ct-1', status: 'healthy', indoorLocation: 'Room 104 — Bed A', joinedDate: '2023-02-11', photoIdx: 6 },
  { name: 'Charles Davis', age: 81, gender: 'male', room: '104', bed: 'B', building: 'Maple Wing', floor: '1st Floor', conditions: ['Stroke Recovery', 'Hypertension'], allergies: ['None'], caretakerId: 'ct-2', status: 'warning', indoorLocation: 'Therapy Room', joinedDate: '2023-06-18', photoIdx: 7 },
  { name: 'Patricia Nakamura', age: 86, gender: 'female', room: '201', bed: 'A', building: 'Oak Wing', floor: '2nd Floor', conditions: ['Heart Failure', 'Chronic Kidney Disease'], allergies: ['Iodine'], caretakerId: 'ct-2', status: 'emergency', indoorLocation: 'Room 201 — Bed A', joinedDate: '2022-09-25', photoIdx: 8 },
  { name: 'Thomas Brooks', age: 77, gender: 'male', room: '201', bed: 'B', building: 'Oak Wing', floor: '2nd Floor', conditions: ['Arthritis', 'Glaucoma'], allergies: ['None'], caretakerId: 'ct-3', status: 'healthy', indoorLocation: 'Room 201 — Bed B', joinedDate: '2023-04-12', photoIdx: 9 },
  { name: 'Barbara Sanders', age: 83, gender: 'female', room: '202', bed: 'A', building: 'Oak Wing', floor: '2nd Floor', conditions: ['Dementia', 'Hypothyroidism'], allergies: ['Penicillin'], caretakerId: 'ct-3', status: 'warning', indoorLocation: 'Activity Center', joinedDate: '2023-01-07', photoIdx: 0 },
  { name: 'Richard Lewis', age: 80, gender: 'male', room: '202', bed: 'B', building: 'Oak Wing', floor: '2nd Floor', conditions: ['Type 2 Diabetes', 'Hypertension'], allergies: ['None'], caretakerId: 'ct-3', status: 'healthy', indoorLocation: 'Room 202 — Bed B', joinedDate: '2023-05-03', photoIdx: 1 },
  { name: 'Joan Bennett', age: 87, gender: 'female', room: '203', bed: 'A', building: 'Oak Wing', floor: '2nd Floor', conditions: ['Osteoporosis', 'Macular Degeneration'], allergies: ['Codeine'], caretakerId: 'ct-2', status: 'healthy', indoorLocation: 'Room 203 — Bed A', joinedDate: '2022-12-14', photoIdx: 2 },
  { name: 'Donald Hayes', age: 75, gender: 'male', room: '203', bed: 'B', building: 'Oak Wing', floor: '2nd Floor', conditions: ['Coronary Heart Disease'], allergies: ['None'], caretakerId: 'ct-3', status: 'warning', indoorLocation: 'Garden Lounge', joinedDate: '2023-08-21', photoIdx: 3 },
  { name: 'Shirley Powell', age: 89, gender: 'female', room: '204', bed: 'A', building: 'Oak Wing', floor: '2nd Floor', conditions: ['Alzheimer\u2019s Disease', 'Heart Arrhythmia'], allergies: ['Latex'], caretakerId: 'ct-3', status: 'emergency', indoorLocation: 'Room 204 — Bed A', joinedDate: '2022-07-19', photoIdx: 4 },
  { name: 'Frank Perry', age: 78, gender: 'male', room: '204', bed: 'B', building: 'Oak Wing', floor: '2nd Floor', conditions: ['COPD'], allergies: ['Aspirin'], caretakerId: 'ct-2', status: 'healthy', indoorLocation: 'Dining Hall', joinedDate: '2023-03-28', photoIdx: 5 },
  { name: 'Virginia Cooper', age: 85, gender: 'female', room: '301', bed: 'A', building: 'Pine Wing', floor: '3rd Floor', conditions: ['Hypertension', 'Type 2 Diabetes'], allergies: ['None'], caretakerId: 'ct-1', status: 'healthy', indoorLocation: 'Room 301 — Bed A', joinedDate: '2023-02-22', photoIdx: 6 },
  { name: 'Arthur Bailey', age: 82, gender: 'male', room: '301', bed: 'B', building: 'Pine Wing', floor: '3rd Floor', conditions: ['Parkinson\u2019s Disease'], allergies: ['Sulfa drugs'], caretakerId: 'ct-1', status: 'warning', indoorLocation: 'Therapy Room', joinedDate: '2023-06-05', photoIdx: 7 },
  { name: 'Lois Ramirez', age: 84, gender: 'female', room: '302', bed: 'A', building: 'Pine Wing', floor: '3rd Floor', conditions: ['Stroke Recovery', 'Seizure Disorder'], allergies: ['Shellfish'], caretakerId: 'ct-2', status: 'warning', indoorLocation: 'Room 302 — Bed A', joinedDate: '2022-10-11', photoIdx: 8 },
  { name: 'Howard Jenkins', age: 79, gender: 'male', room: '302', bed: 'B', building: 'Pine Wing', floor: '3rd Floor', conditions: ['Chronic Kidney Disease', 'Hypertension'], allergies: ['None'], caretakerId: 'ct-1', status: 'healthy', indoorLocation: 'Room 302 — Bed B', joinedDate: '2023-07-14', photoIdx: 9 },
  { name: 'Ruth Stewart', age: 91, gender: 'female', room: '303', bed: 'A', building: 'Pine Wing', floor: '3rd Floor', conditions: ['Heart Failure', 'Osteoporosis', 'Dementia'], allergies: ['Penicillin', 'Codeine'], caretakerId: 'ct-3', status: 'emergency', indoorLocation: 'Room 303 — Bed A', joinedDate: '2022-06-01', photoIdx: 0 },
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function genVitals(status: HealthStatus) {
  if (status === 'emergency') {
    return {
      heartRate: rand(135, 155),
      temperature: randFloat(38.2, 39.0),
      systolic: rand(165, 180),
      diastolic: rand(100, 110),
      spo2: rand(85, 90),
      steps: rand(200, 800),
      movement: 'no-movement' as MovementStatus,
      fallDetected: Math.random() < 0.5,
      battery: rand(20, 60),
      signal: rand(40, 70),
    };
  }
  if (status === 'warning') {
    return {
      heartRate: rand(105, 120),
      temperature: randFloat(37.3, 38.0),
      systolic: rand(140, 155),
      diastolic: rand(90, 98),
      spo2: rand(91, 94),
      steps: rand(800, 2500),
      movement: 'resting' as MovementStatus,
      fallDetected: false,
      battery: rand(30, 70),
      signal: rand(55, 85),
    };
  }
  return {
    heartRate: rand(62, 88),
    temperature: randFloat(36.2, 37.0),
    systolic: rand(100, 125),
    diastolic: rand(65, 82),
    spo2: rand(96, 99),
    steps: rand(1500, 5000),
    movement: (['active', 'resting', 'sleeping'] as MovementStatus[])[rand(0, 2)],
    fallDetected: false,
    battery: rand(65, 100),
    signal: rand(75, 100),
  };
}

function genMedications(conditions: string[]): Medication[] {
  const meds: Medication[] = [];
  const pool: Record<string, { name: string; dosage: string }[]> = {
    Hypertension: [
      { name: 'Lisinopril', dosage: '10mg' },
      { name: 'Amlodipine', dosage: '5mg' },
    ],
    'Type 2 Diabetes': [
      { name: 'Metformin', dosage: '500mg' },
      { name: 'Glipizide', dosage: '5mg' },
    ],
    'Coronary Heart Disease': [{ name: 'Atorvastatin', dosage: '20mg' }],
    'Atrial Fibrillation': [{ name: 'Warfarin', dosage: '5mg' }],
    'Heart Failure': [{ name: 'Furosemide', dosage: '40mg' }],
    'Alzheimer\u2019s Disease': [{ name: 'Donepezil', dosage: '10mg' }],
    'Parkinson\u2019s Disease': [{ name: 'Levodopa', dosage: '100mg' }],
    COPD: [{ name: 'Tiotropium', dosage: '18mcg' }],
    'Stroke Recovery': [{ name: 'Clopidogrel', dosage: '75mg' }],
    Osteoporosis: [{ name: 'Alendronate', dosage: '70mg' }],
    Arthritis: [{ name: 'Ibuprofen', dosage: '400mg' }],
    Hypothyroidism: [{ name: 'Levothyroxine', dosage: '50mcg' }],
    Dementia: [{ name: 'Memantine', dosage: '10mg' }],
    'Chronic Kidney Disease': [{ name: 'Sevelamer', dosage: '800mg' }],
    Glaucoma: [{ name: 'Latanoprost', dosage: '1 drop' }],
    'Seizure Disorder': [{ name: 'Levetiracetam', dosage: '500mg' }],
    'Macular Degeneration': [{ name: 'Vitamin C', dosage: '500mg' }],
    'Heart Arrhythmia': [{ name: 'Metoprolol', dosage: '50mg' }],
  };
  const times = ['08:00', '12:00', '18:00', '20:00'];
  const schedules = ['Morning', 'Afternoon', 'Evening', 'Night'];
  conditions.forEach((c, idx) => {
    const options = pool[c];
    if (options) {
      options.forEach((opt) => {
        meds.push({
          id: `med-${idx}-${opt.name}`,
          name: opt.name,
          dosage: opt.dosage,
          schedule: schedules[idx % schedules.length],
          time: times[idx % times.length],
          taken: Math.random() < 0.7,
        });
      });
    }
  });
  return meds.slice(0, 5);
}

function genEmergencyContacts(name: string): EmergencyContact[] {
  const first = name.split(' ')[0];
  const last = name.split(' ').slice(1).join(' ');
  const relations = ['Son', 'Daughter', 'Spouse', 'Nephew', 'Niece'];
  const picked = relations.sort(() => Math.random() - 0.5).slice(0, 2);
  return picked.map((rel, i) => ({
    id: `ec-${i}`,
    name: `${first === name ? 'John' : 'Michael'} ${rel === 'Spouse' ? last : 'Family'}`,
    relationship: rel,
    phone: `+1 555-${String(rand(200, 999)).padStart(3, '0')}`,
  }));
}

function genMedicalHistory(conditions: string[]): MedicalHistoryEntry[] {
  return conditions.map((c, i) => ({
    id: `mh-${i}`,
    condition: c,
    diagnosedDate: `${rand(2015, 2023)}-${String(rand(1, 12)).padStart(2, '0')}-${String(rand(1, 28)).padStart(2, '0')}`,
    notes: 'Under ongoing management and monitoring.',
  }));
}

function genDeviceModel(idx: number) {
  const models = ['Guardian Pro X3', 'CareWatch V2', 'HealthBand Plus', 'SafeLink Elite'];
  return models[idx % models.length];
}

export const RESIDENTS: Resident[] = RESIDENT_SEEDS.map((seed, idx) => {
  const caretaker = CARETAKERS.find((c) => c.id === seed.caretakerId)!;
  const v = genVitals(seed.status);
  return {
    id: `res-${String(idx + 1).padStart(3, '0')}`,
    name: seed.name,
    age: seed.age,
    gender: seed.gender,
    photo: PHOTOS[seed.photoIdx],
    room: seed.room,
    bed: seed.bed,
    building: seed.building,
    floor: seed.floor,
    medicalConditions: seed.conditions,
    allergies: seed.allergies,
    assignedCaretaker: caretaker.name,
    status: seed.status,
    emergencyContacts: genEmergencyContacts(seed.name),
    medicalHistory: genMedicalHistory(seed.conditions),
    medications: genMedications(seed.conditions),
    device: {
      id: `DEV-${String(idx + 1).padStart(4, '0')}`,
      model: genDeviceModel(idx),
      firmware: `v${rand(2, 4)}.${rand(0, 9)}.${rand(0, 9)}`,
      assignedDate: seed.joinedDate,
    },
    vitals: {
      ...v,
      lastUpdate: Date.now() - rand(0, 60000),
    },
    indoorLocation: seed.indoorLocation,
    joinedDate: seed.joinedDate,
  };
});

const now = Date.now();
export const ALERTS_SEED: AlertEvent[] = [
  { id: 'alt-1', residentId: 'res-005', residentName: 'Elizabeth Chen', room: '103', photo: RESIDENTS[4].photo, type: 'heart-rate-high', severity: 'critical', message: 'Heart rate elevated to 152 BPM — above critical threshold', time: now - 120000, acknowledged: false },
  { id: 'alt-2', residentId: 'res-009', residentName: 'Patricia Nakamura', room: '201', photo: RESIDENTS[8].photo, type: 'spo2-low', severity: 'critical', message: 'Blood oxygen dropped to 87% — immediate attention required', time: now - 240000, acknowledged: false },
  { id: 'alt-3', residentId: 'res-015', residentName: 'Shirley Powell', room: '204', photo: RESIDENTS[14].photo, type: 'fall-detected', severity: 'critical', message: 'Fall detected in Room 204 — accelerometer triggered emergency alert', time: now - 360000, acknowledged: false },
  { id: 'alt-4', residentId: 'res-020', residentName: 'Ruth Stewart', room: '303', photo: RESIDENTS[19].photo, type: 'bp-high', severity: 'warning', message: 'Blood pressure reading 175/108 mmHg — hypertensive crisis range', time: now - 480000, acknowledged: false },
  { id: 'alt-5', residentId: 'res-002', residentName: 'Robert Henderson', room: '101', photo: RESIDENTS[1].photo, type: 'temperature-high', severity: 'warning', message: 'Body temperature 38.2\u00b0C — possible fever detected', time: now - 600000, acknowledged: true, acknowledgedBy: 'Sarah Mitchell', acknowledgedAt: now - 300000 },
  { id: 'alt-6', residentId: 'res-004', residentName: 'William Foster', room: '102', photo: RESIDENTS[3].photo, type: 'no-movement', severity: 'warning', message: 'No movement detected for 45 minutes', time: now - 900000, acknowledged: true, acknowledgedBy: 'James Carter', acknowledgedAt: now - 700000 },
  { id: 'alt-7', residentId: 'res-008', residentName: 'Charles Davis', room: '104', photo: RESIDENTS[7].photo, type: 'low-battery', severity: 'info', message: 'Device battery at 22% — please charge soon', time: now - 1200000, acknowledged: false },
  { id: 'alt-8', residentId: 'res-011', residentName: 'Barbara Sanders', room: '202', photo: RESIDENTS[10].photo, type: 'left-bed', severity: 'info', message: 'Resident has left bed — movement detected in corridor', time: now - 1800000, acknowledged: true, acknowledgedBy: 'Emily Rodriguez', acknowledgedAt: now - 1500000 },
  { id: 'alt-9', residentId: 'res-014', residentName: 'Donald Hayes', room: '203', photo: RESIDENTS[13].photo, type: 'bp-low', severity: 'warning', message: 'Blood pressure dropped to 82/52 mmHg', time: now - 2400000, acknowledged: true, acknowledgedBy: 'Emily Rodriguez', acknowledgedAt: now - 2100000 },
  { id: 'alt-10', residentId: 'res-018', residentName: 'Lois Ramirez', room: '302', photo: RESIDENTS[17].photo, type: 'heart-rate-low', severity: 'critical', message: 'Heart rate dropped to 44 BPM — bradycardia detected', time: now - 3000000, acknowledged: false },
  { id: 'alt-11', residentId: 'res-006', residentName: 'George Wright', room: '103', photo: RESIDENTS[5].photo, type: 'device-disconnected', severity: 'warning', message: 'Device lost connection — last seen 8 minutes ago', time: now - 3600000, acknowledged: true, acknowledgedBy: 'James Carter', acknowledgedAt: now - 3300000 },
  { id: 'alt-12', residentId: 'res-001', residentName: 'Margaret Thompson', room: '101', photo: RESIDENTS[0].photo, type: 'low-battery', severity: 'info', message: 'Device battery at 18% — charging recommended', time: now - 5400000, acknowledged: true, acknowledgedBy: 'Sarah Mitchell', acknowledgedAt: now - 5000000 },
];

export const FALL_EVENTS_SEED: FallEvent[] = [
  { id: 'fall-1', residentId: 'res-015', residentName: 'Shirley Powell', photo: RESIDENTS[14].photo, room: '204', location: 'Room 204 — Near Bathroom', time: now - 360000, responseStatus: 'pending', assignedCaretaker: 'Emily Rodriguez', responseTimeSeconds: 0 },
  { id: 'fall-2', residentId: 'res-005', residentName: 'Elizabeth Chen', photo: RESIDENTS[4].photo, room: '103', location: 'Room 103 — Bedside', time: now - 7200000, responseStatus: 'resolved', assignedCaretaker: 'Sarah Mitchell', responseTimeSeconds: 145 },
  { id: 'fall-3', residentId: 'res-009', residentName: 'Patricia Nakamura', photo: RESIDENTS[8].photo, room: '201', location: 'Room 201 — Corridor', time: now - 86400000, responseStatus: 'resolved', assignedCaretaker: 'James Carter', responseTimeSeconds: 98 },
  { id: 'fall-4', residentId: 'res-020', residentName: 'Ruth Stewart', photo: RESIDENTS[19].photo, room: '303', location: 'Room 303 — Near Closet', time: now - 172800000, responseStatus: 'resolved', assignedCaretaker: 'Emily Rodriguez', responseTimeSeconds: 210 },
  { id: 'fall-5', residentId: 'res-014', residentName: 'Donald Hayes', photo: RESIDENTS[13].photo, room: '203', location: 'Room 203 — Bathroom', time: now - 259200000, responseStatus: 'resolved', assignedCaretaker: 'James Carter', responseTimeSeconds: 75 },
];

export const NOTIFICATIONS_SEED: NotificationItem[] = [
  { id: 'ntf-1', type: 'fall-detected', title: 'Fall Detected', message: 'Shirley Powell — Room 204', time: now - 360000, read: false, residentId: 'res-015', residentName: 'Shirley Powell' },
  { id: 'ntf-2', type: 'heart-rate-high', title: 'High Heart Rate', message: 'Elizabeth Chen — 152 BPM', time: now - 120000, read: false, residentId: 'res-005', residentName: 'Elizabeth Chen' },
  { id: 'ntf-3', type: 'medication-reminder', title: 'Medication Reminder', message: 'Robert Henderson — Metformin 8:00 AM', time: now - 300000, read: false, residentId: 'res-002', residentName: 'Robert Henderson' },
  { id: 'ntf-4', type: 'spo2-low', title: 'Low Oxygen Level', message: 'Patricia Nakamura — SpO\u2082 87%', time: now - 240000, read: false, residentId: 'res-009', residentName: 'Patricia Nakamura' },
  { id: 'ntf-5', type: 'low-battery', title: 'Battery Low', message: 'Charles Davis — Device at 22%', time: now - 1200000, read: false, residentId: 'res-008', residentName: 'Charles Davis' },
  { id: 'ntf-6', type: 'left-bed', title: 'Resident Left Bed', message: 'Barbara Sanders — Room 202', time: now - 1800000, read: true, residentId: 'res-011', residentName: 'Barbara Sanders' },
  { id: 'ntf-7', type: 'device-disconnected', title: 'Device Offline', message: 'George Wright — Room 103', time: now - 3600000, read: true, residentId: 'res-006', residentName: 'George Wright' },
  { id: 'ntf-8', type: 'emergency-acknowledged', title: 'Alert Acknowledged', message: 'Sarah Mitchell handled temperature alert for Robert Henderson', time: now - 300000, read: true, residentName: 'Robert Henderson' },
];

export const ACTIVITIES_SEED: ActivityEvent[] = [
  { id: 'act-1', type: 'alert', message: 'Acknowledged high temperature alert for Robert Henderson', actor: 'Sarah Mitchell', time: now - 300000, icon: 'check' },
  { id: 'act-2', type: 'medication', message: 'Administered Metformin to Helen Martinez', actor: 'James Carter', time: now - 600000, icon: 'pill' },
  { id: 'act-3', type: 'rounds', message: 'Completed morning rounds — Maple Wing', actor: 'Sarah Mitchell', time: now - 1200000, icon: 'clipboard' },
  { id: 'act-4', type: 'alert', message: 'Acknowledged no-movement alert for William Foster', actor: 'James Carter', time: now - 700000, icon: 'check' },
  { id: 'act-5', type: 'device', message: 'Restarted device for George Wright (DEV-0006)', actor: 'Emily Rodriguez', time: now - 3300000, icon: 'watch' },
  { id: 'act-6', type: 'resident', message: 'Updated medication schedule for Ruth Stewart', actor: 'Emily Rodriguez', time: now - 5400000, icon: 'user' },
  { id: 'act-7', type: 'report', message: 'Generated weekly health report for Oak Wing', actor: 'Sarah Mitchell', time: now - 7200000, icon: 'chart' },
];

export const CARETAKER_PROFILE = CARETAKERS[0];

// Export all mock data
export const MOCK_RESIDENTS: Resident[] = RESIDENTS;
export const MOCK_ALERTS: AlertEvent[] = ALERTS_SEED;
export const MOCK_FALLS: FallEvent[] = FALL_EVENTS_SEED;
export const MOCK_NOTIFICATIONS: NotificationItem[] = NOTIFICATIONS_SEED;
export const MOCK_ACTIVITIES: ActivityEvent[] = ACTIVITIES_SEED;
export const MOCK_CARETAKERS: Caretaker[] = CARETAKERS;
export const MOCK_CARETAKER_PROFILE = CARETAKER_PROFILE;

// Also export the original constants if needed
export { CARETAKERS };