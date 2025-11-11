import { Newspaper, Radio } from "lucide-react";

export default function ArticlesSection() {
  return (
    <section className="bg-[#d6f3f0] py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 items-start">
        
        {/* --- Main Article Card --- */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Ghana Living, Modernized
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Built for the local rental market with trusted tools and culturally aware workflows.
          </p>

          {/* Image Placeholder */}
          <div className="rounded-lg overflow-hidden">
            <img
              src="/assets/images/ghana-living.jpg" // replace with your placeholder or public image
              alt="Modern apartment building in Ghana"
              className="w-full h-56 object-cover"
            />
          </div>
        </div>

        {/* --- Press Mentions Card --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            In the Press
          </h4>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Newspaper className="text-teal-600 w-5 h-5" />
              Featured in emerging proptech reports
            </li>
            <li className="flex items-center gap-2">
              <Radio className="text-teal-600 w-5 h-5" />
              Discussed on local business radio
            </li>
          </ul>
        </div>

      </div>
    </section>
  );
}
