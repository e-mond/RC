import { useState } from "react";
import { ArrowRight } from "lucide-react";

const tabs = [
  {
    id: "verification",
    label: "User verification",
    title: "Comprehensive user background checks",
    subtitle: "Verification",
    description:
      "Every user undergoes detailed screening to ensure platform integrity.",
    image: "/assets/images/verification.jpg",
    primaryAction: "Verify",
    secondaryAction: "Explore",
  },
  {
    id: "background",
    label: "Background checks",
    title: "Reliable screening for all tenants and landlords",
    subtitle: "Screening",
    description:
      "We use trusted verification partners to ensure safe and secure rentals.",
    image: "/assets/images/background-checks.jpg",
    primaryAction: "Start check",
    secondaryAction: "Learn more",
  },
  {
    id: "fraud",
    label: "Fraud prevention",
    title: "Proactive fraud monitoring and prevention",
    subtitle: "Security",
    description:
      "Advanced detection systems protect your identity and transactions in real-time.",
    image: "/assets/images/fraud-prevention.jpg",
    primaryAction: "Protect now",
    secondaryAction: "Discover",
  },
];

export default function TrustSection() {
  const [activeTab, setActiveTab] = useState("verification");

  const activeContent = tabs.find((t) => t.id === activeTab);

  return (
    <section id="trust" className="bg-[#fafafa] py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* --- Header --- */}
        <div className="text-center mb-12">
                   <h4 className="text-sm font-semibold text-[#0b6e4f] mb-2 uppercase tracking-wide">Trust</h4>
          <h2 className="text-4xl font-semibold text-gray-900 mb-3">
            Secure rental ecosystem
          </h2>
          <p className="text-gray-600 mb-6">
            We protect your interests through rigorous verification and transparent processes.
          </p>
          <div className="flex justify-center gap-3">
            <button className="px-5 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-100 transition">
              Learn
            </button>
            <button className="px-5 py-2 text-sm bg-black text-white rounded-full hover:bg-gray-800 transition flex items-center gap-1">
              Explore <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* --- Tabs --- */}
        <div className="flex justify-center gap-8 mb-10 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute left-0 right-0 -bottom-px mx-auto w-3/4 h-0.5 bg-black rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* --- Content Card --- */}
        <div className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Text Section */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <p className="text-xs uppercase text-gray-500 font-semibold mb-2">
              {activeContent.subtitle}
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {activeContent.title}
            </h3>
            <p className="text-gray-600 mb-8">
              {activeContent.description}
            </p>
            <div className="flex gap-4">
              <button className="px-5 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition">
                {activeContent.primaryAction}
              </button>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline">
                {activeContent.secondaryAction} <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Image Section */}
          <div className="w-full md:w-1/2 h-80 md:h-auto">
            <img
              src={activeContent.image}
              alt={activeContent.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
