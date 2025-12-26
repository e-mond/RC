// src/components/UpgradeCTA.jsx
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

/**
 * UpgradeCTA – Paystack Payment Integration
 *
 * Props:
 *   planId: string (e.g., "premium_monthly", "premium_yearly")
 *   email: string (user's email – required by Paystack)
 *   amount: number (in kobo/pesewas – e.g., 500000 for ₵500 or ₦500)
 *   publicKey: string (from .env)
 *
 * Uses Paystack inline popup for secure payments
 */
export default function UpgradeCTA({ planId = "premium_monthly", email, amount = 500000 }) {
  const [loading, setLoading] = useState(false);

  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!PAYSTACK_PUBLIC_KEY) {
    console.error("Paystack public key missing. Add VITE_PAYSTACK_PUBLIC_KEY to .env");
    return <p className="text-red-600">Payment configuration error.</p>;
  }

  const planNames = {
    premium_monthly: "Premium Monthly",
    premium_yearly: "Premium Yearly",
  };

  const startCheckout = () => {
    if (!email) {
      toast.error("User email required for payment");
      return;
    }

    setLoading(true);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount, 
      currency: "GHS",
      ref: `rentalconnects_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      metadata: {
        plan: planId,
        custom_fields: [
          {
            display_name: "Plan",
            variable_name: "plan",
            value: planNames[planId] || planId,
          },
        ],
      },
      callback: function (response) {
        // Success – verify on backend
        verifyPayment(response.reference);
      },
      onClose: function () {
        toast("Payment cancelled");
        setLoading(false);
      },
    });

    handler.openIframe();
  };

  const verifyPayment = async (reference) => {
    try {
      // Call your backend to verify Paystack transaction
      const res = await fetch("/api/billing/verify-paystack/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, planId }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Upgrade successful! Welcome to Premium 🎉");
        // Optionally reload user data or redirect
        window.location.reload();
      } else {
        toast.error(data.message || "Payment verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Verification failed. Contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button onClick={startCheckout} disabled={loading} variant="primary" size="lg">
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Initializing...
          </>
        ) : (
          "Upgrade to Premium"
        )}
      </Button>
      <Button
        onClick={() => toast("Contact sales at sales@rentalconnects.gh")}
        variant="ghost"
      >
        Contact Sales
      </Button>
    </div>
  );
}