import React, { useEffect, useState } from "react";
import { getAllUsers, updateUserRole, deleteUser } from "@/services/userService";

/**
 * SA_UserManagement
 * - Simple user list with role delegation & delete
 * - NOTE: role changes should be logged & audited in the backend
 */
export default function SA_UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRole = async (id, role) => {
    try {
      await updateUserRole(id, role);
      setUsers((s) => s.map(u => u.id === id ? {...u, role} : u));
    } catch (err) {
      console.error(err);
      alert("Unable to change role.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete user? This action is irreversible.")) return;
    try {
      await deleteUser(id);
      setUsers((s) => s.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Unable to delete user.");
    }
  };

  if (loading) return <div>Loading users…</div>;

  return (
    <section className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-4">User Management</h3>
      <div className="space-y-3">
        {users.length === 0 && <div className="text-sm text-gray-500">No users found.</div>}
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-4 border rounded p-3">
            <div>
              <div className="font-medium">{u.fullName}</div>
              <div className="text-xs text-gray-500">{u.email} • {u.role}</div>
            </div>

            <div className="flex items-center gap-2">
              <select value={u.role} onChange={(e) => handleRole(u.id, e.target.value)} className="border p-1 rounded">
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="artisan">Artisan</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
              <button onClick={() => handleDelete(u.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
