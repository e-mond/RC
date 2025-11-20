// src/pages/Dashboards/SuperAdmin/users/SA_UsersPage.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchAllUsers } from "@/services/adminService";
import SA_UserTable from "../components/SA_UserTable";
import SA_CreateUserModal from "../components/SA_CreateUserModal";
import SA_DeleteUserModal from "../components/SA_DeleteUserModal";
import PageHeader from "@/modules/dashboard/PageHeader";
import { Users, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SA_UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(Array.isArray(data.users) ? data.users : []);
      toast.success("Users refreshed successfully");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Premium Page Header */}
        <PageHeader
          title="Manage Users"
          subtitle="Create, view, and delete platform users with full control"
          badge="Super Admin"
          align="between"
          actions={
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpenCreate(true)}
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#0b6e4f] text-white font-semibold rounded-xl hover:bg-[#095c42] transition-all shadow-lg hover:shadow-xl"
              aria-label="Create new user"
            >
              <UserPlus className="w-5 h-5" />
              Create User
            </motion.button>
          }
        />

        {/* Main Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SA_UserTable
              users={users}
              loading={loading}
              onDelete={setDeleteTarget}
              onRefresh={loadUsers}
            />
          </div>
        </motion.section>

        {/* Create User Modal */}
        <SA_CreateUserModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onSuccess={() => {
            loadUsers();
            setOpenCreate(false);
            toast.success("User created successfully!");
          }}
        />

        {/* Delete Confirmation Modal */}
        <SA_DeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => {
            loadUsers();
            setDeleteTarget(null);
            toast.success("User deleted permanently");
          }}
        />
      </div>
    </div>
  );
}