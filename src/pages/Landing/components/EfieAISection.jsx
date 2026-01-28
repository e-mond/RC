/**
 * EfieAISection Component
 * 
 * Minimalistic section on the landing page explaining Efie AI features.
 * Uses a card-based carousel design with British English.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function EfieAISection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const features = [
    {
      title: "Smart Property Recommendations",
      description: "Get personalised property suggestions based on your preferences, budget, and location. Efie AI learns what you like and helps you find your perfect home faster.",
    },
    {
      title: "Trusted Artisan Discovery",
      description: "Find verified artisans near you with high trust scores. Our AI analyses reviews, ratings, and service history to recommend the best professionals for your needs.",
    },
    {
      title: "Trust Score System",
      description: "Every landlord and artisan has a trust score based on verified reviews, transaction history, and platform behaviour. Make informed decisions with confidence.",
    },
    {
      title: "24/7 AI Chatbot Assistant",
      description: "Get instant answers to your questions about properties, artisans, rental processes, and platform features. Efie AI is always here to help you feel at home.",
    },
  ];

  const nextFeature = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <section id="efie-ai" className="bg-white py-20 text-gray-800">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={container}
        >
          <motion.h4
            className="text-sm font-semibold text-[#0b6e4f] mb-2 uppercase tracking-wide"
            variants={item}
          >
            Efie AI: Intelligent Rental Assistant
          </motion.h4>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-[#0f1724] mb-4 leading-snug"
            variants={item}
          >
            Efie AI — Helping You Feel at Home
          </motion.h2>
          <motion.p
  className="text-lg text-gray-600 max-w-3-1 mx-auto"
  variants={item}
>
Your intelligent assistant for perfect rentals and trusted artisans, powered by advanced AI for a smoother, safer and personalised journey.
</motion.p>
        </motion.div>

        {/* Carousel Card */}
        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="bg-gradient-to-br from-[#0b6e4f] to-[#095c42] rounded-2xl p-8 md:p-12 shadow-xl min-h-[340px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-white flex-grow"
              >
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                  {features[currentIndex].title}
                </h3>
                <p className="text-lg text-green-50 leading-relaxed mb-8">
                  {features[currentIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation + CTA */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevFeature}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                  aria-label="Previous feature"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <div className="flex gap-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? "w-8 bg-white"
                          : "w-2 bg-white/40 hover:bg-white/60"
                      }`}
                      aria-label={`Go to feature ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextFeature}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                  aria-label="Next feature"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* CTA Button inside card */}
              <div className="text-center">
                <a
                  href="/role-selection"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0b6e4f] rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Get Started with Efie AI
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}