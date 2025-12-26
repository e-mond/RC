import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // Recommended icon library

export default function OnboardingHeader({ backTo = "/" }) {
  const navigate = useNavigate();

  return (
    <header className="w-full px-0 py-4 md:py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* === Logo (Clickable) === */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none"
          aria-label="Go to Home"
        >
          <div className="w-8 h-8 bg-[#0b6e4f] rounded-md" />
          <span className="font-semibold text-[#0f1724]  sm:inline">
            Rental Connects
          </span>
        </button>

        {/* === Right Actions === */}
        <div className="flex items-center gap-3 sm:gap-6 text-sm">
          {/* Back Button with Arrow */}
          <Link
            to={backTo}
            className="group flex items-center gap-1.5 px-3 py-2 border border-[#e6e8ea] text-[#0f1724] rounded-lg hover:bg-[#f1f3f5] transition-all"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
          </Link>

          {/* Login Button */}
          <Link
            to="/login"
            className="px-4 py-2 bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition-all whitespace-nowrap"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}