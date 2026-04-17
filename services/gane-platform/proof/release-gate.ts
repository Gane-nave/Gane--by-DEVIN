export interface GateInput {
  testsPassed: boolean;
  coverage: number;
  vulnerabilities: number;
}

export type GateVerdict = "APPROVED" | "BLOCKED";

export function evaluateRelease(input: GateInput): GateVerdict {
  if (!input.testsPassed) return "BLOCKED";
  if (input.coverage < 0.9) return "BLOCKED";
  if (input.vulnerabilities > 0) return "BLOCKED";
  return "APPROVED";
}
