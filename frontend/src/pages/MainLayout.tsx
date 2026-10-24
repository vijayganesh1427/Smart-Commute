
import { Outlet, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import TopBar from "../components/layout/TopBar";
import FloatingControls from "../components/layout/FloatingControls";
import SearchBar from "../components/search/SearchBar";
import FleetStatus from "../components/layout/FleetStatus";
import BottomSheet from "../components/layout/BottomSheet";
import MapView from "../components/map/MapView";
import CloseButton from "../components/common/CloseButton";
import DisplayBusDetails from "../components/bus/DisplayBusDetails";
import CommuteHome from "../components/layout/CommuteHome";
import DisplayMessage from "../components/common/DisplayMessage";
import NotificationCenter from "../components/layout/NotificationCenter";
import { useBusNotifications } from "../hooks/useBusNotifications";
import type { Bus } from "../types/bus";
import type { BusRouteResponse } from "../services/routeService";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
interface MainLayoutProps {
    fleet: Bus[];
    favoriteBuses: number[];
    toggleFavorite: (busId: number) => void;
    routeDataByBus: Record<number, BusRouteResponse>;
}

export default function MainLayout({
    fleet,
    favoriteBuses,
    toggleFavorite,
    routeDataByBus,
}: MainLayoutProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filteredBus, setFilteredBus] = useState<Bus[]>([]);
    const [filSuccess, setFilSuccess] = useState(true);
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [messageKey, setMessageKey] = useState(0);
    const navigate = useNavigate();
    const busParam = searchParams.get("bus");
    const selectedBusId = busParam ? Number(busParam) : null;
    const selBus =
        fleet.find((bus) => bus.id === selectedBusId) ?? null;

    const selectedRouteData = selBus
        ? routeDataByBus[selBus.id] ?? null
        : null;

    const {
        notifications,
        permission,
        requestPermission,
        clearNotifications,
    } = useBusNotifications(favoriteBuses, fleet);

    const selectedBus = (bus: Bus | null) => {
        if (bus) {
            setSearchParams({ bus: String(bus.id) });
        } else {
            setSearchParams({});
        }
    };

    const onSearch = (str: string) => {
        const cleanedStr = str.trim().toLowerCase();

        if (!cleanedStr) {
            setFilteredBus([]);
            setFilSuccess(true);
            return;
        }

        const searchNum = /^\d+$/.test(cleanedStr)
            ? Number(cleanedStr)
            : null;

        const matches = fleet.filter((bus) => {
            if (searchNum !== null && bus.id === searchNum) {
                return true;
            }

            const matchRouteName =
                bus.routeName?.toLowerCase().includes(cleanedStr) ?? false;

            const matchArea =
                bus.currentArea?.toLowerCase().includes(cleanedStr) ?? false;

            const matchRouteStop =
                bus.route?.some((stop) =>
                    stop.toLowerCase().includes(cleanedStr)
                ) ?? false;

            return matchRouteName || matchArea || matchRouteStop;
        });

        setFilSuccess(matches.length > 0);
        setFilteredBus(matches);

        if (matches.length === 0) {
            setMessageKey((previous) => previous + 1);
        }
    };

    useEffect(() => {
        const toggleFavorites = () => {
            setFavoritesOnly((previous) => !previous);
        };

        window.addEventListener(
            "smart-commute:toggle-favorites",
            toggleFavorites
        );

        return () => {
            window.removeEventListener(
                "smart-commute:toggle-favorites",
                toggleFavorites
            );
        };
    }, []);

    useEffect(() => {
        // Keep search results aligned with updated fleet data.
        if (filteredBus.length > 0) {
            const ids = new Set(filteredBus.map((bus) => bus.id));
            setFilteredBus(fleet.filter((bus) => ids.has(bus.id)));
        }
    }, [fleet]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="relative min-h-screen">
            <div className="absolute inset-0 z-0">
                <MapView
                    buses={fleet}
                    selBus={selBus}
                    filBus={filteredBus}
                    favoriteBuses={favoriteBuses}
                    favoritesOnly={favoritesOnly}
                    routeData={selectedRouteData}
                    onBusSel={selectedBus}
                />
            </div>

            <SearchBar onSearch={onSearch} />
            <TopBar />

            <div className="absolute right-16 top-25 z-[1000]">
                <NotificationCenter
                    notifications={notifications}
                    permission={permission}
                    onRequestPermission={requestPermission}
                    onClear={clearNotifications}
                />
            </div>

            <FleetStatus />
            <div className="absolute bottom-53 right-15 z-20 flex flex-col gap-3">
                <button
                    onClick={() => navigate("/fleet-requests")}
                    title="Submit a bus request"
                    aria-label="Submit a bus request"
                    className="flex h-11 w-11 items-center justify-center rounded-xl
                            border border-bg-cyan-600
                            text-cyan-400 bg-zinc-950 shadow-lg
                            transition hover:scale-105 hover:text-cyan-300"
                >
                    <ClipboardList size={22} />
                </button>
            </div>

            <FloatingControls favoritesOnly={favoritesOnly} />

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
                                etaMinutes={
                                    selBus.status === "Live" &&
                                    selectedRouteData?.busStatus === "Live"
                                        ? selectedRouteData.etaMinutes
                                        : null
                                }
                                remainingDistanceKm={
                                    selectedRouteData?.remainingDistanceKm
                                }
                                isFavourite={favoriteBuses.includes(selBus.id)}
                                onToggleFavourite={toggleFavorite}
                            />
                            <CloseButton
                                onClose={() => setSearchParams({})}
                            />
                        </div>
                    ) : (
                        <CommuteHome />
                    )
                }
            />

            <DisplayMessage
                key={messageKey}
                msg={!filSuccess ? "No buses found for your search!!" : null}
            />

            <Outlet />
        </div>
    );
}
