import { create } from 'zustand';
import { User } from 'firebase/auth';

export type Language = 'en' | 'he';

export type CorrectionMode = 'RTK' | 'PPP' | 'SBAS' | 'INS' | 'VISION' | 'STANDARD';

export interface EntityPosition {
  lat: number;
  lon: number;
  alt: number;
  accuracy: number;
  correction_mode: CorrectionMode;
  timestamp: number;
}

export interface EntityRoute {
  route_id: string;
  polyline_3d: [number, number, number][];
  ETA_ml: number;
  confidence_score: number;
}

export interface EntityBioData {
  heart_rate: number;
  stress_index: number;
  active_zen: boolean;
}

export interface EntityV2XEvent {
  id: string;
  event_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: [number, number];
  source_node_id: string;
  description?: string;
  timestamp: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  instruction?: 'turn_right' | 'turn_left' | 'go_straight' | 'arrive';
  street?: string;
  distanceToNext?: number; // meters
}

interface GaneState {
  isBooted: boolean;
  isRTL: boolean;
  language: 'en' | 'he';
  user: User | null;
  isAuthReady: boolean;
  activePanel: 'NONE' | 'ADMIN' | 'VEHICLE' | 'CONTROL_PLANE';
  isNavigating: boolean;
  isEmergency: boolean;
  
  // V2.0 APEX State
  entityPosition: EntityPosition;
  entityRoute: EntityRoute | null;
  bioData: EntityBioData;
  tokens: number;
  systemHealth: {
    status: 'NOMINAL' | 'DEGRADED' | 'RECOVERING';
    active_anomalies: string[];
    p99_latency: number;
  };
  predictedDestination: { name: string; reason: string; lat: number; lng: number } | null;

  // Legacy/Compat State
  route: RoutePoint[];
  currentPosition: [number, number];
  currentRouteIndex: number;
  navDetails: {
    distanceTotal: number;
    distanceRemaining: number;
    timeRemaining: number; // minutes
    eta: string;
    nextTurn: 'turn_right' | 'turn_left' | 'go_straight' | 'arrive';
    nextTurnDistance: number;
    currentStreet: string;
    speedLimit: number;
  };
  nav: {
    speed: number;
    alt: number;
    heading: number;
  };

  // Actions
  setBooted: (val: boolean) => void;
  setRTL: (val: boolean) => void;
  setLanguage: (val: 'en' | 'he') => void;
  setUser: (user: User | null) => void;
  setAuthReady: (val: boolean) => void;
  setActivePanel: (panel: 'NONE' | 'ADMIN' | 'VEHICLE' | 'CONTROL_PLANE') => void;
  setNavigating: (val: boolean) => void;
  setEmergency: (val: boolean) => void;
  
  calculateRoute: (destLat: number, destLng: number, destName: string) => void;
  startTelemetry: () => void;
  stopTelemetry: () => void;
  rewardTokens: (amount: number, reason: string) => void;
}

let telemetryInterval: any;
let bioInterval: any;
let healthInterval: any;

// A simulated route in Tel Aviv (Rabin Square to Rothschild)
const MOCK_ROUTE: RoutePoint[] = [
  { lat: 32.0805, lng: 34.7805, instruction: 'go_straight', street: 'Ibn Gabirol', distanceToNext: 400 },
  { lat: 32.0765, lng: 34.7785, instruction: 'turn_right', street: 'Dizengoff', distanceToNext: 300 },
  { lat: 32.0745, lng: 34.7755, instruction: 'turn_left', street: 'King George', distanceToNext: 500 },
  { lat: 32.0684, lng: 34.7732, instruction: 'arrive', street: 'Rothschild Blvd', distanceToNext: 0 },
];

// Helper to calculate bearing between two points
function getBearing(lat1: number, lng1: number, lat2: number, lng2: number) {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  lat1 = lat1 * Math.PI / 180;
  lat2 = lat2 * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export const useGaneStore = create<GaneState>((set, get) => ({
  isBooted: false,
  isRTL: false,
  language: 'en',
  user: null,
  isAuthReady: false,
  activePanel: 'NONE',
  isNavigating: false,
  isEmergency: false,
  
  // V2.0 APEX Initial State
  entityPosition: {
    lat: 32.0853,
    lon: 34.7818,
    alt: 12.5,
    accuracy: 0.02, // 2cm accuracy (RTK)
    correction_mode: 'RTK',
    timestamp: Date.now()
  },
  entityRoute: null,
  bioData: {
    heart_rate: 72,
    stress_index: 25,
    active_zen: false
  },
  tokens: 1250,
  systemHealth: {
    status: 'NOMINAL',
    active_anomalies: [],
    p99_latency: 4.2 // Sub-10ms NPU
  },
  predictedDestination: {
    name: "Cybernetics HQ",
    reason: "Calendar Event: Q3 Strategy Sync",
    lat: 32.0741,
    lng: 34.7915
  },

  route: MOCK_ROUTE,
  currentPosition: [32.0853, 34.7818], // Starting point
  currentRouteIndex: 0,
  
  navDetails: {
    distanceTotal: 4.2,
    distanceRemaining: 4.2,
    timeRemaining: 12,
    eta: '14:30',
    nextTurn: 'go_straight',
    nextTurnDistance: 400,
    currentStreet: 'Ibn Gabirol',
    speedLimit: 50,
  },
  nav: {
    speed: 0,
    alt: 12,
    heading: 180,
  },

  setBooted: (val) => set({ isBooted: val }),
  setRTL: (val) => set({ isRTL: val }),
  setLanguage: (val) => set({ language: val }),
  setUser: (user) => set({ user }),
  setAuthReady: (val) => set({ isAuthReady: val }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setNavigating: (val) => set({ isNavigating: val }),
  setEmergency: (val) => set({ isEmergency: val }),

  rewardTokens: (amount, reason) => {
    set((state) => ({ tokens: state.tokens + amount }));
    console.log(`[TOKENOMICS] +${amount} TKN: ${reason}`);
  },

  calculateRoute: (destLat, destLng, destName) => {
    const start = get().currentPosition;
    
    // Create a dynamic mock route with a midpoint to simulate a turn
    const midLat = (start[0] + destLat) / 2 + 0.002;
    const midLng = (start[1] + destLng) / 2 - 0.002;

    const distLat = destLat - start[0];
    const distLng = destLng - start[1];
    const totalDistApprox = Math.sqrt(distLat * distLat + distLng * distLng) * 111; // Approx km

    const newRoute: RoutePoint[] = [
      { lat: midLat, lng: midLng, instruction: 'turn_right', street: 'Route 1', distanceToNext: (totalDistApprox / 2) * 1000 },
      { lat: destLat, lng: destLng, instruction: 'arrive', street: destName, distanceToNext: 0 }
    ];

    const polyline_3d: [number, number, number][] = [
      [start[0], start[1], 12.5],
      [midLat, midLng, 15.0],
      [destLat, destLng, 12.5]
    ];

    const now = new Date();
    now.setMinutes(now.getMinutes() + Math.ceil(totalDistApprox * 2));

    set({
      route: newRoute,
      currentRouteIndex: 0,
      isNavigating: false, // Wait for user to click start
      entityRoute: {
        route_id: `RT-${Date.now()}`,
        polyline_3d,
        ETA_ml: now.getTime(),
        confidence_score: 0.98
      },
      navDetails: {
        distanceTotal: totalDistApprox,
        distanceRemaining: totalDistApprox,
        timeRemaining: Math.ceil(totalDistApprox * 2), // rough estimate
        eta: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nextTurn: 'go_straight',
        nextTurnDistance: (totalDistApprox / 2) * 1000,
        currentStreet: 'Current Location',
        speedLimit: 50,
      }
    });
  },

  startTelemetry: () => {
    if (telemetryInterval) clearInterval(telemetryInterval);
    if (bioInterval) clearInterval(bioInterval);
    if (healthInterval) clearInterval(healthInterval);

    // V2.0 APEX Bio-Adaptive Zen Mode Simulation
    bioInterval = setInterval(() => {
      set((state) => {
        const hrChange = (Math.random() - 0.5) * 5;
        let newHr = Math.max(60, Math.min(120, state.bioData.heart_rate + hrChange));
        const active_zen = newHr > 95;
        
        return {
          bioData: {
            heart_rate: Math.round(newHr),
            stress_index: Math.round((newHr - 60) / 60 * 100),
            active_zen
          }
        };
      });
    }, 2000);

    // V2.0 APEX Self-Healing & Observability Simulation
    healthInterval = setInterval(() => {
      set((state) => {
        const isAnomaly = Math.random() > 0.95;
        if (isAnomaly && state.systemHealth.status === 'NOMINAL') {
          console.warn("[L5 INTEGRITY] SENSOR_DRIFT DETECTED. INITIATING EKF RESET.");
          return {
            systemHealth: {
              status: 'RECOVERING',
              active_anomalies: ['SENSOR_DRIFT'],
              p99_latency: 15.4
            },
            entityPosition: {
              ...state.entityPosition,
              correction_mode: 'VISION'
            }
          };
        } else if (state.systemHealth.status === 'RECOVERING') {
          console.log("[L9 AI] STATE VECTOR RESTORED. NOMINAL OPERATIONS RESUMED.");
          return {
            systemHealth: {
              status: 'NOMINAL',
              active_anomalies: [],
              p99_latency: 4.1
            },
            entityPosition: {
              ...state.entityPosition,
              correction_mode: 'RTK'
            }
          };
        }
        return state;
      });
    }, 5000);
    
    telemetryInterval = setInterval(() => {
      const state = get();
      
      if (!state.isNavigating) {
        // Just idle fluctuations
        set({
          nav: {
            speed: Math.max(state.nav.speed - 2, 0),
            alt: 12 + Math.sin(Date.now() / 1000) * 0.5,
            heading: state.nav.heading,
          },
          entityPosition: {
            ...state.entityPosition,
            timestamp: Date.now()
          }
        });
        return;
      }

      // Simulate driving along the route
      let { currentPosition, currentRouteIndex, route, navDetails, nav } = state;
      let targetPoint = route[currentRouteIndex];
      
      if (!targetPoint) return; // Reached end

      // Calculate distance to target (very simplified for demo)
      const distLat = targetPoint.lat - currentPosition[0];
      const distLng = targetPoint.lng - currentPosition[1];
      const distance = Math.sqrt(distLat * distLat + distLng * distLng);

      // If close enough to target point, move to next
      if (distance < 0.0005) {
        if (currentRouteIndex < route.length - 1) {
          currentRouteIndex++;
          targetPoint = route[currentRouteIndex];
        } else {
          // Arrived
          get().rewardTokens(50, "SAFE_ARRIVAL_BONUS");
          set({ isNavigating: false, nav: { ...nav, speed: 0 } });
          return;
        }
      }

      // Move towards target
      const speedKmh = Math.min(nav.speed + 2, navDetails.speedLimit + (Math.random() * 5)); // Accelerate to limit
      const speedDegPerSec = (speedKmh / 3600) * 0.009; // Rough conversion km/h to degrees/sec
      
      const heading = getBearing(currentPosition[0], currentPosition[1], targetPoint.lat, targetPoint.lng);
      
      const moveLat = Math.cos(heading * Math.PI / 180) * speedDegPerSec;
      const moveLng = Math.sin(heading * Math.PI / 180) * speedDegPerSec;

      const newPos: [number, number] = [
        currentPosition[0] + moveLat,
        currentPosition[1] + moveLng
      ];

      // Update ETA and distance (mock logic)
      const newDistanceRemaining = Math.max(navDetails.distanceRemaining - (speedKmh / 3600), 0);
      const newNextTurnDistance = Math.max(navDetails.nextTurnDistance - (speedKmh / 3.6), 0); // meters per sec

      set({
        currentPosition: newPos,
        currentRouteIndex,
        entityPosition: {
          ...state.entityPosition,
          lat: newPos[0],
          lon: newPos[1],
          timestamp: Date.now()
        },
        nav: {
          speed: speedKmh,
          alt: 12 + Math.sin(Date.now() / 1000) * 0.5,
          heading: heading,
        },
        navDetails: {
          ...navDetails,
          distanceRemaining: newDistanceRemaining,
          nextTurnDistance: newNextTurnDistance < 10 ? (route[currentRouteIndex].distanceToNext || 0) : newNextTurnDistance,
          nextTurn: route[currentRouteIndex].instruction || 'go_straight',
          currentStreet: route[currentRouteIndex].street || navDetails.currentStreet,
          timeRemaining: Math.max(Math.ceil((newDistanceRemaining / (speedKmh || 1)) * 60), 1)
        }
      });

    }, 1000); // 1 tick per second
  },
  stopTelemetry: () => {
    if (telemetryInterval) clearInterval(telemetryInterval);
    if (bioInterval) clearInterval(bioInterval);
    if (healthInterval) clearInterval(healthInterval);
  }
}));

