import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-gray-100">
      <TopBar />
      <Outlet />
    </div>
  );
}