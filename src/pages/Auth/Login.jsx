import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";
import LoginIllustration from "@/components/auth/LoginIllustration";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* LEFT: Form Section */}
      <motion.div
        className="flex flex-1 flex-col justify-center items-center p-6 md:p-16 relative"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Back Button */}
        <div className="w-full max-w-md mb-6 flex justify-start">
          <Button
            onClick={() => navigate("/")}
            variant="ghost" // base variant so we fully control bg/text
            className={`
              bg-teal-600 
              text-white 
              hover:bg-amber-500 
              hover:text-white 
              active:bg-amber-600 
              p-3 
              rounded-full 
              transition-all 
              duration-200 
              shadow-md 
              hover:shadow-lg 
              focus:outline-none 
              focus:ring-2 
              focus:ring-amber-400 
              focus:ring-offset-2
            `}
            aria-label="Go back to home page"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </motion.div>

      {/* RIGHT: Illustration (hidden on mobile) */}
      <div className="hidden md:flex flex-1 bg-linear-to-br from-teal-50 to-white">
        <LoginIllustration />
      </div>
    </motion.div>
  );
}