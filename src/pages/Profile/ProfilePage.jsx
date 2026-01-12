// src/pages/Profile/ProfilePage.jsx
import { useState, useEffect, memo } from "react";
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
import { ReviewsList, ReviewForm, BackgroundStatusPanel } from "@/components/reviews";
import { getUserReviews, createReview } from "@/services/reviewService";

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

  const [preferences, setPreferences] = useState(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_breakdown: {},
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Verification status (mock data for now)
  const [verificationStatus, setVerificationStatus] = useState({
    identity_verified: user?.role === "landlord" || user?.role === "artisan",
    background_check_status: user?.role === "landlord" ? "verified" : "unverified",
    payment_verified: false,
    document_verified: user?.role === "landlord" || user?.role === "artisan",
    overall_status: user?.role === "landlord" ? "verified" : "unverified",
  });

  // Role & Plan info
  const role = user?.role || "tenant";
  const formattedRole = formatRole(role);
  const displayName = getDisplayName(user?.full_name);
  const isPremium = plan === "premium";
  const isAdmin = isAdminRole || role === "admin" || role === "super-admin";

  // Who needs wallet?
  const needsWallet = isLandlord() || isArtisan() || isAdmin;

  const { premiumPrice, featuresByRole } = SUBSCRIPTION_CONFIG;
  const premiumFeatures = featuresByRole[role] || featuresByRole.tenant || [];

  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_your_key_here";
  const PREMIUM_AMOUNT_KOBO = premiumPrice.monthly * 100000; // assuming price in main unit

  // ─── Paystack Script Loading ───────────────────────────────
  useEffect(() => {
    if (paystackLoaded || isPremium || isAdmin) return;

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
  }, [paystackLoaded, isPremium, isAdmin, t]);

  // ─── Wallet Loading ─────────────────────────────────────────
  useEffect(() => {
    if (!needsWallet || !user) {
      // Clear wallet state if user doesn't need wallet
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
          // Ensure wallet object has is_setup property
          setWallet(data || { is_setup: false });
        }
      } catch (err) {
        console.error("Failed to load wallet:", err);
        // Set default wallet state if fetch fails
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

  // ─── Preferences ────────────────────────────────────────────
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const prefs = await getPreferences();
        setPreferences(prefs);
      } catch (err) {
        console.error("Failed to load preferences:", err);
      }
    };
    loadPrefs();
  }, []);

  // Auto-verify after payment callback
  useEffect(() => {
    if (pendingReference) {
      verifyPayment(pendingReference);
    }
  }, [pendingReference]);

  // ─── Load Reviews ─────────────────────────────────────────
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

  // ─── Payment Handlers ───────────────────────────────────────
  const verifyPayment = async (reference) => {
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
      const res = await fetch("/api/billing/verify-paystack/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPlan("premium");
        toast.success(t("paymentSuccess", "Upgrade successful! Welcome to Premium 🎉"));
      } else {
        setMessage({
          text: data.message || t("paymentVerificationFailed", "Payment verification failed"),
          type: "error",
        });
      }
    } catch {
      setMessage({
        text: t("networkError", "Network error. Please try again."),
        type: "error",
      });
    } finally {
      setLoading(false);
      setPendingReference(null);
    }
  };

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
        role: role,
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
    // In real app → call backend to cancel subscription
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

  // ─── Wallet Setup Success Handler ───────────────────────────
  const handleWalletSetupSuccess = async () => {
    try {
      const data = await getWallet();
      setWallet(data);
      toast.success(t("walletSetupSuccess", "Wallet setup completed successfully!"));
    } catch {
      toast.error(t("walletReloadFailed", "Wallet setup done, but couldn't reload data"));
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmittingReview(true);
      await createReview(reviewData);
      
      // Reload reviews
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
      throw err;
    } finally {
      setSubmittingReview(false);
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
            {formattedRole} • {isPremium ? t("premiumPlan") : t("freePlan")}
          </p>
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

      {/* Global Messages */}
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
        {/* 1. Contact Information */}
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

        {/* 2. Account Settings / Preferences */}
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

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-sky-500" />
                  <span className="font-medium">{t("twoFactorAuth", "Two-Factor Authentication")}</span>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("twoFactorAuth", !(preferences.twoFactorAuth || false))}
                  disabled={savingPrefs}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    preferences.twoFactorAuth ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={preferences.twoFactorAuth ? "Disable 2FA" : "Enable 2FA"}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      preferences.twoFactorAuth ? "translate-x-5" : ""
                    }`}
                  />
                </button>
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
                    // Update preferences
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

        {/* 3. Wallet Section - Prominently displayed for roles that need it */}
        {needsWallet && (
          <div className="bg-linear-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-5">
              <Wallet className="w-5 h-5 text-blue-600" />
              {t("paymentWallet", "Payment Wallet")}
            </h2>
            <WalletDisplay
              wallet={walletLoading ? null : wallet}
              showSetupButton={!walletLoading && wallet && wallet.is_setup !== true}
              onSetupClick={() => setShowWalletSetup(true)}
              onTopUpClick={() => {
                // Top-up functionality can be added here if needed
                toast.info("Top-up feature coming soon");
              }}
            />
          </div>
        )}

        {/* 4. Subscription (when applicable) */}
        <div className="bg-linear-to-br from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-5">
            <Crown className="w-5 h-5 text-amber-500" />
            {isAdmin ? t("fullSystemAccess") : t("subscriptionPlan")}
          </h2>

          {isAdmin ? (
            <div className="text-center py-10">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {t("administratorAccess")}
              </p>
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                {t("adminFullAccessDescription")}
              </p>
            </div>
          ) : (
            <>
              {isPremium ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Star className="w-8 h-8 text-amber-500" />
                    <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                      {t("premiumActive")}
                    </span>
                  </div>

                  <p className="text-lg font-medium">{premiumPrice.display}</p>

                  <div className="space-y-2">
                    {premiumFeatures.map((feature, i) => (
                      <p key={i} className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle size={16} />
                        {feature}
                      </p>
                    ))}
                  </div>

                  <Button
                    onClick={handleDowngrade}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? t("processing") : t("downgradeToFree")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-xl font-semibold">{t("freePlan")}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t("upgradeToUnlock")}
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {premiumFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Star size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleUpgrade}
                    disabled={loading || !paystackLoaded}
                    variant="primary"
                    size="lg"
                    className="w-full"
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
                </div>
              )}

            </>
          )}
        </div>
      </div>

      {/* Verification Status Panel */}
      {(isLandlord() || isArtisan() || role === "tenant") && (
        <div className="mt-6">
          <BackgroundStatusPanel
            userId={user?.id}
            userRole={role}
            verificationStatus={verificationStatus}
          />
        </div>
      )}

      {/* Reviews Section */}
      {(isLandlord() || isArtisan() || role === "tenant") && (
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Reviews & Ratings
            </h2>
            {((isLandlord() && role === "tenant") || (role === "landlord" && isLandlord())) && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 text-sm font-medium text-[#0b6e4f] dark:text-emerald-400 hover:bg-[#0b6e4f]/10 dark:hover:bg-emerald-400/10 rounded-lg transition-colors"
              >
                Write Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-6">
              <ReviewForm
                reviewType={isLandlord() ? "tenant" : "landlord"}
                targetId={user?.id}
                targetName={user?.full_name}
                onSubmit={handleSubmitReview}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f] dark:text-emerald-400" />
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

      {/* Wallet Setup Modal */}
      {needsWallet && (
        <WalletSetupModal
          isOpen={showWalletSetup}
          onClose={() => setShowWalletSetup(false)}
          onSuccess={handleWalletSetupSuccess}
        />
      )}
    </div>
  );
};

export default memo(ProfilePage);