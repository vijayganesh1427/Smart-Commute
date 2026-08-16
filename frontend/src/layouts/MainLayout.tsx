import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import FloatingControls from "../components/layout/FloatingControls";
import SearchBar from "../components/search/SearchBar";
import FleetStatus from "../components/layout/FleetStatus";
import BottomSheet from "../components/layout/BottomSheet";
export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-gray-100">
      <SearchBar />
      <TopBar />
      <FleetStatus />
      <FloatingControls />
      <BottomSheet><div>Working</div></BottomSheet>
      <Outlet />
    </div>
  );
}