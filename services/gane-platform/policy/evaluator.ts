export type PolicyContext = Record<string, unknown>;

export interface Policy {
  id: string;
  condition: (ctx: PolicyContext) => boolean;
  action: (ctx: PolicyContext) => void;
}

export class PolicyEngine {
  private policies: Policy[] = [];

  register(policy: Policy): void {
    this.policies.push(policy);
  }

  evaluate(ctx: PolicyContext): void {
    for (const p of this.policies) {
      if (p.condition(ctx)) {
        p.action(ctx);
      }
    }
  }

  count(): number {
    return this.policies.length;
  }
}
