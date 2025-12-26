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
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useFeatureStore } from "@/stores/featureStore";
import { useTheme } from "@/context/ThemeContext";
import useLanguage from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation"; 
import Button from "@/components/ui/Button";
import { SUBSCRIPTION_CONFIG } from "@/config/subscriptionConfig";
import { isMockMode } from "@/mocks/mockManager";
import { getPreferences, updatePreferences } from "@/services/preferencesService";
import { toast } from "react-hot-toast";

// Helper functions
const formatRole = (role) => {
  if (!role) return "Tenant";
  return role
    .replace("-", " ")
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

const ProfilePage = () => {
  const { t } = useTranslation(); 
  const { user } = useAuthStore();
  const { plan, setPlan } = useFeatureStore();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [pendingReference, setPendingReference] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const role = user?.role || "tenant";
  const formattedRole = formatRole(role);
  const displayName = getDisplayName(user?.full_name);
  const isPremium = plan === "premium";
  const isAdmin = role === "admin" || role === "super-admin";

  const { premiumPrice, featuresByRole } = SUBSCRIPTION_CONFIG;
  const premiumFeatures = featuresByRole[role] || featuresByRole.tenant;

  const PAYSTACK_PUBLIC_KEY =
    import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_your_key";
  const PREMIUM_AMOUNT_KOBO = premiumPrice.monthly * 100000;

  // Load Paystack
  useEffect(() => {
    if (paystackLoaded || isPremium || isAdmin) return;

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () =>
      setMessage({
        text: t("paymentGatewayLoadFailed"),
        type: "error",
      });
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [paystackLoaded, isPremium, isAdmin, t]);

  // Verify payment
  const verifyPayment = async (reference) => {
    if (!reference) return;

    setLoading(true);

    if (isMockMode()) {
      setPlan("premium");
      setMessage({ text: t("demoUpgradeSuccess"), type: "success" });
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
        setMessage({ text: t("paymentSuccess"), type: "success" });
      } else {
        setMessage({ text: data.message || t("paymentVerificationFailed"), type: "error" });
      }
    } catch {
      setMessage({ text: t("networkError"), type: "error" });
    } finally {
      setLoading(false);
      setPendingReference(null);
    }
  };

  // Load preferences
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

  useEffect(() => {
    if (pendingReference) verifyPayment(pendingReference);
  }, [pendingReference]);

  // Handle preference toggle
  const handlePreferenceToggle = async (key, value) => {
    if (!preferences) return;

    setSavingPrefs(true);
    try {
      const updated = await updatePreferences({ [key]: value });
      setPreferences(updated);
      toast.success(t("settingsUpdated"));
    } catch (err) {
      toast.error(err.message || t("updateFailed"));
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleUpgrade = () => {
    if (!paystackLoaded) {
      setMessage({ text: t("paymentSystemLoading"), type: "info" });
      return;
    }
    if (!user?.email) {
      setMessage({ text: t("emailRequired"), type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: PREMIUM_AMOUNT_KOBO,
      currency: premiumPrice.currency,
      ref: `rc_upgrade_${user.id}_${Date.now()}`,
      metadata: { user_id: user.id, full_name: user.full_name, plan: "premium" },
      callback: (response) => {
        setPendingReference(response.reference);
        setMessage({ text: t("verifyingPayment"), type: "info" });
      },
      onClose: () => {
        setLoading(false);
        setMessage({ text: t("paymentCancelled"), type: "info" });
      },
    });

    handler.openIframe();
  };

  const handleDowngrade = () => {
    if (!window.confirm(t("confirmDowngrade"))) return;

    setLoading(true);
    setTimeout(() => {
      setPlan("free");
      setMessage({ text: t("downgradedToFree"), type: "success" });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t("myAccount")}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {displayName}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {formattedRole} {t("account")}
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label={t("toggleTheme")}
        >
          {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-gray-600" />}
        </button>
      </header>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
              : message.type === "info"
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800"
          }`}
        >
          {message.type === "success" && <CheckCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-5 text-gray-900 dark:text-white">
            <Shield className="w-5 h-5 text-emerald-600" />
            {t("contactInformation")}
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Mail size={18} />
              <span>{user?.email || t("notProvided")}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Phone size={18} />
              <span>{user?.phone || t("notProvided")}</span>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-5 text-gray-900 dark:text-white">
            <Settings className="w-5 h-5 text-sky-500" />
            {t("accountSettings")}
          </h2>
          {preferences ? (
            <div className="space-y-5 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Bell size={16} />
                  <span>{t("emailNotifications")}</span>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("emailNotifications", !preferences.emailNotifications)}
                  disabled={savingPrefs}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    preferences.emailNotifications ? "bg-[#0b6e4f]" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${preferences.emailNotifications ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone size={16} />
                  <span>{t("smsNotifications")}</span>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("smsNotifications", !preferences.smsNotifications)}
                  disabled={savingPrefs}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    preferences.smsNotifications ? "bg-[#0b6e4f]" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${preferences.smsNotifications ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Lock size={16} />
                  <span>{t("twoFactorAuth")}</span>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("twoFactorAuth", !preferences.twoFactorAuth)}
                  disabled={savingPrefs}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    preferences.twoFactorAuth ? "bg-[#0b6e4f]" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${preferences.twoFactorAuth ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Eye size={16} />
                  <span>{t("profileVisibility")}</span>
                </div>
                <select
                  value={preferences.profileVisibility || "public"}
                  onChange={(e) => handlePreferenceToggle("profileVisibility", e.target.value)}
                  disabled={savingPrefs}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <option value="public">{t("public")}</option>
                  <option value="private">{t("private")}</option>
                  <option value="friends">{t("friendsOnly")}</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Mail size={16} />
                  <span>{t("marketingEmails")}</span>
                </div>
                <button
                  onClick={() => handlePreferenceToggle("marketingEmails", !preferences.marketingEmails)}
                  disabled={savingPrefs}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    preferences.marketingEmails ? "bg-[#0b6e4f]" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${preferences.marketingEmails ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Globe size={16} />
                  <span>{t("language")}</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    handlePreferenceToggle("language", e.target.value);
                  }}
                  disabled={savingPrefs}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("loadingSettings")}
            </div>
          )}
        </div>

        {/* Subscription Section */}
        <div className="bg-gradient-to-br from-[#0b6e4f]/5 to-emerald-50 dark:from-[#0b6e4f]/10 dark:to-gray-800 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-5 text-gray-900 dark:text-white">
            <Crown className="w-5 h-5 text-amber-500" />
            {isAdmin ? t("fullSystemAccess") : t("subscriptionPlan")}
          </h2>

          <div className="space-y-6">
            {isAdmin ? (
              <div className="text-center py-8">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {t("administratorAccess")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t("adminFullAccessDescription")}
                </p>
              </div>
            ) : isPremium ? (
              <>
                <div className="flex items-center gap-2">
                  <Star className="w-7 h-7 text-amber-500" />
                  <p className="text-2xl font-bold text-[#0b6e4f]">{t("premiumActive")}</p>
                </div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {premiumPrice.display}
                </p>

                <div className="space-y-2 text-sm">
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
                  className="w-full mt-4"
                >
                  {loading ? t("processing") : t("downgradeToFree")}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {t("freePlan")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t("upgradeToUnlock")}
                  </p>
                </div>

                <div className="space-y-3 text-sm mb-6">
                  <p className="font-medium">{t("premiumIncludes")}:</p>
                  <ul className="space-y-2">
                    {premiumFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Star size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

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
                      <Star className="w-5 h-5 mr-2 text-nowrap" />
                      {t("upgradeToPremium")} — {premiumPrice.display}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ProfilePage);