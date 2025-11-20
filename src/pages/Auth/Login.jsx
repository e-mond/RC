import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";
import LoginIllustration from "../../components/auth/LoginIllustration";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; 


/**
 * Login Page – uses PublicLayout via routing
 * - Animated entry
 * - Back button
 * - Form + illustration
 */

export default function Login() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* LEFT: Form */}
      <motion.div
        className="flex flex-1 justify-center items-center p-6 md:p-16 bg-white shadow-sm relative z-10"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Button
            onClick={() => navigate("/")}
            aria-label="Go back to home"
            className="flex items-center justify-center w-10 h-10 p-0 bg-[#0b6e4f] hover:bg-[#095c42] text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </motion.div>

      {/* RIGHT: Illustration */}
      <LoginIllustration />
    </motion.div>
  );
}