// src/pages/Dashboards/SuperAdmin/users/SA_UsersPage.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchAllUsers } from "@/services/adminService";
import SA_UserTable from "../components/SA_UserTable";     // ← FIXED
import SA_CreateUserModal from "../components/SA_CreateUserModal";
import SA_DeleteUserModal from "../components/SA_DeleteUserModal";
import { Users, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * SA_UsersPage
 * - Full user management with create/delete
 * - Animated, responsive, accessible
 */
export default function SA_UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data.users || []);
      toast.success("Users loaded");
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
      aria-labelledby="users-heading"
    >
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1
          id="users-heading"
          className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Users size={28} />
          Manage Users
        </h1>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-5 py-2.5 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition flex items-center gap-2"
          aria-label="Create new user"
        >
          <Users size={18} />
          <span className="hidden sm:inline">Create User</span>
        </button>
      </header>

      <SA_UserTable
        users={users}
        loading={loading}
        onDelete={setDeleteTarget}
        onRefresh={loadUsers}
      />

      <SA_CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => {
          loadUsers();
          toast.success("User created");
        }}
      />

      <SA_DeleteUserModal
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => {
          loadUsers();
          toast.success("User deleted");
        }}
      />
    </motion.div>
  );
}