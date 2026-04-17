export type Mode = "driving_safe" | "emergency_safe" | "degraded_safe";

export interface ModeConfig {
  overlays: number;
  animations: number;
}

export function applyMode(mode: Mode): ModeConfig {
  switch (mode) {
    case "driving_safe":
      return { overlays: 2, animations: 0.3 };
    case "emergency_safe":
      return { overlays: 1, animations: 0.1 };
    case "degraded_safe":
      return { overlays: 1, animations: 0 };
  }
}
