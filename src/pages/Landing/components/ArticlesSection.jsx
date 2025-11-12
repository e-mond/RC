import { Newspaper, Radio } from "lucide-react";
import { Link } from "react-router-dom";

export default function ArticlesSection() {
  return (
    <section className="bg-[#d6f3f0] py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 items-start">

        {/* ---- Main Card ---- */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Ghana Living, Modernized
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Built for the local rental market with trusted tools and culturally aware workflows.
          </p>

          {/* Google Maps + offline thumbnail */}
          <div className="relative rounded-lg overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.1824505969616!2d-1.7590208263900986!3d4.909114795066785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfe779f45ffa27bf%3A0x62727756ebcdfcad!2sTakoradi%20Technical%20University!5e0!3m2!1sen!2sgh!4v1762900007880!5m2!1sen!2sgh"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Takoradi Technical University"
              className="w-full"
              onError={(e) => {
                e.target.style.display = "none";
                const img = e.target.parentElement.querySelector("img");
                if (img) img.style.display = "block";
              }}
            ></iframe>

            {/* Fallback thumbnail */}
            <img
              src="/assets/images/ttu-thumbnail.jpg"
              alt="Takoradi Technical University – map thumbnail"
              className="absolute inset-0 w-full h-full object-cover hidden"
            />
          </div>
        </div>

        {/* ---- Press Card ---- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            In the Press
          </h4>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Newspaper className="text-teal-600 w-5 h-5 flex-shrink-0" />
              <Link
                to="/blog/proptech-report-2025"
                className="underline hover:text-teal-600 transition-colors"
              >
                Featured in emerging proptech reports
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Radio className="text-teal-600 w-5 h-5 flex-shrink-0" />
              <Link
                to="/blog/radio-interview-ghana-living"
                className="underline hover:text-teal-600 transition-colors"
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