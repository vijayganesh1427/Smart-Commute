import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import FloatingControls from "../components/layout/FloatingControls";
import SearchBar from "../components/search/SearchBar";
export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-gray-100">
      <SearchBar />
      <TopBar />
      <FloatingControls />
      <Outlet />
    </div>
  );
}