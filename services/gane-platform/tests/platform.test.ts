import { describe, it, expect } from "vitest";
import { checkPermission } from "../admin/rbac.js";
import { PolicyEngine } from "../policy/evaluator.js";
import { TrustLedger } from "../trust/ledger.js";
import { explainRoute } from "../engine/routing/explainer.js";
import { OfflineState } from "../offline/sovereignty.js";
import { evaluateRelease } from "../proof/release-gate.js";
import { detectRegression } from "../sentinel/regression.js";
import { applyMode } from "../ui/safety-ux/modes.js";
import { createCheckoutSession } from "../billing/stripe.js";

describe("RBAC", () => {
  it("super_admin bypasses permission list", () => {
    expect(checkPermission("super_admin", "anything")).toBe(true);
  });

  it("viewer cannot write", () => {
    expect(checkPermission("viewer", "write")).toBe(false);
    expect(checkPermission("viewer", "read")).toBe(true);
  });

  it("sre can deploy but admin cannot", () => {
    expect(checkPermission("sre", "deploy")).toBe(true);
    expect(checkPermission("admin", "deploy")).toBe(false);
  });
});

describe("PolicyEngine", () => {
  it("runs matching policy actions", () => {
    const engine = new PolicyEngine();
    let fired = 0;
    engine.register({
      id: "emergency",
      condition: (ctx) => (ctx as { severity?: string }).severity === "HIGH",
      action: () => {
        fired += 1;
      },
    });
    engine.evaluate({ severity: "LOW" });
    engine.evaluate({ severity: "HIGH" });
    expect(fired).toBe(1);
  });
});

describe("TrustLedger", () => {
  it("is monotonic — negative deltas are ignored", () => {
    const ledger = new TrustLedger();
    ledger.update("sat-gps-24", 5);
    ledger.update("sat-gps-24", -10);
    expect(ledger.get("sat-gps-24")).toBe(5);
  });

  it("accumulates positive evidence", () => {
    const ledger = new TrustLedger();
    ledger.update("sat-galileo-7", 3);
    ledger.update("sat-galileo-7", 4);
    expect(ledger.get("sat-galileo-7")).toBe(7);
  });
});

describe("explainRoute", () => {
  it("produces deterministic explanation", () => {
    const out = explainRoute({ reason: "lower WCET", rejected: ["hwy-1"], confidence: 0.87 });
    expect(out.explanation).toBe("Route chosen due to lower WCET");
    expect(out.rejectedAlternatives).toEqual(["hwy-1"]);
    expect(out.confidence).toBe(0.87);
  });
});

describe("OfflineState", () => {
  it("reports syncPending while offline", () => {
    const s = new OfflineState();
    s.setOffline(true);
    expect(s.getState()).toEqual({ offline: true, syncPending: true });
    s.setOffline(false);
    expect(s.getState()).toEqual({ offline: false, syncPending: false });
  });
});

describe("evaluateRelease", () => {
  it("blocks on low coverage", () => {
    expect(evaluateRelease({ testsPassed: true, coverage: 0.85, vulnerabilities: 0 })).toBe("BLOCKED");
  });
  it("blocks on vulnerabilities", () => {
    expect(evaluateRelease({ testsPassed: true, coverage: 0.99, vulnerabilities: 2 })).toBe("BLOCKED");
  });
  it("approves only on all-green", () => {
    expect(evaluateRelease({ testsPassed: true, coverage: 0.95, vulnerabilities: 0 })).toBe("APPROVED");
  });
});

describe("detectRegression", () => {
  it("flags >5% regression", () => {
    expect(detectRegression(1.08, 1.0).regression).toBe(true);
  });
  it("does not flag within tolerance", () => {
    expect(detectRegression(1.04, 1.0).regression).toBe(false);
  });
});

describe("safety-ux applyMode", () => {
  it("degraded_safe has zero animation intensity", () => {
    expect(applyMode("degraded_safe")).toEqual({ overlays: 1, animations: 0 });
  });
  it("driving_safe has two overlays", () => {
    expect(applyMode("driving_safe").overlays).toBe(2);
  });
});

describe("billing/stripe", () => {
  it("throws STRIPE_NOT_CONFIGURED — no fake success", async () => {
    await expect(createCheckoutSession()).rejects.toThrow("STRIPE_NOT_CONFIGURED");
  });
});
