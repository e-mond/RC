// src/components/UpgradeCTA.jsx
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react"; // Fixed: required for loading state

/**
 * UpgradeCTA – Paystack Payment Integration
 * Current mode: Frontend success simulation (mock) since backend verification is unavailable
 * When backend is ready → uncomment the real verifyPayment fetch
 */
export default function UpgradeCTA({
  planId = "premium_monthly",
  email,
  amount = 490000, // ₵49.00 in pesewas (adjust to your real pricing)
}) {
  const [loading, setLoading] = useState(false);

  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!PAYSTACK_PUBLIC_KEY) {
    console.error("Missing Paystack public key. Add VITE_PAYSTACK_PUBLIC_KEY to .env");
    return <p className="text-red-600 font-medium">Payment system configuration error</p>;
  }

  const planNames = {
    premium_monthly: "Premium Monthly",
    premium_yearly: "Premium Yearly",
  };

  const startCheckout = () => {
    if (!email) {
      toast.error("User email is required for payment");
      return;
    }

    setLoading(true);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount,
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
        // Success callback - currently showing mock success
        toast.success("Payment successful! Premium features unlocked (mock mode)");
        console.log("Payment Reference:", response.reference);
        window.location.reload(); // Simulate upgrade by refreshing
        setLoading(false);
      },
      onClose: function () {
        toast("Payment window closed");
        setLoading(false);
      },
    });

    handler.openIframe();
  };

  // When backend is ready, replace the mock with this function:
  // const verifyPayment = async (reference) => {
  //   try {
  //     const res = await fetch("/api/billing/verify-paystack/", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ reference, planId }),
  //     });
  //
  //     if (!res.ok) {
  //       throw new Error(`Server error: ${res.status} ${res.statusText}`);
  //     }
  //
  //     const data = await res.json();
  //
  //     if (data.success) {
  //       toast.success("Upgrade successful! Welcome to Premium 🎉");
  //       window.location.reload();
  //     } else {
  //       toast.error(data.message || "Payment verification failed");
  //     }
  //   } catch (err) {
  //     console.error("Verification error:", err);
  //     toast.error("Verification failed. Please contact support.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
      <Button
        onClick={startCheckout}
        disabled={loading}
        variant="primary"
        size="lg"
        className="w-full sm:w-auto min-w-[180px]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          "Upgrade to Premium"
        )}
      </Button>

      <Button
        onClick={() => toast("Contact sales at sales@rentalconnects.gh")}
        variant="ghost"
        className="w-full sm:w-auto"
      >
        Contact Sales
      </Button>
    </div>
  );
}