import { Outlet } from "react-router-dom";
import AIChatbot from "@/components/ai/AIChatbot";

export default function PublicLayout() {
  return (
    <div className="">
      <main className="">
        <Outlet />
      </main>
      
      {/* AI Chatbot - Visible to public users */}
      <AIChatbot position="bottom-right" />
    </div>
  );
}