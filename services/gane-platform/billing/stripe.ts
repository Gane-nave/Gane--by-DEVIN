/**
 * Stripe integration boundary.
 *
 * This module deliberately throws STRIPE_NOT_CONFIGURED until a real Stripe
 * API key is injected. The error is explicit so callers cannot mistake an
 * unconfigured billing adapter for a successful checkout (no FAKE_SUCCESS).
 */
export async function createCheckoutSession(): Promise<never> {
  throw new Error("STRIPE_NOT_CONFIGURED");
}
