/**
 * G.A.N.E — Constellation Handoff Alerts
 * =========================================
 * Subscribes to the MultiConstellationEngine and fires sonner toasts on:
 *   - Individual constellation loss / regain (GPS / GLONASS / … / SBAS)
 *   - Best-constellation change (e.g. GPS → GALILEO)
 *   - Spoofing risk crossings
 *   - Satellite count falling below / recovering the 3D-fix floor (4 sats)
 *
 * Classification is delegated to `shared/contracts/constellationHandoff.ts`
 * so it is unit-testable without React / DOM.
 *
 * Debounced at 1.5 s per event-kind to avoid storm during signal flap.
 */
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useGANEEngines } from "@/contexts/GANEContext";
import type { MultiConstellationState } from "@/engine/multiConstellation";
import {
  deltaToAlerts,
  diffSnapshots,
  type ConstellationId,
  type ConstellationSnapshot,
  type HandoffAlert,
} from "@shared/contracts/constellationHandoff";

const DEBOUNCE_MS = 1500;

function snapshotOf(state: MultiConstellationState): ConstellationSnapshot {
  const available = new Set<ConstellationId>();
  Array.from(state.constellations.entries()).forEach(([id, status]) => {
    if (status.isAvailable) available.add(id);
  });
  return {
    available,
    best: state.bestConstellation,
    spoofingRisk: state.spoofingRisk,
    totalUsed: state.totalUsed,
    pdop: state.pdop,
  };
}

export function useConstellationHandoffAlerts(): void {
  const engines = useGANEEngines();
  const prevRef = useRef<ConstellationSnapshot | null>(null);
  const lastToastAtRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const engine = engines?.multiConstellation;
    if (!engine) return;

    prevRef.current = snapshotOf(engine.getState());

    const unsubscribe = engine.subscribe((state) => {
      const next = snapshotOf(state);
      const prev = prevRef.current;
      prevRef.current = next;
      if (!prev) return;

      const delta = diffSnapshots(prev, next);
      const alerts = deltaToAlerts(delta);
      if (alerts.length === 0) return;

      const now = Date.now();
      for (const a of alerts) {
        const key = a.kind;
        const last = lastToastAtRef.current[key] ?? 0;
        if (now - last < DEBOUNCE_MS) continue;
        lastToastAtRef.current[key] = now;
        emit(a);
      }
    });

    return () => unsubscribe();
  }, [engines]);
}

function emit(a: HandoffAlert): void {
  switch (a.kind) {
    case "below-3d-fix-floor":
      toast.error("Lost 3D position fix", {
        description: "Fewer than 4 satellites in solution · position uncertain",
        duration: 9000,
      });
      return;
    case "3d-fix-floor-restored":
      toast.success("3D position fix restored", {
        description: "≥ 4 satellites again in solution",
        duration: 4000,
      });
      return;
    case "spoofing-risk-rose":
      toast.error("Possible GNSS spoofing detected", {
        description: "Risk score exceeded alert threshold · verify surroundings",
        duration: 10000,
      });
      return;
    case "spoofing-risk-cleared":
      toast.success("GNSS spoofing risk cleared", { duration: 3500 });
      return;
    case "constellation-lost":
      toast.warning(
        a.ids.length === 1
          ? `Lost constellation: ${a.ids[0]}`
          : `Lost constellations: ${a.ids.join(", ")}`,
        {
          description: "Falling back to remaining visible constellations",
          duration: 5500,
        },
      );
      return;
    case "constellation-regained":
      toast.success(
        a.ids.length === 1
          ? `Regained ${a.ids[0]}`
          : `Regained: ${a.ids.join(", ")}`,
        { duration: 3500 },
      );
      return;
    case "best-changed":
      toast.info(`Best constellation: ${a.from} → ${a.to}`, {
        description: "Position solution re-anchored",
        duration: 3500,
      });
      return;
  }
}
