import { Link } from "react-router-dom";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";



export default function OnboardingHeader({ backTo = "/", backLabel = "Back to Home" }) {
  return (
    <header className="w-full flex justify-between items-center max-w-6xl mx-auto mb-8">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-[#0b6e4f] rounded-md" />
        <span className="font-semibold text-[#0f1724]">Rental Connects</span>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <Link to={backTo} className="px-4 py-2 border border-[#e6e8ea] text-[#0f1724] rounded-lg hover:bg-[#f1f3f5] transition">
          {backLabel}
        </Link>
        <Link to="/login" className="px-4 py-2 bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition">
          Login
        </Link>
      </div>
    </header>
  );
}
