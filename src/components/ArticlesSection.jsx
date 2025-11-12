import { Newspaper, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * Main hero section with map + press mentions
 */
export default function ArticlesSection({ className = "" }) {
  // Static Google Maps image (fallback + faster load)
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=Takoradi+Technical+University,Ghana&zoom=16&size=800x400&markers=color:red%7CTakoradi+Technical+University&key=AIzaSyB...`; // Replace with your key or use free static URL

  // Free static map (no API key needed for demo)
  const fallbackMap = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=800&height=400&center=lonlat:-1.759,4.909&zoom=15&marker=lonlat:-1.759,4.909;color:%23ff0000;size:medium;text:TTU&apiKey=YOUR_KEY`;

  return (
    <section className={`bg-gradient-to-b from-[#d6f3f0] to-white py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-10 items-start">

        {/* Main Card – Map + Text */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Ghana Living, Modernized
          </h3>
          <p className="text-gray-600 mb-6">
            Built for the local rental market with trusted tools and culturally aware workflows.
          </p>

          {/* Map Container */}
          <div className="relative rounded-xl overflow-hidden shadow-md h-80">
            {/* Live iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.1824505969616!2d-1.7590208263900986!3d4.909114795066785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfe779f45ffa27bf%3A0x62727756ebcdfcad!2sTakoradi%20Technical%20University!5e0!3m2!1sen!2sgh!4v1762900007880!5m2!1sen!2sgh"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Takoradi Technical University"
              className="absolute inset-0"
              onError={(e) => {
                e.target.style.display = "none";
                const img = e.target.nextElementSibling;
                if (img) img.style.display = "block";
              }}
            />

            {/* Offline Fallback – Online Image */}
            <img
              src="https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&h=400&fit=crop"
              alt="Takoradi Technical University – Campus Overview"
              className="absolute inset-0 w-full h-full object-cover hidden"
            />
          </div>
        </div>

        {/* Press Mentions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 h-full">
          <h4 className="text-xl font-bold text-gray-900 mb-6">In the Press</h4>
          <ul className="space-y-5 text-sm">
            <li className="flex items-start gap-3">
              <Newspaper className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <Link
                to="/blog/proptech-report-2025"
                className="text-gray-700 hover:text-teal-600 underline-offset-2 hover:underline transition-all"
              >
                Featured in emerging proptech reports
              </Link>
            </li>
            <li className="flex items-start gap-3">
              <Radio className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <Link
                to="/blog/radio-interview-ghana-living"
                className="text-gray-700 hover:text-teal-600 underline-offset-2 hover:underline transition-all"
              >
                Discussed on local business radio
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

ArticlesSection.propTypes = {
  className: PropTypes.string,
};