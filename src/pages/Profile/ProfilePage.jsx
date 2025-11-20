import { Shield, Crown, Mail, Phone } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useFeatureStore } from "@/stores/featureStore";
import { useTheme } from "@/context/ThemeContext";
import Button from "@/components/ui/Button";

const formatRole = (role) => role?.replace("-", " ") ?? "tenant";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { plan, setPlan } = useFeatureStore();
  const { isDark, toggleTheme } = useTheme();

  const fullName = user?.fullName || user?.name || "Guest User";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">Account</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatRole(user?.role)} • {plan === "premium" ? "Premium plan" : "Free plan"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={toggleTheme}>
            {isDark ? "Switch to light" : "Switch to dark"}
          </Button>
          <Button
            variant="primary"
            onClick={() => setPlan(plan === "premium" ? "free" : "premium")}
          >
            {plan === "premium" ? "Downgrade" : "Upgrade"}
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Shield className="h-5 w-5 text-emerald-600" />
            Contact
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>{user?.email || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{user?.phone || "Not provided"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Crown className="h-5 w-5 text-amber-500" />
            Subscription
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>Plan: <span className="font-semibold capitalize">{plan}</span></li>
            <li>Role access: {formatRole(user?.role)}</li>
            <li>Mock mode: {localStorage.getItem("demoMockEnabled") === "false" ? "Real backend" : "Demo mocks"}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

