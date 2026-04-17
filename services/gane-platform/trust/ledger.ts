export interface TrustRecord {
  entityId: string;
  score: number;
}

/**
 * Append-only trust ledger that enforces the Trust Monotonicity invariant:
 * scores can only increase via observed positive evidence.
 */
export class TrustLedger {
  private records = new Map<string, TrustRecord>();

  update(entityId: string, delta: number): number {
    const current = this.records.get(entityId) ?? { entityId, score: 0 };
    if (delta > 0) {
      current.score += delta;
      this.records.set(entityId, current);
    }
    return current.score;
  }

  get(entityId: string): number {
    return this.records.get(entityId)?.score ?? 0;
  }

  size(): number {
    return this.records.size;
  }
}
