import { motion } from "framer-motion";
import LoginForm from "@/components/auth/LoginForm";
import LoginIllustration from "@/components/auth/LoginIllustration";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react"; 

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
        className="flex flex-1 justify-center items-center p-6 md:p-16 bg-white shadow-sm relative z-20"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Back Button */}
        <div className="absolute top-5 left-5 md:top-8 md:left-8 z-30">
         <Button
            onClick={() => navigate("/")}
            aria-label="Go back to home"
            size="icon"
            className="
              h-10 w-10 rounded-full
              bg-[#0b6e4f] text-white
              shadow-md
              transition-colors duration-200
              md:bg-[#0b6e4f]
              md:text-white
              md:shadow-lg
              md:hover:bg-[#0b6e4f]
              md:hover:text-white
              hover:scale-110 active:scale-95
              md:hover:scale-100"
          >
            <ArrowLeftCircle className="h-6 w-6" />
          </Button>
        </div>

        {/* Form - extra top padding on mobile only */}
        <div className="w-full max-w-md pt-16 md:pt-0">
          <LoginForm />
        </div>
      </motion.div>

      {/* RIGHT: Illustration */}
      <LoginIllustration />
    </motion.div>
  );
}