import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = {
  tenant: "#f59e0b",
  landlord: "#10b981",
  artisan: "#f97316",
  admin: "#3b82f6",
  "super-admin": "#8b5cf6",
};

const ROLE_LABELS = {
  tenant: "Tenant",
  landlord: "Landlord",
  artisan: "Artisan",
  admin: "Admin",
  "super-admin": "Super Admin",
};

export default function SA_RoleDistributionChart({ data }) {
  if (!data || Object.keys(data).length === 0) return null;

  const chartData = Object.entries(data || {})
    .filter(([role, count]) => role && typeof count === 'number' && count > 0)
    .map(([role, count]) => ({
      name: ROLE_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1),
      value: count,
      role,
      fill: COLORS[role] || "#6b7280",
    }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry) => (
              <Cell key={entry.role} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}