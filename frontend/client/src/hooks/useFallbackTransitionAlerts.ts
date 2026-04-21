/**
 * G.A.N.E — Fallback Transition Alerts
 * ========================================
 * Subscribes to the PositionFallbackChain and fires user-visible toast
 * alerts whenever the active positioning provider crosses a tier boundary.
 *
 * Tier → severity mapping (matches FallbackSeverityIndicator):
 *   Tier 1 (GNSS)          → green    — OPTIMAL
 *   Tier 2 (SBAS)          → green    — OPTIMAL (augmented GNSS)
 *   Tier 3 (WiFi / Cell)   → yellow   — DEGRADED (sub-10 m confidence lost)
 *   Tier 4 (IMU / PDR / VO)→ orange   — FALLBACK (dead-reckoning only)
 *   Tier 5 (Cached / IP)   → red      — LAST_RESORT (no live fix)
 *
 * Covers todo.md items:
 *   - [x] Alert when switching from GNSS to WiFi/Cell
 *   - [x] Alert when switching from WiFi/Cell to IMU/DR
 *   - [x] Alert when returning to GNSS from fallback
 */
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  getPositionFallbackChain,
  type FallbackChainState,
  type ProviderTier,
} from "@/engine/positionFallbackChain";
import {
  classifyTransition,
  tierToSeverity,
  type FallbackSeverity as Severity,
  type TransitionKind,
} from "@shared/contracts/fallbackSeverity";

export type { Severity };
export { tierToSeverity };

interface TransitionMeta {
  fromTier: ProviderTier;
  toTier: ProviderTier;
  fromProvider: string;
  toProvider: string;
}

/**
 * Subscribe once per mount. Debounces repeated transitions within 2 s to
 * avoid toast storms during rapid signal flapping.
 */
export function useFallbackTransitionAlerts(): void {
  const prevTierRef = useRef<ProviderTier | null>(null);
  const prevProviderRef = useRef<string | null>(null);
  const lastToastAtRef = useRef<number>(0);
  const DEBOUNCE_MS = 2000;

  useEffect(() => {
    const chain = getPositionFallbackChain();
    const unsubscribe = chain.subscribe((state: FallbackChainState) => {
      const nextTier = state.activeTier;
      const nextProvider = state.activeProvider;

      // First tick · just record baseline, no toast.
      if (prevTierRef.current === null) {
        prevTierRef.current = nextTier;
        prevProviderRef.current = nextProvider;
        return;
      }

      // No change · skip.
      if (
        prevTierRef.current === nextTier &&
        prevProviderRef.current === nextProvider
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastToastAtRef.current < DEBOUNCE_MS) {
        prevTierRef.current = nextTier;
        prevProviderRef.current = nextProvider;
        return;
      }
      lastToastAtRef.current = now;

      const meta: TransitionMeta = {
        fromTier: prevTierRef.current,
        toTier: nextTier,
        fromProvider: prevProviderRef.current ?? "—",
        toProvider: nextProvider,
      };
      emitTransitionToast(meta);

      prevTierRef.current = nextTier;
      prevProviderRef.current = nextProvider;
    });

    return () => {
      unsubscribe();
    };
  }, []);
}

function emitTransitionToast(m: TransitionMeta): void {
  const kind: TransitionKind = classifyTransition(m.fromTier, m.toTier);
  const label = `${m.fromProvider} → ${m.toProvider}`;

  switch (kind) {
    case "recovered-to-gnss":
      toast.success("GNSS signal recovered", {
        description: `${label} · live positioning restored`,
        duration: 4000,
      });
      return;
    case "gnss-to-network":
      toast.warning("GNSS lost · switched to network positioning", {
        description: `${label} · accuracy degraded to ~20–100 m`,
        duration: 6000,
      });
      return;
    case "network-to-dead-reckoning":
      toast.error("Network lost · dead-reckoning only", {
        description: `${label} · drift accumulating · confirm position ASAP`,
        duration: 8000,
      });
      return;
    case "dead-reckoning-to-cached":
      toast.error("All live providers lost · last-resort cache in use", {
        description: `${label} · position stale`,
        duration: 10000,
      });
      return;
    case "improved":
      toast.success("Positioning improved", {
        description: label,
        duration: 3500,
      });
      return;
    case "degraded":
      toast.warning("Positioning degraded", {
        description: label,
        duration: 5000,
      });
      return;
    case "unchanged":
      return;
  }
}
