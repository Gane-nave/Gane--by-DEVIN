export interface RegressionResult {
  regression: boolean;
  delta: number;
}

export function detectRegression(current: number, baseline: number): RegressionResult {
  const diff = current - baseline;
  return {
    regression: diff > 0.05,
    delta: diff,
  };
}
