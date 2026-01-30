import AdPlacement from "@/components/ads/AdPlacement";
import { Sparkles } from "lucide-react";

export default function AdsShowcase() {
  return (
    <section className="py-20 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto text-center px-6">
        <h2 className="text-2xl font-semibold mb-4">Sponsored Partners & Opportunities</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Discover services and opportunities from our trusted partners and advertisers
        </p>
        
        {/* Dynamic Ad Placements */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Three card-style ad placements */}
          <AdPlacement 
            placement="card" 
            limit={1} 
            showIfEmpty={true}
            className="min-h-[280px]"
          />
          <AdPlacement 
            placement="card" 
            limit={1} 
            showIfEmpty={true}
            className="min-h-[280px]"
          />
          <AdPlacement 
            placement="card" 
            limit={1} 
            showIfEmpty={true}
            className="min-h-[280px]"
          />
        </div>

        {/* Advertise with us CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-[#0b6e4f]/5 to-[#0b6e4f]/10 rounded-2xl border border-[#0b6e4f]/20">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#0b6e4f]" />
            <h3 className="font-semibold text-gray-900">Want to Advertise Here?</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4 max-w-lg mx-auto">
            Reach thousands of tenants, landlords, and service providers on Ghana's premier rental platform.
          </p>
          <a
            href="/role-selection"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b6e4f] text-white rounded-lg font-medium hover:bg-[#095c42] transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
