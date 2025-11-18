
import { Crown, Shield, Building, Home, Wrench } from "lucide-react";

export function RoleBadge({ config }) {
  const { icon: Icon, color, label } = config;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}