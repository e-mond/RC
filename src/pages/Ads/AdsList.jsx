// src/pages/Ads/AdsList.jsx
import { Megaphone } from "lucide-react";
import AdCard from "./AdCard";

export default function AdsList({ ads, onRenew, onCancel }) {
  if (ads.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Megaphone className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No active promotions yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a package below to boost your listing visibility
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} onRenew={onRenew} onCancel={onCancel} />
      ))}
    </div>
  );
}