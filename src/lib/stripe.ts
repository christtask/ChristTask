import { loadStripe } from "@stripe/stripe-js";

// Centralized Stripe configuration
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Debug Stripe configuration
console.log('🔍 STRIPE CONFIGURATION:', {
  keyPresent: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  keyStart: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 10),
  keyLength: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.length,
  environment: import.meta.env.MODE
}); 