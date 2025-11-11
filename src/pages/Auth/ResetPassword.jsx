import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "@/services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await resetPassword(token, { password, confirmPassword });
      setMessage(res.message || "Password successfully reset!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-semibold text-[#0f1724] mb-6 text-center">Reset Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0b6e4f] text-white py-2 rounded-lg hover:bg-[#095b40] transition disabled:opacity-70"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {message && (
        <p className="text-center text-sm text-gray-600 mt-4">{message}</p>
      )}
    </div>
  );
}
