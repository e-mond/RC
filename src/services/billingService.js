// src/services/billingService.js
/**
 * Billing service
 * - Minimal frontend-facing billing API abstraction
 * - Supports mock mode (VITE_USE_MOCK=true)
 * - Methods:
 *    createStripeSession(planId) -> returns { url } (redirect user to checkout)
 *    initFlutterwave(planId) -> returns { link } (redirect)
 *    verifyPayment(txRef) -> returns { success: boolean, details }
 *
 * IMPORTANT:
 * - Real implementations should call your backend endpoints which hold secret API keys.
 * - This file intentionally avoids secret keys.
 */
import apiClient from "./apiClient";

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK).toLowerCase() === "true";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const createStripeSession = async (planId) => {
  if (USE_MOCK) {
    await delay(450);
    return { url: `https://checkout.stripe.mock/session/${planId}?mock=1` };
  }
  // Call server endpoint which creates Stripe Checkout session
  const { data } = await apiClient.post("/billing/stripe/create-checkout-session", { planId });
  return data;
};

export const initFlutterwave = async (planId) => {
  if (USE_MOCK) {
    await delay(450);
    return { link: `https://flutterwave.mock/pay/${planId}?mock=1` };
  }
  const { data } = await apiClient.post("/billing/flutterwave/init", { planId });
  return data;
};

export const verifyPayment = async (txRef) => {
  if (USE_MOCK) {
    await delay(300);
    // mock success for any txRef starting with "ok_"
    return { success: String(txRef).startsWith("ok_"), txRef, details: {} };
  }
  const { data } = await apiClient.get(`/billing/verify/${encodeURIComponent(txRef)}`);
  return data;
};

export default {
  createStripeSession,
  initFlutterwave,
  verifyPayment,
};
