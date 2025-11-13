import { motion } from "framer-motion";
import LoginForm from "./components/LoginForm";
import LoginIllustration from "./components/LoginIllustration";
import { Button } from "@/components/ui/Button";


import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row bg-[#f9fafb]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* === LEFT SIDE: Login Form === */}
      <motion.div
        className="flex flex-1 justify-center items-center p-6 md:p-16 bg-white shadow-sm relative z-10"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* === Back to Home Button (Top-Left) === */}
        <div className="absolute top-6 left-6">
          <Button
           type="outline"
            onClick={() => navigate("/")}
            className="bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 p-2.5 rounded-lg font-medium transition-colors"
          >
            Back
          </Button>
        </div>

        {/* === Login Form === */}
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </motion.div>

      {/* === RIGHT SIDE: Illustration Section === */}
      <LoginIllustration />
    </motion.div>
  );
}
