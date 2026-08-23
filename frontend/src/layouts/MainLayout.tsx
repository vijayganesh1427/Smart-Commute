import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import FloatingControls from "../components/layout/FloatingControls";
import SearchBar from "../components/search/SearchBar";
import FleetStatus from "../components/layout/FleetStatus";
import BottomSheet from "../components/layout/BottomSheet";
import MapView from "../components/map/MapView";
import CloseButton from "../components/common/CloseButton";
import DisplayBusDetails from "../components/bus/DisplayBusDetails";
import type { Bus } from "../types/bus";
import { useState } from "react";
export default function MainLayout() {
  const[selBus,setSelBus]=useState<Bus|null>(null);
  const selectedBus=(selB: Bus|null)=>{
        setSelBus(selB);
        console.log(selB);
    }
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0">
        <MapView selBus={selBus} onBusSel={selectedBus}/>
      </div>
      <SearchBar />
      <TopBar />
      <FleetStatus />
      <FloatingControls />
      <BottomSheet>
        {selBus?
          <div><DisplayBusDetails bus={selBus} /><CloseButton onClose={()=>setSelBus(null)}/></div>:
          <div>Hello!</div>
        }
      </BottomSheet>
      <Outlet />
    </div>
  );
}