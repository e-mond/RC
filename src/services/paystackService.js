// src/services/paystackService.js
/**
 * Paystack Payment Service
 * 
 * Centralized service for Paystack payment integration.
 * Handles premium upgrades and wallet top-ups via Paystack.
 * 
 * Features:
 * - Dynamic script loading
 * - Payment initialization
 * - Payment verification
 * - Error handling
 * - Mock mode support for development/demo
 * 
 * Usage:
 * import { initializePaystack, initiatePayment, verifyPaystackPayment } from '@/services/paystackService';
 * 
 * const payment = await initiatePayment({
 *   email: user.email,
 *   amount: 4900, // GHS 49.00 in kobo
 *   currency: 'GHS',
 *   type: 'premium_upgrade',
 *   metadata: { user_id: user.id }
 * });
 * 
 * Mock Mode:
 * - When VITE_USE_MOCK=true, payment flows work without real Paystack
 * - Payments are simulated with immediate success
 * - Useful for development and demos
 */

import apiClient from "./apiClient";

/**
 * Mock Mode Detection
 */
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

// Configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_your_actual_key_here";
const PAYSTACK_SCRIPT_URL = "https://js.paystack.co/v1/inline.js";

// Premium plan pricing (in kobo - smallest currency unit)
export const PREMIUM_PLANS = {
  monthly: 4900, // GHS 49.00/month
  yearly: 49000, // GHS 490.00/year (approximate, adjust as needed)
};

/**
 * Load Paystack script dynamically
 * @returns {Promise<boolean>} True if script loaded successfully
 */
export const initializePaystack = () => {
  // In mock mode, skip script loading
  if (USE_MOCK) {
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    // Check if script already loaded
    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(`script[src="${PAYSTACK_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => reject(new Error("Failed to load Paystack script"));
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.body.appendChild(script);
  });
};

/**
 * Generate payment reference
 * @param {string} type - Payment type (premium_upgrade, wallet_topup, etc.)
 * @returns {string} Unique payment reference
 */
const generateReference = (type = "payment") => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `rc_${type}_${timestamp}_${random}`;
};

/**
 * Initiate Paystack payment
 * @param {Object} options - Payment options
 * @param {string} options.email - User email
 * @param {number} options.amount - Amount in kobo (smallest currency unit)
 * @param {string} options.currency - Currency code (default: 'GHS')
 * @param {string} options.type - Payment type (premium_upgrade, wallet_topup, etc.)
 * @param {Object} options.metadata - Additional metadata
 * @param {Function} options.onSuccess - Success callback (receives reference)
 * @param {Function} options.onCancel - Cancel callback
 * @param {Function} options.onError - Error callback (receives error)
 * @returns {Promise<void>}
 */
export const initiatePayment = async ({
  email,
  amount,
  currency = "GHS",
  type = "payment",
  metadata = {},
  onSuccess,
  onCancel,
  onError,
}) => {
  // Mock mode - simulate payment
  if (USE_MOCK) {
    if (!email) {
      const error = new Error("Email is required for payment");
      if (onError) {
        onError(error);
        return;
      }
      throw error;
    }

    if (!amount || amount <= 0) {
      const error = new Error("Valid amount is required");
      if (onError) {
        onError(error);
        return;
      }
      throw error;
    }

    const reference = generateReference(type);
    
    // Simulate payment delay (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Simulate success (in mock mode, always succeeds)
    if (onSuccess) {
      onSuccess(reference, {
        reference,
        status: "success",
        message: "Payment successful (mock mode)",
      });
    }
    
    return;
  }

  try {
    // Initialize Paystack if not already loaded
    await initializePaystack();

    if (!window.PaystackPop) {
      throw new Error("Paystack script failed to load");
    }

    if (!email) {
      throw new Error("Email is required for payment");
    }

    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required");
    }

    const reference = generateReference(type);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount), // Ensure integer (kobo)
      currency: currency.toUpperCase(),
      ref: reference,
      metadata: {
        ...metadata,
        payment_type: type,
        reference,
      },
      callback: (response) => {
        if (onSuccess) {
          onSuccess(response.reference, response);
        }
      },
      onClose: () => {
        if (onCancel) {
          onCancel();
        }
      },
    });

    handler.openIframe();
  } catch (error) {
    console.error("Initiate payment error:", error);
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
  }
};

/**
 * Verify Paystack payment on backend
 * @param {string} reference - Payment reference from Paystack
 * @returns {Promise<Object>} Verification result
 */
export const verifyPaystackPayment = async (reference) => {
  if (USE_MOCK) {
    // In mock mode, always return success
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      success: true,
      message: "Payment verified successfully (mock mode)",
      reference,
      amount: 0, // Amount would be stored in metadata
      status: "success",
    };
  }

  try {
    if (!reference) {
      throw new Error("Payment reference is required");
    }

    const { data } = await apiClient.post("/payments/verify-paystack/", {
      reference,
    });

    return data;
  } catch (err) {
    console.error("Verify payment error:", err);
    throw err.response?.data || { message: "Failed to verify payment" };
  }
};

/**
 * Initiate premium upgrade payment
 * @param {Object} options - Payment options
 * @param {string} options.email - User email
 * @param {string} options.plan - Plan type ('monthly' or 'yearly')
 * @param {Object} options.user - User object (for metadata)
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onCancel - Cancel callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<void>}
 */
export const initiatePremiumUpgrade = async ({
  email,
  plan = "monthly",
  user = {},
  onSuccess,
  onCancel,
  onError,
}) => {
  const amount = PREMIUM_PLANS[plan] || PREMIUM_PLANS.monthly;

  return initiatePayment({
    email,
    amount,
    currency: "GHS",
    type: "premium_upgrade",
    metadata: {
      user_id: user.id,
      full_name: user.full_name,
      role: user.role,
      plan,
    },
    onSuccess,
    onCancel,
    onError,
  });
};

/**
 * Initiate wallet top-up payment
 * @param {Object} options - Payment options
 * @param {string} options.email - User email
 * @param {number} options.amount - Amount in GHS (will be converted to kobo)
 * @param {Object} options.user - User object (for metadata)
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onCancel - Cancel callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<void>}
 */
export const initiateWalletTopUp = async ({
  email,
  amount, // Amount in GHS
  user = {},
  onSuccess,
  onCancel,
  onError,
}) => {
  const amountInKobo = Math.round(amount * 100); // Convert GHS to kobo

  return initiatePayment({
    email,
    amount: amountInKobo,
    currency: "GHS",
    type: "wallet_topup",
    metadata: {
      user_id: user.id,
      full_name: user.full_name,
      role: user.role,
      amount_ghs: amount,
    },
    onSuccess,
    onCancel,
    onError,
  });
};

export default {
  initializePaystack,
  initiatePayment,
  verifyPaystackPayment,
  initiatePremiumUpgrade,
  initiateWalletTopUp,
  PREMIUM_PLANS,
};

