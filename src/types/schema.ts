export type IncidentStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated';
export type IncidentType = 'lip_detection' | 'gait_anomaly' | 'dual_match';

export interface Incident {
  id: string;
  type: IncidentType;
  confidence: number;
  cameraId: string;
  zone: string;
  floor: string;
  status: IncidentStatus;
  timestamp: string | any; // In firestore this would be Timestamp
  assignedStaff: string | null;
  notes: string;
}

export type CameraStatus = 'online' | 'offline';

export interface Camera {
  id: string;
  label: string;
  floor: string;
  zone: string;
  status: CameraStatus;
  streamUrl: string;
}

export interface Staff {
  id: string;
  name: string;
  email?: string;
  role: string;
  floor: string;
  isOnDuty: boolean;
  fcmToken?: string | null;
}

export interface AuditLog {
  id?: string;
  incidentId: string;
  action: string;
  staffId: string;
  staffName?: string;
  timestamp: string | any;
}
