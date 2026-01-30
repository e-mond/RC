// src/pages/Dashboards/SuperAdmin/roles/SA_RolesPage.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchAllUsers } from "@/services/adminService";
import SA_RoleTable from "@/pages/Dashboards/SuperAdmin/components/SA_RoleTable";
import SA_AssignRoleModal from "@/pages/Dashboards/SuperAdmin/components/SA_AssignRoleModal";
import SA_AssignRoleWithPermissionsModal from "@/pages/Dashboards/SuperAdmin/components/SA_AssignRoleWithPermissionsModal";
import { Shield } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SA_RolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
      aria-labelledby="roles-heading"
    >
      <h1
        id="roles-heading"
        className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
      >
        <Shield size={28} />
        Role Management
      </h1>

      <SA_RoleTable
        users={users}
        loading={loading}
        onAssign={setTargetUser}
      />

      {/* Use enhanced modal with permissions for admin role assignment */}
      <SA_AssignRoleWithPermissionsModal
        user={targetUser}
        onClose={() => setTargetUser(null)}
        onSuccess={() => {
          loadUsers();
          toast.success("Role and permissions updated");
        }}
      />
    </motion.div>
  );
}