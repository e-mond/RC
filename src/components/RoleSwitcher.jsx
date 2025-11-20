// src/components/RoleSwitcher.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Home, Building, Wrench, Shield, Crown, LogIn } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { isMockMode } from "@/mocks/mockManager.js";

export default function RoleSwitcher() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { login, user } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentRole = user?.role || "none";

  const roles = useMemo(
    () => [
      { key: "tenant", label: "Tenant", icon: Home, path: "/tenant/overview" },
      { key: "landlord", label: "Landlord", icon: Building, path: "/landlord/overview" },
      { key: "artisan", label: "Artisan", icon: Wrench, path: "/artisan/overview" },
      { key: "admin", label: "Admin", icon: Shield, path: "/admin/overview" },
      { key: "super-admin", label: "Super Admin", icon: Crown, path: "/super-admin/overview" },
    ],
    []
  );

  const fakeProfiles = useMemo(
    () => ({
      tenant: { id: "u1", fullName: "John Tenant", email: "tenant@demo.com", role: "tenant", permissions: {} },
      landlord: { id: "u2", fullName: "Sarah Landlord", email: "landlord@demo.com", role: "landlord", permissions: {} },
      artisan: { id: "u3", fullName: "Mike Artisan", email: "artisan@demo.com", role: "artisan", permissions: {} },
      admin: { id: "u4", fullName: "Alex Admin", email: "admin@demo.com", role: "admin", permissions: { canViewInsights: true, canApproveUsers: true, canApproveProperties: true, canManageMaintenance: true, canViewReports: true } },
      "super-admin": { id: "u5", fullName: "Super User", email: "super@demo.com", role: "super-admin", permissions: { canDoEverything: true } },
    }),
    []
  );

  // Added fakeProfiles to dependency array → fixes exhaustive-deps warning
  const switchRole = useCallback(
    async (roleKey) => {
      const fakeUser = fakeProfiles[roleKey];
      if (fakeUser) {
        await login({ email: fakeUser.email, password: "any" });
      }

      const target = roles.find((r) => r.key === roleKey);
      if (target) {
        navigate(target.path, { replace: true });
      }

      setIsOpen(false);
    },
    [roles, navigate, login, fakeProfiles]
  );

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % roles.length);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + roles.length) % roles.length);
      }

      if (e.key === "Enter") {
        e.preventDefault();
        switchRole(roles[selectedIndex].key);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, selectedIndex, roles, switchRole]);

  if (!isMockMode()) return null;

  return (
    <div ref={menuRef} className="fixed top-32 right-4 z-50">
      {/* Fixed Tailwind warning: bg-gradient-to-br → bg-linear-to-br (or keep the correct one) */}
      <motion.div className="bg-linear-to-br from-[#079467] to-[#0b6e4f] text-white rounded-2xl shadow-2xl border border-green-600 overflow-hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition-all duration-200 font-medium w-full"
        >
          <CurrentRoleIcon role={currentRole} />
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Switch Role
              </motion.span>
            )}
          </AnimatePresence>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </motion.div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-green-500/50"
            >
              {roles.map((role, index) => {
                const isSelected = index === selectedIndex;
                const isCurrent = role.key === currentRole;

                return (
                  <motion.button
                    key={role.key}
                    onClick={() => switchRole(role.key)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-4 w-full px-6 py-3 text-left transition-all ${
                      isSelected ? "bg-white/20" : "hover:bg-white/10"
                    } ${isCurrent ? "font-bold" : ""}`}
                  >
                    <role.icon size={18} />
                    <span className="capitalize">{role.label}</span>
                    {isCurrent && (
                      <span className="ml-auto bg-yellow-400 text-[#079467] text-xs px-3 py-1 rounded-full font-bold">
                        CURRENT
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute -top-2 -right-2 text-xs font-bold bg-black text-white px-2 py-1 rounded shadow">
        DEV
      </div>
    </div>
  );
}

function CurrentRoleIcon({ role }) {
  const map = {
    tenant: Home,
    landlord: Building,
    artisan: Wrench,
    admin: Shield,
    "super-admin": Crown,
  };

  const Icon = map[role] || LogIn;
  return <Icon size={20} className="text-white drop-shadow" />;
}