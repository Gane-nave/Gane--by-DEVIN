/**
 * G.A.N.E — Fallback Severity Indicator
 * =========================================
 * Visual severity badge that mirrors the active positioning-chain tier.
 *
 * Covers todo.md:
 *   - [x] Visual severity indicator (green/yellow/orange/red)
 *
 * Green   = Tier 1-2 (GNSS / SBAS)    · OPTIMAL
 * Yellow  = Tier 3 (WiFi / Cell)      · DEGRADED
 * Orange  = Tier 4 (IMU / PDR / VO)   · FALLBACK
 * Red     = Tier 5 (Cached / IP)      · LAST_RESORT
 *
 * Also mounts the transition-alert hook so toasts fire globally whenever
 * this indicator is rendered (typically in LiveStatusBar).
 */
import { useEffect, useState } from "react";
import {
  getPositionFallbackChain,
  type FallbackChainState,
} from "@/engine/positionFallbackChain";
import { useFallbackTransitionAlerts } from "@/hooks/useFallbackTransitionAlerts";
import {
  SEVERITY_LABEL,
  tierToSeverity,
  type FallbackSeverity as Severity,
} from "@shared/contracts/fallbackSeverity";

const SEVERITY_STYLE: Record<
  Severity,
  { bg: string; ring: string; text: string }
> = {
  green: {
    bg: "rgba(34,197,94,0.18)",
    ring: "rgba(34,197,94,0.85)",
    text: "#22c55e",
  },
  yellow: {
    bg: "rgba(234,179,8,0.20)",
    ring: "rgba(234,179,8,0.85)",
    text: "#eab308",
  },
  orange: {
    bg: "rgba(249,115,22,0.22)",
    ring: "rgba(249,115,22,0.90)",
    text: "#f97316",
  },
  red: {
    bg: "rgba(239,68,68,0.24)",
    ring: "rgba(239,68,68,0.90)",
    text: "#ef4444",
  },
};

export default function FallbackSeverityIndicator() {
  // Subscribe toast alerts once.
  useFallbackTransitionAlerts();

  const [state, setState] = useState<FallbackChainState | null>(null);

  useEffect(() => {
    const chain = getPositionFallbackChain();
    setState(chain.getState());
    const unsub = chain.subscribe(setState);
    return () => unsub();
  }, []);

  if (!state) return null;

  const severity = tierToSeverity(state.activeTier);
  const style = SEVERITY_STYLE[severity];
  const provider = state.activeProvider;

  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        background: style.bg,
        border: `1px solid ${style.ring}`,
        color: style.text,
      }}
      title={`Chain status: ${state.chainStatus} · active: ${provider} · tier ${state.activeTier} · handoffs: ${state.handoffCount}`}
      data-testid="fallback-severity-indicator"
      data-severity={severity}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: style.text, boxShadow: `0 0 6px ${style.text}` }}
      />
      {SEVERITY_LABEL[severity]} · {provider}
    </div>
  );
}
