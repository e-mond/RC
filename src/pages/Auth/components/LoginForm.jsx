// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/Button";
//  import { useAuth } from "@/context/useAuth";

// export default function LoginForm() {
//   const { handleLogin } = useAuth();
//   const [form, setForm] = useState({ email: "", password: "", remember: false });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       await handleLogin(form);
//     } catch (err) {
//       setError(err.message || "Invalid email or password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <motion.form
//       onSubmit={handleSubmit}
//       className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//     >
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.1 }}
//       >
//         <div className="flex items-center gap-2 mb-2">
//           <div className="w-6 h-6 bg-[#0b6e4f] rounded-md" />
//           <h1 className="text-2xl font-semibold text-[#0f1724]">Rental Connects</h1>
//         </div>
//         <p className="text-gray-600 text-base">Welcome back! Log in to access your dashboard.</p>
//       </motion.div>

//       {/* Error */}
//       <AnimatePresence>
//         {error && (
//           <motion.div
//             key="error"
//             className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-md border border-red-300"
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -5 }}
//           >
//             {error}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Inputs */}
//       <div className="space-y-5">
//         <div>
//           <label className="block text-sm font-medium text-[#0f1724] mb-1">Email Address</label>
//           <input
//             type="email"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             placeholder="you@example.com"
//             required
//             className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none transition"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-Medium text-[#0f1724] mb-1">Password</label>
//           <input
//             type="password"
//             name="password"
//             value={form.password}
//             onChange={handleChange}
//             placeholder="********"
//             required
//             className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none transition"
//           />
//         </div>

//         <div className="flex justify-between items-center text-sm">
//           <label className="flex items-center gap-2 text-gray-1½">
//             <input
//               type="checkbox"
//               name="remember"
//               checked={form.remember}
//               onChange={handleChange}
//               className="w-4 h-4 text-[#0b6e4f] rounded focus:ring-[#0b6e4f]"
//             />
//             Remember me
//           </label>
//           <Link to="/forgot-password" className="text-[#0b6e4f] hover:underline">
//             Forgot Password?
//           </Link>
//         </div>
//       </div>

//       {/* Submit */}
//       <motion.div whileTap={{ scale: 0.97 }}>
//         <Button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70"
//         >
//           {loading ? "Logging in..." : "Log In"}
//         </Button>
//       </motion.div>

//       {/* Footer */}
//       <p className="text-center text-sm text-gray-600">
//         Don’t have an account?{" "}
//         <Link to="/role-selection" className="text-[#0b6e4f] font-medium hover:underline">
//           Get Started
//         </Link>
//       </p>
//     </motion.form>
//   );
// }




// src/pages/Auth/components/LoginForm.jsx

// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/Button";
// import { useAuth } from "@/context/useAuth";
// import apiClient from "@/services/apiClient.js";

// export default function LoginForm() {
//   const { handleLogin } = useAuth();
//   const [form, setForm] = useState({ email: "", password: "", remember: false });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       // Pass only email & password — matches handleLogin expectation
//       await handleLogin({ email: form.email, password: form.password });
//     } catch (err) {
//       setError(err.message || "Invalid email or password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDemoLogin = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       // Use correct mock endpoint: /api/auth/login
//       const res = await apiClient.post("/api/auth/login", {
//         email: "tenant@demo.com",
//         password: "any",
//       });

//       const { token, user } = res.data;
//       console.log("Demo login response:", res.data);

//       // Save everything needed
//       localStorage.setItem("token", token);
//       localStorage.setItem("userRole", user.role);
//       localStorage.setItem("user", JSON.stringify(user)); // Critical for session restore

//       // Redirect based on role
//       const role = user.role.toLowerCase();
//       const redirectMap = {
//         tenant: "dashboard/tenant",
//         landlord: "/dashboard/landlord",
//         artisan: "dashboard/artisan",
//         admin: "/admin/dashboard",
//         "super-admin": "/super-admin",
//       };
//       window.location.href = redirectMap[role] || "/";
//     } catch (err) {
//       console.error("Demo login failed:", err);
//       setError("Demo login failed. Is mock enabled?");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <motion.form
//       onSubmit={handleSubmit}
//       className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4 }}
//     >
//       <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//         <div className="flex items-center gap-2 mb-2">
//           <div className="w-6 h-6 bg-[#0b6e4f] rounded-md" />
//           <h1 className="text-2xl font-semibold text-[#0f1724]">Rental Connects</h1>
//         </div>
//         <p className="text-gray-600 text-base">Welcome back! Log in to access your dashboard.</p>
//       </motion.div>

//       <AnimatePresence>
//         {error && (
//           <motion.div
//             key="error"
//             className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-md border border-red-300"
//             initial={{ opacity: 0, y: -5 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -5 }}
//           >
//             {error}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="space-y-5">
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-[#0f1724] mb-1">Email Address</label>
//           <input
//             id="email"
//             type="email"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             placeholder="you@example.com"
//             required
//             className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none transition"
//           />
//         </div>

//         <div>
//           <label htmlFor="password" className="block text-sm font-medium text-[#0f1724] mb-1">Password</label>
//           <input
//             id="password"
//             type="password"
//             name="password"
//             value={form.password}
//             onChange={handleChange}
//             placeholder="********"
//             required
//             className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none transition"
//           />
//         </div>

//         <div className="flex justify-between items-center text-sm">
//           <label htmlFor="remember" className="flex items-center gap-2 text-gray-700 cursor-pointer">
//             <input
//               id="remember"
//               type="checkbox"
//               name="remember"
//               checked={form.remember}
//               onChange={handleChange}
//               className="w-4 h-4 text-[#0b6e4f] rounded focus:ring-[#0b6e4f]"
//             />
//             Remember me
//           </label>
//           <Link to="/forgot-password" className="text-[#0b6e4f] hover:underline">Forgot Password?</Link>
//         </div>
//       </div>

//       <motion.div whileTap={{ scale: 0.97 }}>
//         <Button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70"
//         >
//           {loading ? "Logging in..." : "Log In"}
//         </Button>
//       </motion.div>

//       {import.meta.env.DEV && (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
//           <button
//             type="button"
//             onClick={handleDemoLogin}
//             disabled={loading}
//             className="text-sm text-[#0b6e4f] underline hover:no-underline disabled:opacity-50"
//           >
//             Demo Login (tenant@demo.com / any password)
//           </button>
//         </motion.div>
//       )}

//       <p className="text-center text-sm text-gray-600">
//         Don’t have an account?{" "}
//         <Link to="/role-selection" className="text-[#0b6e4f] font-medium hover:underline">Get Started</Link>
//       </p>
//     </motion.form>
//   );
// }
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/useAuth";

export default function LoginForm() {
  const { handleLogin } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Normal login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await handleLogin({ email: form.email, password: form.password });
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Demo login
  const handleDemoLogin = async (role = "tenant") => {
    setLoading(true);
    setError("");

    const demoEmails = {
      tenant: "tenant@demo.com",
      landlord: "landlord@demo.com",
      artisan: "artisan@demo.com",
      admin: "admin@demo.com",
      "super-admin": "super@demo.com",
    };

    try {
      await handleLogin({ email: demoEmails[role], password: "any" });
    } catch (err) {
      console.error("Demo login failed:", err);
      setError("Demo login failed. Is mock enabled?");
    } finally {
      setLoading(false);
    }
  };

  // Background colors for demo buttons
  const demoColors = {
    tenant: "bg-green-500 hover:bg-green-600",
    landlord: "bg-blue-500 hover:bg-blue-600",
    artisan: "bg-yellow-500 hover:bg-yellow-600",
    admin: "bg-red-500 hover:bg-red-600",
    "super-admin": "bg-purple-500 hover:bg-purple-600",
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-[#0b6e4f] rounded-md" />
          <h1 className="text-2xl font-semibold text-[#0f1724]">Rental Connects</h1>
        </div>
        <p className="text-gray-600 text-base">Welcome back! Log in to access your dashboard.</p>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-md border border-red-300"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Fields */}
      <div className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#0f1724] mb-1">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none transition"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#0f1724] mb-1">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none transition"
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <label htmlFor="remember" className="flex items-center gap-2 text-gray-700 cursor-pointer">
            <input
              id="remember"
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              className="w-4 h-4 text-[#0b6e4f] rounded focus:ring-[#0b6e4f]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-[#0b6e4f] hover:underline">Forgot Password?</Link>
        </div>
      </div>

      {/* Login Button */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </motion.div>

      {/* Demo Buttons */}
      {import.meta.env.DEV && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-3 flex flex-wrap justify-center gap-2">
          {["tenant", "landlord", "artisan", "admin", "super-admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleDemoLogin(r)}
              disabled={loading}
              className={`text-white text-sm px-3 py-1 rounded font-medium transition ${demoColors[r]} disabled:opacity-50`}
            >
              {r} Demo
            </button>
          ))}
        </motion.div>
      )}

      {/* Signup Link */}
      <p className="text-center text-sm text-gray-600 mt-4">
        Don’t have an account?{" "}
        <Link to="/role-selection" className="text-[#0b6e4f] font-medium hover:underline">Get Started</Link>
      </p>
    </motion.form>
  );
}
