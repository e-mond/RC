// src/components/UpgradeCTA.jsx
import React, { useState } from "react";
import { createStripeSession, initFlutterwave } from "@/services/billingService";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

/**
 * UpgradeCTA
 * - Props:
 *    planId (string) default 'premium_monthly'
 *    provider: 'stripe' | 'flutterwave' (ui choice)
 */
export default function UpgradeCTA({ planId = "premium_monthly", provider = "stripe" }) {
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    setLoading(true);
    try {
      if (provider === "stripe") {
        const res = await createStripeSession(planId);
        if (res?.url) {
          window.location.href = res.url;
          return;
        }
        toast.error("Failed to create Stripe session.");
      } else {
        const res = await initFlutterwave(planId);
        if (res?.link) {
          window.location.href = res.link;
          return;
        }
        toast.error("Failed to initialize Flutterwave payment.");
      }
    } catch (err) {
      console.error("startCheckout:", err);
      toast.error(err.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={startCheckout} disabled={loading} variant="primary">
        {loading ? "Redirecting…" : "Upgrade to Premium"}
      </Button>
      <Button onClick={() => toast("Contact sales at sales@rentalconnects.gh")} variant="ghost">Contact Sales</Button>
    </div>
  );
}
