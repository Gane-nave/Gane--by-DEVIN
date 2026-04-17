import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { checkPermission, type Role } from "../../../admin/rbac.js";
import { PolicyEngine } from "../../../policy/evaluator.js";
import { TrustLedger } from "../../../trust/ledger.js";
import { explainRoute } from "../../../engine/routing/explainer.js";
import { OfflineState } from "../../../offline/sovereignty.js";
import { evaluateRelease } from "../../../proof/release-gate.js";
import { detectRegression } from "../../../sentinel/regression.js";

const t = initTRPC.create();

const trustLedger = new TrustLedger();
const policyEngine = new PolicyEngine();
const offlineState = new OfflineState();

export const appRouter = t.router({
  health: t.procedure.query(() => ({ status: "ok", timestamp: new Date().toISOString() })),

  rbacCheck: t.procedure
    .input(z.object({ role: z.enum(["viewer", "operator", "admin", "sre", "super_admin"]), action: z.string() }))
    .query(({ input }) => ({ allowed: checkPermission(input.role as Role, input.action) })),

  trustGet: t.procedure
    .input(z.object({ entityId: z.string() }))
    .query(({ input }) => ({ score: trustLedger.get(input.entityId) })),

  trustUpdate: t.procedure
    .input(z.object({ entityId: z.string(), delta: z.number() }))
    .mutation(({ input }) => ({ score: trustLedger.update(input.entityId, input.delta) })),

  policyEvaluate: t.procedure
    .input(z.object({ context: z.record(z.unknown()) }))
    .mutation(({ input }) => {
      policyEngine.evaluate(input.context);
      return { evaluated: true };
    }),

  explainRoute: t.procedure
    .input(z.object({ reason: z.string(), rejected: z.array(z.string()), confidence: z.number() }))
    .query(({ input }) => explainRoute(input)),

  offlineSet: t.procedure
    .input(z.object({ offline: z.boolean() }))
    .mutation(({ input }) => {
      offlineState.setOffline(input.offline);
      return offlineState.getState();
    }),

  offlineGet: t.procedure.query(() => offlineState.getState()),

  releaseEvaluate: t.procedure
    .input(z.object({ testsPassed: z.boolean(), coverage: z.number(), vulnerabilities: z.number() }))
    .query(({ input }) => ({ verdict: evaluateRelease(input) })),

  regressionDetect: t.procedure
    .input(z.object({ current: z.number(), baseline: z.number() }))
    .query(({ input }) => detectRegression(input.current, input.baseline)),
});

export type AppRouter = typeof appRouter;
