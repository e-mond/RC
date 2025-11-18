import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, LogIn, Home, Building, Wrench, Shield, Crown } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { isMockMode } from "@/mocks/mockManager.js";

export default function RoleSwitcher() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { setUser } = useAuth();

  // Controls dropdown visibility
  const [isOpen, setIsOpen] = useState(false);

  // Tracks keyboard-highlighted role
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get currently stored role
  const currentRole = localStorage.getItem("userRole") || "none";

  // List of available roles in mock/demo mode
  const roles = useMemo(
    () => [
      { key: "tenant", label: "Tenant", icon: Home, path: "/dashboard/tenant" },
      { key: "landlord", label: "Landlord", icon: Building, path: "/dashboard/landlord" },
      { key: "artisan", label: "Artisan", icon: Wrench, path: "/dashboard/artisan" },
      { key: "admin", label: "Admin", icon: Shield, path: "/admin/dashboard" },
      { key: "super-admin", label: "Super Admin", icon: Crown, path: "/dashboard/super-admin" },
    ],
    []
  );

  // Predefined mock profiles (only used when mock mode is ON)
  const fakeProfiles = {
    tenant: { id: "u1", name: "John Tenant", email: "tenant@demo.com", role: "tenant" },
    landlord: { id: "u2", name: "Sarah Landlord", email: "landlord@demo.com", role: "landlord" },
    artisan: { id: "u3", name: "Mike Artisan", email: "artisan@demo.com", role: "artisan" },
    admin: { id: "u4", name: "Alex Admin", email: "admin@demo.com", role: "admin" },
    "super-admin": { id: "u5", name: "Super User", email: "super@demo.com", role: "super-admin" },
  };

  // Handles role switching, navigation, and updating stored data
  const switchRole = useCallback(
    (roleKey) => {
      // Save selected role
      localStorage.setItem("userRole", roleKey);

      // Load mock profile into localStorage + auth context
      const fakeUser = fakeProfiles[roleKey];
      if (fakeUser) {
        localStorage.setItem("user", JSON.stringify(fakeUser));
        setUser(fakeUser);
      }

      // Navigate to the role's dashboard
      const role = roles.find((r) => r.key === roleKey);
      if (role) navigate(role.path, { replace: true });

      setIsOpen(false); // Close dropdown
    },
    [roles, navigate, setUser]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard navigation: up/down arrows + Enter selection + Escape close
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") return setIsOpen(false);

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

  // Only show role switcher in MOCK mode
  if (!isMockMode()) return null;

  return (
    <div ref={menuRef} className="fixed top-32 right-4 z-50">
      {/* Wrapper UI */}
      <motion.div className="bg-linear-to-br from-[#079467] to-[#0b6e4f] text-white rounded-2xl shadow-2xl border border-green-600 overflow-hidden">
        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition-all duration-200 font-medium"
        >
          {/* Current role icon */}
          <CurrentRoleIcon role={currentRole} />

          {/* "Switch Role" text appears only when open */}
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                Switch Role
              </motion.span>
            )}
          </AnimatePresence>

          {/* Chevron rotation */}
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </motion.div>
        </button>

        {/* Dropdown roles list */}
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
                    onMouseEnter={() => setSelectedIndex(index)} // Hover highlight
                    className={`flex items-center gap-4 w-full px-6 py-3 text-left transition-all ${
                      isSelected ? "bg-white/20" : "hover:bg-white/10"
                    } ${isCurrent ? "font-bold" : ""}`}
                  >
                    {/* Icon */}
                    <role.icon size={18} />

                    {/* Role label */}
                    <span className="capitalize">{role.label}</span>

                    {/* Tag for the currently active role */}
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

      {/* Small "DEV" badge */}
      <div className="absolute -top-2 -right-2 text-xs font-bold bg-black text-white px-2 py-1 rounded shadow">
        DEV
      </div>
    </div>
  );
}

function CurrentRoleIcon({ role }) {
  // Maps a role to its icon component
  const map = {
    tenant: Home,
    landlord: Building,
    artisan: Wrench,
    admin: Shield,
    "super-admin": Crown,
  };

  // Default icon if role not found
  const Icon = map[role] || LogIn;

  return <Icon size={20} className="text-white drop-shadow" />;
}
