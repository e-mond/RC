import { Outlet } from "react-router-dom";
import DebugToggle from "@/components/DebugToggle";
import RoleSwitcher from "@/components/RoleSwitcher";

export default function PublicLayout() {
  return (
    <div className="">
      <main className="">
        <Outlet />
      </main>
        <DebugToggle />
        <RoleSwitcher />
    </div>
  );
}