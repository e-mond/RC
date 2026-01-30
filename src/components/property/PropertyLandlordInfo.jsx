/**
 * PropertyLandlordInfo Component
 * 
 * Displays landlord information on property detail page.
 * Extracted from PropertyDetail.jsx for better code organization.
 */

import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { RatingDisplay } from "@/components/reviews";
import { BackgroundStatusPanel } from "@/components/reviews";

export default function PropertyLandlordInfo({ landlord, isTenant }) {
  if (!landlord) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Property Owner
        </h2>
        {isTenant && landlord.id && (
          <Link
            to={`/users/${landlord.id}`}
            className="text-sm text-[#0b6e4f] dark:text-emerald-400 hover:underline"
          >
            View Profile
          </Link>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0b6e4f] dark:bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
            {landlord.full_name?.charAt(0)?.toUpperCase() || "L"}
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-900 dark:text-white">
              {landlord.full_name}
            </p>
            {landlord.business_type && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {landlord.business_type}
              </p>
            )}
          </div>
        </div>
        {isTenant && landlord.id && (
          <Link to={`/messages?start=${landlord.id}`}>
            <button className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4" />
              Message Landlord
            </button>
          </Link>
        )}
      </div>

      {/* Landlord Ratings */}
      {landlord.ratings && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <RatingDisplay
            rating={landlord.ratings.average || 0}
            totalReviews={landlord.ratings.total || 0}
            showLabel={true}
          />
        </div>
      )}

      {/* Landlord Verification Status */}
      {landlord.verification_status && (
        <div className="mt-4">
          <BackgroundStatusPanel
            verificationStatus={landlord.verification_status}
            compact={true}
          />
        </div>
      )}
    </div>
  );
}

