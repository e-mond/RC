import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-[#0f1724] mb-3">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
        <Button
          onClick={() => navigate("/")}
          className="bg-[#0b6e4f] hover:bg-[#095c42] text-white"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}