import { motion } from "framer-motion";
import { Home, Building2, Wrench } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "For Tenants",
    text: "Browse verified listings, apply with confidence, and manage payments securely — all in one place.",
  },
  {
    icon: Building2,
    title: "For Landlords",
    text: "List and manage properties, verify tenant history, and receive payments without intermediaries.",
  },
  {
    icon: Wrench,
    title: "For Artisans",
    text: "Showcase your skills, receive trusted job requests, and build your professional portfolio online.",
  },
];

export default function FeaturesShowcase() {
  return (
    <section className="py-24 px-6 md:px-10">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12 text-[#0f1724]">Built for Everyone in the Rental Ecosystem</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, i) => {
            const IconComponent = feature.icon;
            return (
            <motion.div
              key={feature.title}
              className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <IconComponent className="text-teal-600 w-10 h-10 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.text}</p>
            </motion.div>
          );
          })}
        </div>
      </div>
    </section>
  );
}
