export enum MissionType {
  REASONING = 'REASONING',
  EXECUTION = 'EXECUTION',
  DEFENSE = 'DEFENSE',
  CREATIVE = 'CREATIVE',
  SURVEILLANCE = 'SURVEILLANCE',
  EMERGENCY = 'EMERGENCY'
}

export enum SystemState {
  BOOTING = 'BOOTING',
  OPTIMAL = 'OPTIMAL',
  DEGRADED = 'DEGRADED',
  HARDENED = 'HARDENED',
  EMERGENCY = 'EMERGENCY'
}

export interface Coordinate {
  lat: number;
  lng: number;
  alt?: number;
}

export interface Mission {
  id: string;
  type: MissionType;
  goal: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  priority: number;
  timestamp: string;
}

export interface HealthReport {
  neuro_core: string;
  orbital_nav: string;
  satlink: string;
  nexus_sync: string;
  telemetry: string;
  cyber_shield: string;
  creative: string;
  sonic: string;
  uptime: string;
  threat_level: number;
}
