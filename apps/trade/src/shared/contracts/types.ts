export enum SystemState {
  INITIALIZING = 'INITIALIZING',
  NOMINAL = 'NOMINAL',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE',
  EMERGENCY = 'EMERGENCY'
}

export enum SafetyMode {
  DRIVING_SAFE = 'DRIVING_SAFE',
  EMERGENCY_SAFE = 'EMERGENCY_SAFE',
  DEGRADED_SAFE = 'DEGRADED_SAFE'
}

export enum Role {
  VIEWER = 'VIEWER',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
  SRE = 'SRE',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface TrustState {
  positioningConfidence: number;
  routeCertainty: number;
  etaVariance: number;
  dataFreshness: number;
  provenance: string;
  activeFallbackState: boolean;
  degradedModeStatus: boolean;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  scope: string;
  priority: number;
  enforcementAction: 'BLOCK' | 'WARN' | 'ALLOW';
}

export interface MissionEvent {
  id: string;
  timestamp: number;
  type: string;
  payload: any;
}

export interface ReleaseVerdict {
  status: 'APPROVED' | 'BLOCKED' | 'PENDING_EVIDENCE';
  missingEvidence: string[];
  signoffRecords: string[];
}
