import { Crown, Shield, Building, Home, Wrench } from "lucide-react";

/**
 * Role Badge
 */
export function RoleBadge({ role }) {
  const config = {
    "super-admin": { icon: Crown, color: "bg-purple-100 text-purple-700", label: "Super Admin" },
    admin: { icon: Shield, color: "bg-blue-100 text-blue-700", label: "Admin" },
    landlord: { icon: Building, color: "bg-green-100 text-green-700", label: "Landlord" },
    tenant: { icon: Home, color: "bg-yellow-100 text-yellow-700", label: "Tenant" },
    artisan: { icon: Wrench, color: "bg-orange-100 text-orange-700", label: "Artisan" },
  };
  const { icon: Icon, color, label } = config[role] || config.tenant;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}

/**
 * Skeleton
 */
export function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-full" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 ml-10" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-10" />
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty State
 */
export function EmptyState() {
  return (
    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <FiUserX size={48} className="mx-auto text-gray-400 mb-3" />
      <p className="text-gray-600 dark:text-gray-400">No users available for role assignment.</p>
    </div>
  );
}