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
import { buses } from "../data/buses";
import DisplayMessage from "../components/common/DisplayMessage";
import type { BusRouteResponse } from "../services/routeService";
import NotificationCenter from "../components/layout/NotificationCenter";
import { useBusNotifications } from "../hooks/useBusNotifications";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
interface MainLayoutProps {
  favoriteBuses: number[];
  toggleFavorite: (busId: number) => void;
}

export default function MainLayout({
  favoriteBuses,
  toggleFavorite,
}: MainLayoutProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selBus, setSelBus] = useState<Bus | null>(null);
  const [filteredBus, setfilteredBus] = useState<Bus[]>([]);
  const [filSuccess, setfilSuccess] = useState(true);
  const [messageKey, setMessageKey] = useState(0);
  const [routeData, setRouteData] =
    useState<BusRouteResponse | null>(null);
  const [fleet, setFleet] = useState<Bus[]>(() =>
    buses.map((bus) => ({ ...bus }))
  );
  const updateBusStatus = (busId: number, status: Bus["status"]) => {
    setFleet((prev) =>
      prev.map((bus) =>
        bus.id === busId ? { ...bus, status } : bus
      )
    );
  };
  const {notifications,permission,requestPermission,clearNotifications,simulateStatusChange} = useBusNotifications(favoriteBuses,fleet,updateBusStatus);
  const selectedBus = (selB: Bus | null) => {
    if (selB) {
        setSearchParams({ bus: String(selB.id) });
    } else {
        setSearchParams({});
    }
  };

  const onSearch = (str: string) => {
    console.log(str);

    const searchNum = Number(str);
    const cleanedStr = str.trim().toLowerCase();

    let filBus: Bus[] = [];

    if (cleanedStr) {
      for (const x of fleet) {

        if (!isNaN(searchNum) && x.id === searchNum) {
          filBus.push(x);
          continue;
        }

        const matchRoute =
          x.routeName?.toLowerCase().includes(cleanedStr);

        const matchArea =
          x.currentArea?.toLowerCase().includes(cleanedStr);

        if (matchRoute || matchArea) {
          filBus.push(x);
        }
      }
    }

    setfilSuccess(filBus.length > 0 || cleanedStr === "");
    setfilteredBus(filBus);

    if (cleanedStr && filBus.length === 0) {
      setMessageKey(prev => prev + 1);
    }
  };
  useEffect(() => {
      const busId = Number(searchParams.get("bus"));

      if (!busId) {
          setSelBus(null);
          return;
      }

      const bus = fleet.find(x => x.id === busId);

      if (bus) {
          setSelBus(bus);
      } else {
          setSelBus(null);
          setSearchParams({});
      }
  }, [searchParams,fleet]);
  return (
    <div className="relative min-h-screen">

      <div className="absolute inset-0 z-0">
        <MapView
          buses={fleet}
          selBus={selBus}
          filBus={filteredBus}
          onRouteDataChange={setRouteData}
          onBusSel={selectedBus}
        />
      </div>

      <SearchBar onSearch={onSearch} />

      <TopBar />

      <div className="fixed right-4 top-20 z-[1000]">
          <NotificationCenter
              notifications={notifications}
              permission={permission}
              onRequestPermission={requestPermission}
              onClear={clearNotifications}
          />
      </div>
      {<button
    type="button"
    onClick={() => {
        const busId = favoriteBuses[0];

        if (busId !== undefined) {
            simulateStatusChange(busId);
        } else {
            alert("Add a bus to My Fleet first!");
        }
    }}
    className="fixed bottom-24 right-4 z-[1000] rounded-xl border border-cyan-500 bg-zinc-900 px-4 py-2 text-sm font-semibold text-cyan-300 shadow-lg"
>
    Test Bus Notification
</button>}

      <FleetStatus />

      <FloatingControls />

      <BottomSheet
        children1={
          selBus && (
            <DisplayBusDetails
              bus={selBus}
              child1={true}
              isFavourite={favoriteBuses.includes(selBus.id)}
              onToggleFavourite={toggleFavorite}
            />
          )
        }

        children2={
          selBus ? (
            <div className="relative">
              <DisplayBusDetails
                bus={selBus}
                child1={false}
                etaMinutes={routeData?.etaMinutes}
                remainingDistanceKm={routeData?.remainingDistanceKm}
                isFavourite={favoriteBuses.includes(selBus.id)}
                
                onToggleFavourite={toggleFavorite}
              />

              <CloseButton
                onClose={() => setSearchParams({})}
              />
            </div>
          ) : (
            <div>Hello!</div>
          )
        }
      />

      <DisplayMessage
        key={messageKey}
        msg={
          !filSuccess
            ? "No buses found for your search!!"
            : null
        }
      />
    <Outlet />
    </div>
  );
}