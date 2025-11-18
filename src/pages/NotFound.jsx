import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#0f1724] mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Page not found</p>
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