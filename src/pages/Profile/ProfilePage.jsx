// src/pages/Profile/ProfilePage.jsx
import { useState, useEffect, memo, useCallback, useMemo } from "react";
import {
  Shield,
  Crown,
  Mail,
  Phone,
  Sun,
  Moon,
  Loader2,
  Star,
  CheckCircle,
  Bell,
  Lock,
  Eye,
  Globe,
  Settings,
  Wallet,
} from "lucide-react";

import { useAuthStore } from "@/stores/authStore";
import { useFeatureStore } from "@/stores/featureStore";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import useLanguage from "@/hooks/useLanguage";

import Button from "@/components/ui/Button";
import WalletDisplay from "@/components/common/WalletDisplay";
import WalletSetupModal from "@/components/common/WalletSetupModal";
import WalletTopUpModal from "@/components/common/WalletTopUpModal";
import TwoFactorSetupModal from "@/components/security/TwoFactorSetupModal";
import { ReviewsList, ReviewForm, BackgroundStatusPanel } from "@/components/reviews";
import { getUserReviews, createReview } from "@/services/reviewService";
import TrustScore from "@/components/ai/TrustScore";

import { SUBSCRIPTION_CONFIG } from "@/config/subscriptionConfig";
import { isMockMode } from "@/mocks/mockManager";
import { getPreferences, updatePreferences } from "@/services/preferencesService";
import { getWallet } from "@/services/walletService";

import { toast } from "react-hot-toast";

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
const formatRole = (role) => {
  if (!role) return "Tenant";
  return role
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getDisplayName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "Guest User";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, isLandlord, isArtisan, isAdmin: isAdminRole } = useAuthStore();
  const { plan, setPlan } = useFeatureStore();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [pendingReference, setPendingReference] = useState(null);

  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [showWalletSetup, setShowWalletSetup] = useState(false);
  const [showWalletTopUp, setShowWalletTopUp] = useState(false);

  const [preferences, setPreferences] = useState(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_breakdown: {},
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Verification status (mock)
  const [verificationStatus] = useState({
    identity_verified: user?.role === "landlord" || user?.role === "artisan",
    background_check_status: user?.role === "landlord" ? "verified" : "unverified",
    payment_verified: false,
    document_verified: user?.role === "landlord" || user?.role === "artisan",
    overall_status: user?.role === "landlord" ? "verified" : "unverified",
  });

  // Derived values
  const role = user?.role || "tenant";
  const formattedRole = formatRole(role);
  const displayName = getDisplayName(user?.full_name);
  const isPremium = plan === "premium";
  const isAdmin = isAdminRole || role === "admin" || role === "super-admin";
  const needsWallet = isLandlord() || isArtisan() || isAdmin;

  const { premiumPrice, featuresByRole } = SUBSCRIPTION_CONFIG;
  const premiumFeatures = featuresByRole[role] || featuresByRole.tenant || [];

  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  const PREMIUM_AMOUNT_KOBO = useMemo(
    () => Math.round(premiumPrice.monthly * 100),
    [premiumPrice.monthly]
  );

  // ─── Paystack Script Loading ───────────────────────────────
  useEffect(() => {
    if (paystackLoaded || isPremium || isAdmin || !PAYSTACK_PUBLIC_KEY) return;

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () =>
      setMessage({
        text: t("paymentGatewayLoadFailed", "Failed to load payment gateway"),
        type: "error",
      });
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [paystackLoaded, isPremium, isAdmin, PAYSTACK_PUBLIC_KEY, t]);

  // ─── Wallet Loading ─────────────────────────────────────────
  useEffect(() => {
    if (!needsWallet || !user) {
      setWallet(null);
      setWalletLoading(false);
      return;
    }

    let mounted = true;

    const loadWallet = async () => {
      try {
        setWalletLoading(true);
        const data = await getWallet();
        if (mounted) {
          setWallet(data || { is_setup: false, balance: 0, currency: "GHS" });
        }
      } catch (err) {
        console.error("Wallet load error:", err);
        if (mounted) setWallet({ is_setup: false, balance: 0, currency: "GHS" });
      } finally {
        if (mounted) setWalletLoading(false);
      }
    };

    loadWallet();

    return () => {
      mounted = false;
    };
  }, [needsWallet, user]);

  // ─── Preferences Loading ────────────────────────────────────
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const prefs = await getPreferences();
        setPreferences(prefs);
      } catch (err) {
        console.error("Preferences load error:", err);
      }
    };
    loadPrefs();
  }, []);

  // ─── Payment Verification ───────────────────────────────────
  const verifyPayment = useCallback(
    async (reference) => {
      if (!reference) return;

      setLoading(true);

      if (isMockMode()) {
        setPlan("premium");
        toast.success(t("demoUpgradeSuccess", "Upgrade successful (demo mode)"));
        setLoading(false);
        setPendingReference(null);
        return;
      }

      try {
        const { verifyPaystackPayment } = await import("@/services/paystackService");
        const verification = await verifyPaystackPayment(reference);

        if (verification.success) {
          setPlan("premium");
          toast.success(t("paymentSuccess", "Upgrade successful! Welcome to Premium 🎉"));
        } else {
          setMessage({
            text: verification.message || t("paymentVerificationFailed", "Payment verification failed"),
            type: "error",
          });
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setMessage({
          text: err.message || t("networkError", "Network error. Please try again."),
          type: "error",
        });
      } finally {
        setLoading(false);
        setPendingReference(null);
      }
    },
    [setPlan, t]
  );

  useEffect(() => {
    if (pendingReference) {
      verifyPayment(pendingReference);
    }
  }, [pendingReference, verifyPayment]);

  // ─── Load Reviews ───────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await getUserReviews(user.id);
        if (mounted) {
          setReviews(data.reviews || []);
          setReviewsData({
            average_rating: data.average_rating || 0,
            total_reviews: data.total_reviews || 0,
            rating_breakdown: data.rating_breakdown || {},
          });
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
        if (mounted) {
          setReviews([]);
        }
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    };

    loadReviews();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // ─── Payment & Other Handlers ───────────────────────────────
  const handleUpgrade = () => {
    if (!paystackLoaded) {
      setMessage({
        text: t("paymentSystemLoading", "Payment system is still loading..."),
        type: "info",
      });
      return;
    }

    if (!user?.email) {
      setMessage({
        text: t("emailRequired", "Email is required for payment"),
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: PREMIUM_AMOUNT_KOBO,
      currency: premiumPrice.currency || "GHS",
      ref: `rc_upgrade_${user.id}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      metadata: {
        user_id: user.id,
        full_name: user.full_name,
        plan: "premium",
        role,
      },
      callback: (response) => {
        setPendingReference(response.reference);
        setMessage({
          text: t("verifyingPayment", "Verifying your payment..."),
          type: "info",
        });
      },
      onClose: () => {
        setLoading(false);
        setMessage({
          text: t("paymentCancelled", "Payment was cancelled"),
          type: "info",
        });
      },
    });

    handler.openIframe();
  };

  const handleDowngrade = () => {
    if (!window.confirm(t("confirmDowngrade", "Downgrade to Free plan? You'll lose premium features."))) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setPlan("free");
      toast.success(t("downgradedToFree", "Successfully downgraded to Free plan"));
      setLoading(false);
    }, 800);
  };

  const handlePreferenceToggle = async (key, value) => {
    if (!preferences) return;

    setSavingPrefs(true);
    try {
      const updated = await updatePreferences({ [key]: value });
      setPreferences(updated);
      toast.success(t("settingsUpdated", "Settings updated successfully"));
    } catch (err) {
      toast.error(err.message || t("updateFailed", "Failed to update settings"));
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleWalletSetupSuccess = async () => {
    try {
      const data = await getWallet();
      setWallet(data);
      toast.success(t("walletSetupSuccess", "Wallet setup completed successfully!"));
    } catch {
      toast.error(t("walletReloadFailed", "Wallet setup done, but couldn't reload data"));
    }
  };

  const handleWalletTopUpSuccess = async () => {
    try {
      const data = await getWallet();
      setWallet(data);
      toast.success(t("walletTopUpSuccess", "Wallet top-up completed successfully!"));
    } catch {
      toast.error(t("walletReloadFailed", "Top-up done, but couldn't reload wallet data"));
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await createReview(reviewData);

      const data = await getUserReviews(user.id);
      setReviews(data.reviews || []);
      setReviewsData({
        average_rating: data.average_rating || 0,
        total_reviews: data.total_reviews || 0,
        rating_breakdown: data.rating_breakdown || {},
      });

      setShowReviewForm(false);
      toast.success("Review submitted! It will be visible after moderation.");
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.error(err.message || "Failed to submit review");
    }
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t("myAccount", "My Account")}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {displayName}
          </h1>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
            {formattedRole}
            {!isAdmin && ` • ${isPremium ? t("premiumPlan") : t("freePlan")}`}
          </p>
          {user?.id && (
            <div className="mt-3">
              <TrustScore userId={user.id} size="md" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("toggleTheme", "Toggle theme")}
          >
            {isDark ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </header>

      {/* Messages */}
      {message.text && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
              : message.type === "info"
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
          }`}
        >
          {message.type === "success" && <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-emerald-600" />
            {t("contactInformation", "Contact Information")}
          </h2>
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <span>{user?.email || t("notProvided")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} />
              <span>{user?.phone || t("notProvided")}</span>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5 text-sky-500" />
            {t("accountSettings", "Account Settings")}
          </h2>

          {preferences ? (
            <div className="space-y-5 text-sm">
              {/* Email Notifications */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-sky-500" />
                  <span className="font-medium">{t("emailNotifications")}</span>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("emailNotifications", !preferences.emailNotifications)}
                  disabled={savingPrefs}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    preferences.emailNotifications ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={preferences.emailNotifications ? "Disable email notifications" : "Enable email notifications"}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.emailNotifications ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-sky-500" />
                  <span className="font-medium">{t("smsNotifications", "SMS Notifications")}</span>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("smsNotifications", !(preferences.smsNotifications || false))}
                  disabled={savingPrefs}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    preferences.smsNotifications ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={preferences.smsNotifications ? "Disable SMS notifications" : "Enable SMS notifications"}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.smsNotifications ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Two-Factor Authentication – IMPROVED LAYOUT */}
              <div className="py-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium block">{t("twoFactorAuth", "Two-Factor Authentication")}</span>
                      {preferences.twoFactorAuth && (
                        <span className="mt-1 inline-block px-2.5 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full">
                          {t("enabled", "Enabled")}
                        </span>
                      )}
                    </div>
                  </div>

                  {!preferences.twoFactorAuth && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setShow2FAModal(true)}
                      disabled={savingPrefs}
                      className="shrink-0 self-start sm:self-center"
                    >
                      {t("enable")}
                    </Button>
                  )}
                </div>

                {/* When enabled → Manage button on its own line */}
                {preferences.twoFactorAuth && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShow2FAModal(true)}
                      disabled={savingPrefs}
                      className="text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/40 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                      {t("manage")}
                    </Button>
                  </div>
                )}
              </div>

              {/* Profile Visibility */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-sky-500" />
                  <span className="font-medium">{t("profileVisibility", "Profile Visibility")}</span>
                </div>
                <select
                  value={preferences.profileVisibility || "public"}
                  onChange={(e) => handlePreferenceToggle("profileVisibility", e.target.value)}
                  disabled={savingPrefs}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="public">{t("public", "Public")}</option>
                  <option value="private">{t("private", "Private")}</option>
                  <option value="friendsOnly">{t("friendsOnly", "Friends Only")}</option>
                </select>
              </div>

              {/* Marketing Emails */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-sky-500" />
                  <span className="font-medium">{t("marketingEmails", "Marketing Emails")}</span>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("marketingEmails", !(preferences.marketingEmails !== false))}
                  disabled={savingPrefs}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    preferences.marketingEmails !== false ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={preferences.marketingEmails !== false ? "Disable marketing emails" : "Enable marketing emails"}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.marketingEmails !== false ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Language Selection */}
              <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-sky-500" />
                  <span className="font-medium">{t("language")}</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setLanguage(newLang);
                    if (preferences) {
                      handlePreferenceToggle("language", newLang);
                    }
                  }}
                  disabled={savingPrefs}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("loadingSettings", "Loading settings...")}
            </div>
          )}
        </div>

        {/* 3. Wallet Section */}
        {needsWallet && (
          <div className="bg-linear-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                {t("paymentWallet", "Payment Wallet")}
              </h2>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="w-3 h-3" />
                <span>Paystack</span>
              </div>
            </div>
            <WalletDisplay
              wallet={walletLoading ? null : wallet}
              showSetupButton={!walletLoading && wallet && wallet.is_setup !== true}
              onSetupClick={() => setShowWalletSetup(true)}
              onTopUpClick={() => setShowWalletTopUp(true)}
            />
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Secure Payments with Paystack</p>
              <p>All transactions are processed securely through Paystack. Your payment information is encrypted and protected.</p>
            </div>
          </div>
        )}

        {/* 4. Subscription Plan */}
        {!isAdmin && (
          <div className="bg-linear-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 shadow-lg lg:col-span-1">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                {t("subscriptionPlan")}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isPremium
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {isPremium ? "Premium" : "Free"}
              </span>
            </div>

            {isPremium ? (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
                    <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                      {t("premiumActive")}
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{premiumPrice.display}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per month, billed monthly</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Premium Features:</p>
                  <div className="space-y-2">
                    {premiumFeatures.map((feature, i) => (
                      <p key={i} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle size={16} className="shrink-0" />
                        <span>{feature}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleDowngrade}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t("processing")}
                    </>
                  ) : (
                    t("downgradeToFree")
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t("freePlan")}</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">₵0</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("upgradeToUnlock", "Upgrade to unlock premium features")}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Premium Features:</p>
                  <ul className="space-y-2 text-sm">
                    {premiumFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <Star size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={handleUpgrade}
                  disabled={loading || !paystackLoaded}
                  variant="primary"
                  size="lg"
                  className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <Star size={18} className="mr-2" />
                      {t("upgradeToPremium")} – {premiumPrice.display}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Cancel anytime • Secure payment via Paystack
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verification Panel */}
      {(isLandlord() || isArtisan() || role === "tenant") && (
        <div className="mt-8">
          <BackgroundStatusPanel
            userId={user?.id}
            userRole={role}
            verificationStatus={verificationStatus}
          />
        </div>
      )}

      {/* Reviews Section */}
      {(isLandlord() || isArtisan() || role === "tenant") && (
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Reviews & Ratings
            </h2>
            {((isLandlord() && role === "tenant") || (role === "landlord" && isLandlord())) && !showReviewForm && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowReviewForm(true)}
              >
                Write Review
              </Button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                reviewType={isLandlord() ? "tenant" : "landlord"}
                targetId={user?.id}
                targetName={user?.full_name}
                onSubmit={handleSubmitReview}
                onCancel={() => setShowReviewForm(false)}
                disabled={loading}
              />
            </div>
          )}

          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          ) : (
            <ReviewsList
              reviews={reviews}
              averageRating={reviewsData.average_rating}
              totalReviews={reviewsData.total_reviews}
              ratingBreakdown={reviewsData.rating_breakdown}
              showModerationStatus={isAdmin}
            />
          )}
        </div>
      )}

      {/* Modals */}
      {needsWallet && (
        <>
          <WalletSetupModal
            isOpen={showWalletSetup}
            onClose={() => setShowWalletSetup(false)}
            onSuccess={handleWalletSetupSuccess}
          />
          <WalletTopUpModal
            isOpen={showWalletTopUp}
            onClose={() => setShowWalletTopUp(false)}
            onSuccess={handleWalletTopUpSuccess}
            user={user}
            currentBalance={wallet?.balance || 0}
          />
        </>
      )}

      <TwoFactorSetupModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        userEmail={user?.email || ""}
        isEnabled={preferences?.twoFactorAuth || false}
        onSuccess={({ enabled }) => {
          setPreferences((prev) => ({ ...prev, twoFactorAuth: enabled }));
          updatePreferences({ twoFactorAuth: enabled }).catch(console.warn);
        }}
      />
    </div>
  );
};

export default memo(ProfilePage);