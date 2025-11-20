import { useEffect, useState } from "react";
import homeImg from "@/assets/images/login-home.jpg";
import landlordImg from "@/assets/images/login-landlord.jpg";
import artisanImg from "@/assets/images/login-artisan.jpg";
import { motion, AnimatePresence } from "framer-motion";

const images = [homeImg, landlordImg, artisanImg];

export default function LoginIllustration() {
  const [index, setIndex] = useState(0);

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex flex-1 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt="Rental Connects Visual"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-black/70 via-black/40 to-transparent" />

      {/* Centered Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <motion.p
          className="text-white text-3xl font-semibold leading-snug max-w-md drop-shadow-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Connecting tenants, landlords, and artisans —
          <br /> securely and seamlessly.
        </motion.p>
      </div>
    </div>
  );
}
