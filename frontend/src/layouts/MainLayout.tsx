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
      for (const x of buses) {

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

      const bus = buses.find(x => x.id === busId);

      if (bus) {
          setSelBus(bus);
      } else {
          setSelBus(null);
          setSearchParams({});
      }
  }, [searchParams]);
  return (
    <div className="relative min-h-screen">

      <div className="absolute inset-0 z-0">
        <MapView
          selBus={selBus}
          filBus={filteredBus}
          onBusSel={selectedBus}
        />
      </div>

      <SearchBar onSearch={onSearch} />

      <TopBar />

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