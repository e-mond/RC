import { ShieldCheck, Lock, LogIn } from "lucide-react";

export default function InfoBanner({ type }) {
  const variants = {
    admin: {
      icon: <LogIn size={16} />,
      text: "Admin access: Manage users and oversee operations",
    },
    secure: {
      icon: <Lock size={16} />,
      text: "Your information is encrypted and verified.",
    },
  };

  return (
    <div className="bg-[#d9f3f0] text-[#0f1724] rounded-lg py-3 px-4 flex items-center gap-2 mt-3">
      {variants[type].icon}
      <span className="text-sm">{variants[type].text}</span>
    </div>
  );
}
