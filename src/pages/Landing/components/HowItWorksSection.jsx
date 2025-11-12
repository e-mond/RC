import { FaSearch, FaComments, FaHome } from "react-icons/fa";
import { motion as Motion } from "framer-motion";
import img1 from "../../../assets/images/placeholder-1.jpg";
import img2 from "../../../assets/images/placeholder-2.jpg";
import img3 from "../../../assets/images/placeholder-3.jpg";


// Step data for "How It Works" section
const steps = [
  {
    title: "Discover perfect properties",
    label: "Find",
    description:
      "Browse verified listings with detailed information and transparent pricing.",
    image: img1,
    icon: <FaSearch className="text-white text-2xl" />,
    linkText: "Explore →",
  },
  {
    title: "Communicate with confidence",
    label: "Connect",
    description:
      "Direct messaging and secure verification ensure safe interactions between tenants and landlords.",
    image: img2,
    icon: <FaComments className="text-white text-2xl" />,
    linkText: "Connect →",
  },
  {
    title: "Manage your rental seamlessly",
    label: "Rent",
    description:
      "Digital payments, maintenance tracking, and comprehensive support make renting effortless.",
    image: img3,
    icon: <FaHome className="text-white text-2xl" />,
    linkText: "Rent now →",
  },
];

export default function AboutSection() {
  // Parent animation (staggered children)
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  // Each card animation
  const cardVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="how-it-works" className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* --- Section Heading --- */}
        <Motion.p
          className="text-sm font-semibold text-[#0b6e4f] mb-2 uppercase tracking-wide"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Simple
        </Motion.p>

        <Motion.h2
          className="text-3xl font-bold text-[#0f1724] mb-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          How Rental Connects Works
        </Motion.h2>

        <Motion.p
          className="text-gray-600 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
        >
          Three straightforward steps to transform your rental experience.
        </Motion.p>

        {/* --- Steps Grid --- */}
        <Motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, idx) => (
            <Motion.div
              key={idx}
              variants={cardVariant}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { type: "spring", stiffness: 200, damping: 12 },
              }}
              className="relative rounded-2xl overflow-hidden bg-white shadow-md group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-72 w-full overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gray-700/30 group-hover:bg-black/50 transition-all duration-300"></div>
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-left text-white pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-[#0b6e4f]">{step.icon}</div>
                  <span className="text-sm uppercase text-gray-200 font-medium">
                    {step.label}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-200 text-sm mb-2">{step.description}</p>

                <span className="text-[#f1f3f5] font-medium group-hover:text-white transition">
                  {step.linkText}
                </span>
              </div>
            </Motion.div>
          ))}
        </Motion.div>
      </div>
    </section>
  );
}
