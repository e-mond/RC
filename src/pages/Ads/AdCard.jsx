// src/pages/Ads/AdCard.jsx
import { Megaphone, Clock, Eye, TrendingUp, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdCard({ ad, onRenew, onCancel }) {
  const isActive = new Date(ad.expiresAt) > new Date();
  const daysLeft = Math.max(0, Math.ceil((new Date(ad.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0b6e4f] rounded-xl flex items-center justify-center">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {ad.listingTitle || "Promoted Listing"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {ad.packageName} Package
            </p>
          </div>
        </div>

        <span
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {isActive ? "Active" : "Expired"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{ad.views || 0} views</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>{ad.inquiries || 0} inquiries</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
          <Clock className="w-4 h-4" />
          <span>
            {isActive
              ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`
              : `Expired ${new Date(ad.expiresAt).toLocaleDateString()}`}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {isActive ? (
          <Button variant="outline" size="sm" disabled>
            Active
          </Button>
        ) : (
          <Button size="sm" onClick={() => onRenew(ad)}>
            Renew Boost
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={() => onCancel(ad.id)}>
          <XCircle className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}