// src/components/RoleSwitcher.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Home, Building, Wrench, Shield, Crown, LogIn, GripVertical } from "lucide-react";
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
      admin: { id: "u4", fullName: "Alex Admin", email: "admin@demo.com", role: "admin" },
      "super-admin": { id: "u5", fullName: "Super User", email: "super@demo.com", role: "super-admin" },
    }),
    []
  );

  const switchRole = useCallback(
    async (roleKey) => {
      const fakeUser = fakeProfiles[roleKey];
      if (fakeUser) await login({ email: fakeUser.email, password: "any" });

      const target = roles.find((r) => r.key === roleKey);
      if (target) navigate(target.path, { replace: true });

      setIsOpen(false);
    },
    [roles, navigate, login, fakeProfiles]
  );

  // Close on outside click
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
      if (e.key === "Escape") setIsOpen(false);
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
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.2}
      dragConstraints={{ left: -1200, right: 1200, top: -600, bottom: 600 }}
      initial={{ top: 128, right: 16 }}
      className="fixed z-9999 select-none"
      ref={menuRef}
      style={{ touchAction: "none" }}
    >

      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl border-2"
        style={{
          background: "rgba(7, 148, 103, 0.25)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(255, 215, 0, 0.4)",
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.37),
            inset 0 0 40px rgba(255, 255, 255, 0.1),
            0 0 20px rgba(7, 148, 103, 0.3)
          `,
        }}
      >
        {/* Drag Handle */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing z-10">
          <GripVertical size={22} className="text-white/60" />
        </div>

        {/* Toggle Button - Only icon when closed */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative flex items-center justify-center w-full transition-all duration-300
            ${isOpen ? "py-5 px-6 gap-4" : "py-6 px-6"}
            hover:bg-white/10
          `}
        >
          <CurrentRoleIcon isOpen={isOpen} role={currentRole} />

          {/* Text & Up Chevron - only when open */}
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-white font-semibold tracking-wider whitespace-nowrap overflow-hidden"
                >
                  Switch Role
                </motion.span>

                <motion.div
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  className="ml-auto"
                >
                  <ChevronUp size={12} className="text-white" />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Tiny down chevron when closed */}
          {!isOpen && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <ChevronDown size={12} className="text-white/70 drop-shadow" />
            </div>
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="border-t border-white/20"
            >
              {roles.map((role, index) => {
                const isSelected = index === selectedIndex;
                const isCurrent = role.key === currentRole;

                return (
                  <motion.button
                    key={role.key}
                    onClick={() => switchRole(role.key)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      flex items-center gap-4 w-full px-6 py-4 text-left transition-all
                      ${isSelected ? "bg-white/20" : "hover:bg-white/15"}
                      ${isCurrent ? "font-bold" : ""}
                    `}
                    whileHover={{ x: 6 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <role.icon size={20} className="text-white drop-shadow" />
                    <span className="text-white capitalize">{role.label}</span>
                    {isCurrent && (
                      <span className="ml-auto bg-yellow-400 text-emerald-900 text-xs px-4 py-1.5 rounded-full font-bold shadow-lg">
                        CURRENT
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DEV Badge */}
      <div className="absolute -top-3 -right-3 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30 shadow-xl">
        DEV
      </div>
    </motion.div>
  );
}


function CurrentRoleIcon({ role, isOpen }) {
  const map = {
    tenant: Home,
    landlord: Building,
    artisan: Wrench,
    admin: Shield,
    "super-admin": Crown,
  };
  const Icon = map[role] || LogIn;
  return (
    <Icon
      size={isOpen ? 24 : 20}
      className="text-white drop-shadow-lg transition-all duration-300"
    />
  );
}