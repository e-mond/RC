import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { FaCheckCircle } from "react-icons/fa";

export default function PricingSection() {
  const plans = [
    {
      name: "Freemium",
      price: "GHS 0",
      period: "",
      features: [
        "Core tools: listing, search, messaging",
        "Digital rent payments",
        "Basic maintenance tracking",
      ],
      button: <SecondaryButton label="Choose Free" />,
    },
    {
      name: "Premium",
      price: "GHS 49",
      period: "/mo",
      features: [
        "Advanced analytics & insights",
        "Ad promotion & boosted listings",
        "Verified badges & priority support",
      ],
      highlight: true,
      button: <PrimaryButton label="Go Premium" />,
    },
    {
      name: "Business",
      price: "Custom",
      period: "",
      features: [
        "Teams & role permissions",
        "API & integrations",
        "Dedicated success manager",
      ],
      button: <SecondaryButton label="Contact Sales" />,
    },
  ];

  return (
    <section
      id="plans"
      className="bg-[#f5f0f0] py-20 px-6 md:px-12 lg:px-24 text-center"
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-16">
          <h4 className="text-sm font-semibold text-[#0b6e4f] mb-2 uppercase tracking-wide">PRICING</h4>
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
          Start free. Upgrade for performance and visibility.
        </h2>
        <p className="text-gray-600 text-base">
          Choose a plan that fits your property or rental business needs.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border ${
              plan.highlight
                ? "border-[#0b6e4f] bg-white shadow-md scale-105"
                : "border-[#e6e8ea] bg-white"
            } p-8 transition hover:shadow-lg`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {plan.name}
            </h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {plan.price}
              <span className="text-base font-medium text-gray-600">
                {plan.period}
              </span>
            </p>

            <ul className="text-gray-700 text-sm space-y-2 mb-6 text-left mt-4">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start gap-2">
                  <FaCheckCircle className="text-[#0b6e4f] mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">{plan.button}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
