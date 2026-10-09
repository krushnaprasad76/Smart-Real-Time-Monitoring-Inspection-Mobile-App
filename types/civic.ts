export type CivicCategory = 
  | 'streetlight'
  | 'drainage'
  | 'water_leak'
  | 'pothole'
  | 'electrical';

export type CivicStatus = 
  | 'nominal'
  | 'warning'
  | 'critical'
  | 'in_inspection'
  | 'resolved';

export interface AssetMetrics {
  // Streetlight
  lux?: number;
  voltage?: number;
  currentDrawAmps?: number;
  lampHours?: number;
  
  // Drainage & Flood
  waterLevelCm?: number;
  waterThresholdMaxCm?: number;
  flowRateLpm?: number;
  siltLevelPct?: number;

  // Water Leakage
  acousticLeakDb?: number;
  acousticThresholdDb?: number;
  waterPressurePsi?: number;
  flowDiscrepancyPct?: number;

  // Road & Pothole
  roadRoughnessIri?: number;
  vibrationRmsG?: number;
  potholeDepthMm?: number;
  surfaceTempC?: number;

  // Electrical Grid & Transformer
  transformerTempC?: number;
  transformerTempMaxC?: number;
  gridLoadPct?: number;
  phaseImbalancePct?: number;
}

export interface StreetAssetNode {
  id: string;
  name: string;
  category: CivicCategory;
  address: string;
  ward: string;
  coordinates: {
    x: number; // 0-100% on the SVG municipal map
    y: number; // 0-100% on the SVG municipal map
    lat: number;
    lng: number;
  };
  status: CivicStatus;
  lastInspected: string;
  assignedCrew: string;
  metrics: AssetMetrics;
  activeAlertDescription?: string;
  recentHistory?: { timestamp: number; primaryValue: number }[];
}

export interface FieldInspectionCheck {
  id: string;
  label: string;
  passed: boolean;
  measurement?: string;
  notes?: string;
}

export interface FieldInspectionRecord {
  id: string;
  nodeId: string;
  nodeName: string;
  category: CivicCategory;
  inspectorName: string;
  inspectorBadge: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'submitted' | 'approved';
  checklist: FieldInspectionCheck[];
  findingsNotes: string;
  photoUrl?: string;
  digitalSignature: string;
  completedAt: string;
  workOrderAction: string;
}

export interface CitizenReport {
  id: string;
  category: CivicCategory;
  title: string;
  address: string;
  ward: string;
  description: string;
  severity: 'minor' | 'moderate' | 'hazard';
  photoUrl: string;
  reporterName: string;
  status: 'reported' | 'investigating' | 'scheduled' | 'resolved';
  reportedAt: string;
  upvotes: number;
  associatedNodeId?: string;
}

export interface SensorLogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeName: string;
  category: CivicCategory;
  severity: 'info' | 'warning' | 'critical';
  metricName: string;
  metricValue: string;
  threshold: string;
  message: string;
}

export type UserRole = 'inspector' | 'citizen';

export interface SocketConnectionState {
  status: 'connected' | 'disconnected' | 'connecting';
  sampleRateHz: number;
  packetCount: number;
  latencyMs: number;
  lastHeartbeat: number;
  activeSimulatedFault?: string | null;
}
