// src/pages/Ads/ManageAds.jsx
import React, { useState, useEffect } from "react";
import { Megaphone, Zap, TrendingUp, Target, Star, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import AdsList from "./AdsList";
import { getMyAds, createBoost, cancelBoost } from "@/services/adsService";
import { useAuthStore } from "@/stores/authStore";

const BOOST_PACKAGES = [
  {
    id: "basic",
    name: "Basic Boost",
    price: 15,
    duration: 7,
    multiplier: "3x",
    icon: Zap,
    color: "bg-amber-500",
    features: ["Top of search results", "Highlighted badge", "Faster inquiries"],
  },
  {
    id: "featured",
    name: "Featured Listing",
    price: 29,
    duration: 14,
    multiplier: "10x",
    icon: TrendingUp,
    color: "bg-emerald-500",
    popular: true,
    features: ["Homepage placement", "Priority badge", "Extended visibility"],
  },
  {
    id: "premium",
    name: "Premium Promotion",
    price: 49,
    duration: 30,
    multiplier: "20x",
    icon: Target,
    color: "bg-purple-600",
    features: ["All Featured + Social boost", "Analytics report", "Maximum reach"],
  },
];

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export default function ManageAds() {
  const { user } = useAuthStore();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // ← NEW: Global processing guard

  const role = user?.role;
  const itemType = role === "landlord" ? "property" : "service";

  // Load Paystack script once
  useEffect(() => {
    if (paystackLoaded) return;

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => {
      console.error("Paystack script failed to load");
      alert("Failed to load payment gateway. Please check your connection.");
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [paystackLoaded]);

  // Load user's active ads
  useEffect(() => {
    const loadAds = async () => {
      try {
        const data = await getMyAds();
        setAds(data || []);
      } catch (err) {
        console.error("Failed to load ads:", err);
        alert(err.message || "Failed to load promotions");
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, []);

  const initiatePayment = (pkg) => {
    // ← PREVENT MULTIPLE SIMULTANEOUS PAYMENTS
    if (isProcessing) {
      alert("A payment is already in progress. Please wait.");
      return;
    }

    if (!paystackLoaded) {
      alert("Payment system is still loading. Please wait...");
      return;
    }

    if (!user?.email) {
      alert("Your email is required to process payment.");
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes("your_key")) {
      alert("Payment configuration error. Contact support.");
      return;
    }

    setIsProcessing(true); // ← Lock all buttons

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: pkg.price * 100, // Correct for GHS (pesewas)
      currency: "GHS",
      ref: `boost_${user.id}_${Date.now()}`,
      metadata: {
        user_id: user.id,
        package: pkg.id,
        role: role,
      },
      callback: async (response) => {
        try {
          await createBoost({
            reference: response.reference,
            packageId: pkg.id,
          });
          alert("Boost activated successfully! 🎉 Your listing is now promoted.");
          const data = await getMyAds();
          setAds(data || []);
        } catch (error) {
          console.error("Boost activation failed:", error);
          alert("Activation failed. Please contact support with your reference.");
        } finally {
          setIsProcessing(false);
        }
      },
      onClose: () => {
        setIsProcessing(false);
        alert("Payment was cancelled.");
      },
    });

    handler.openIframe();
  };

  const handleCancel = async (adId) => {
    if (!window.confirm("Cancel this promotion? You will not be refunded.")) return;

    try {
      await cancelBoost(adId);
      setAds((prev) => prev.filter((a) => a.id !== adId));
      alert("Promotion cancelled successfully.");
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(err.message || "Failed to cancel promotion");
    }
  };

  const handleRenew = (ad) => {
    const pkg = BOOST_PACKAGES.find((p) => p.id === ad.packageId);
    if (pkg) {
      initiatePayment(pkg);
    } else {
      alert("Package information not found.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-16 h-16 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Boost Your {itemType === "property" ? "Property" : "Service"}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 max-w-3xl mx-auto">
          Get up to <span className="font-bold text-[#0b6e4f]">20x more views and inquiries</span> by promoting your listing
        </p>
      </div>

      {/* Packages */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Choose Your Boost
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {BOOST_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-8 shadow-2xl border-2 transition-all hover:scale-105 hover:shadow-3xl ${
                pkg.popular
                  ? "border-[#0b6e4f] bg-gradient-to-br from-[#0b6e4f]/5 to-emerald-50 dark:from-[#0b6e4f]/20 dark:to-gray-900"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#0b6e4f] text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg">
                  <Star className="w-5 h-5" />
                  MOST POPULAR
                </div>
              )}

              <div className={`w-20 h-20 ${pkg.color} rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg`}>
                <pkg.icon className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                {pkg.name}
              </h3>

              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">GHS {pkg.price}</span>
                <p className="text-gray-600 dark:text-gray-400 mt-2">for {pkg.duration} days</p>
                <p className="text-2xl font-bold text-[#0b6e4f] mt-4">~{pkg.multiplier} more reach</p>
              </div>

              <ul className="space-y-4 mb-10">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full text-lg py-6 font-medium"
                disabled={isProcessing} // ← All buttons disabled during processing
                onClick={() => initiatePayment(pkg)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Boost Now"
                )}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Active Boosts */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Your Active Promotions
        </h2>
        <AdsList ads={ads} onRenew={handleRenew} onCancel={handleCancel} />
      </section>
    </div>
  );
}