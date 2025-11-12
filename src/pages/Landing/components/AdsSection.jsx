import { Sparkles, MapPin, Star } from "lucide-react";
import promoImage from "../../../assets/images/ads-promo.jpg"; // adjust path if needed

export default function AdsSection() {
  return (
    <section id="advertise" className="bg-[#d6f3f0] py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* --- Left Text Content --- */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Advertisement
          </h2>
          <p className="text-gray-600 mb-8">
            Promote listings and services to the right audience.
          </p>

          {/* --- Promotion Opportunities Card --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Promotion Opportunities
            </h3>
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">
              Boost visibility with sponsored listings, featured placements, and
              city-level highlights. Ideal for landlords and service providers
              growing their reach.
            </p>

            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Sparkles className="text-teal-600 w-5 h-5" />
                Sponsored spots in search
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="text-teal-600 w-5 h-5" />
                Featured on neighborhood maps
              </li>
              <li className="flex items-center gap-2">
                <Star className="text-teal-600 w-5 h-5" />
                Top picks on the homepage
              </li>
            </ul>
          </div>
        </div>

        {/* --- Right Image --- */}
        <div className="flex justify-center md:justify-end">
          <img
            src={promoImage}
            alt="Advertisement promotion"
            className="rounded-xl w-full max-w-md object-cover shadow-md"
          />
        </div>
      </div>
    </section>
  );
}
