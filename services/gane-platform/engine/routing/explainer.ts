export interface RouteExplanationInput {
  reason: string;
  rejected: string[];
  confidence: number;
}

export interface RouteExplanation {
  explanation: string;
  rejectedAlternatives: string[];
  confidence: number;
}

export function explainRoute(input: RouteExplanationInput): RouteExplanation {
  return {
    explanation: `Route chosen due to ${input.reason}`,
    rejectedAlternatives: input.rejected,
    confidence: input.confidence,
  };
}
