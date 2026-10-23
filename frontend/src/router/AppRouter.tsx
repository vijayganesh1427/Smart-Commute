
import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import MainLayout from "../pages/MainLayout";
import BusDetails from "../pages/BusDetails/BusDetails";
import About from "../pages/About/About";
import NotFound from "../pages/NotFound/NotFound";
import MyFleet from "../pages/MyFleet/MyFleet";
import Analytics from "../pages/Analytics/Analytics";
import FreshersMode from "../pages/FreshersMode/FreshersMode";
import AdminFleet from "../pages/AdminFleet/AdminFleet";
import { getFleet } from "../services/fleetService";
import type { Bus } from "../types/bus";
import {
    getBusRoute,
    type BusRouteResponse,
} from "../services/routeService";
import FleetRequests from "../pages/FleetRequests/FleetRequests";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

function AppRoutes() {
    const [favoriteBuses, setFavoriteBuses] = useState<number[]>(() => {
        try {
            const saved = localStorage.getItem("favoriteBuses");
            const parsed: unknown = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed)
                ? parsed.filter((id): id is number =>
                    Number.isInteger(id) && id > 0
                )
                : [];
        } catch {
            return [];
        }
    });

    const [fleet, setFleet] = useState<Bus[]>([]);
    const [fleetLoading, setFleetLoading] = useState(true);
    const [fleetError, setFleetError] = useState<string | null>(null);
    const [routeDataByBus, setRouteDataByBus] = useState<
        Record<number, BusRouteResponse>
    >({});

    const location = useLocation();
    const [searchParams] = useSearchParams();

    const detailMatch = location.pathname.match(/^\/bus\/(\d+)$/);
    const detailBusId = detailMatch ? Number(detailMatch[1]) : null;
    const mapBusId =
        location.pathname === "/" && searchParams.has("bus")
            ? Number(searchParams.get("bus"))
            : null;

    const watchedBusIds = useMemo(() => {
        return [
            ...new Set([
                ...favoriteBuses,
                ...(detailBusId ? [detailBusId] : []),
                ...(mapBusId ? [mapBusId] : []),
            ]),
        ].filter((id) => Number.isInteger(id) && id > 0);
    }, [favoriteBuses, detailBusId, mapBusId]);

    const toggleFavorite = useCallback((busId: number) => {
        setFavoriteBuses((previous) => {
            if (previous.includes(busId)) {
                const confirmed = window.confirm(
                    "Are you sure you want to remove this bus from your favourites?"
                );

                if (!confirmed) return previous;
            }

            const updated = previous.includes(busId)
                ? previous.filter((id) => id !== busId)
                : [...previous, busId];

            localStorage.setItem("favoriteBuses", JSON.stringify(updated));
            return updated;
        });
    }, []);

    const loadFleet = useCallback(async () => {
        try {
            const result = await getFleet();
            setFleet(result.buses);
            setFleetError(null);
        } catch (error) {
            setFleetError(
                error instanceof Error ? error.message : "Unknown API error"
            );
        } finally {
            setFleetLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadFleet();

        const intervalId = window.setInterval(() => {
            void loadFleet();
        }, 15_000);

        return () => window.clearInterval(intervalId);
    }, [loadFleet]);

    useEffect(() => {
        let cancelled = false;

        const refreshRoutes = async () => {
            const results = await Promise.allSettled(
                watchedBusIds.map((id) =>
                    getBusRoute(id, { forceRefresh: true })
                )
            );

            if (cancelled) return;

            setRouteDataByBus((previous) => {
                const next = { ...previous };

                results.forEach((result, index) => {
                    const busId = watchedBusIds[index];

                    if (result.status === "fulfilled") {
                        next[busId] = result.value;
                    }
                    // Keep the last successful response on a network failure.
                });

                return next;
            });
        };

        if (watchedBusIds.length > 0) {
            void refreshRoutes();

            const intervalId = window.setInterval(() => {
                void refreshRoutes();
            }, 15_000);

            return () => {
                cancelled = true;
                window.clearInterval(intervalId);
            };
        }

        return () => {
            cancelled = true;
        };
    }, [watchedBusIds]);

    return (
        <>
            {fleetLoading && (
                <div className="fixed left-1/2 top-20 z-[1200] -translate-x-1/2 rounded-xl border border-cyan-700 bg-zinc-950/95 px-4 py-2 text-sm text-cyan-200 shadow-lg">
                    Loading fleet data from backend…
                </div>
            )}

            {fleetError && (
                <div
                    role="alert"
                    className="fixed left-1/2 top-20 z-[1200] w-[min(92vw,32rem)] -translate-x-1/2 rounded-xl border border-rose-700 bg-zinc-950/95 p-3 text-sm text-rose-200 shadow-lg"
                >
                    <p className="font-semibold">Could not refresh fleet data</p>
                    <p className="mt-1 text-xs text-rose-200/80">
                        {fleetError}. Make sure the backend is running.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setFleetLoading(true);
                            void loadFleet();
                        }}
                        className="mt-2 rounded-lg border border-rose-700 px-3 py-1.5 font-semibold hover:bg-rose-950"
                    >
                        Retry
                    </button>
                </div>
            )}

            <Routes>
                <Route
                    path="/"
                    element={
                        <MainLayout
                            fleet={fleet}
                            favoriteBuses={favoriteBuses}
                            toggleFavorite={toggleFavorite}
                            routeDataByBus={routeDataByBus}
                        />
                    }
                />

                <Route
                    path="/my-fleet"
                    element={
                        <MyFleet
                            fleet={fleet}
                            favoriteBuses={favoriteBuses}
                            toggleFavorite={toggleFavorite}
                            routeDataByBus={routeDataByBus}
                        />
                    }
                />

                <Route
                    path="/analytics"
                    element={
                        <Analytics
                            fleet={fleet}
                            favoriteBuses={favoriteBuses}
                        />
                    }
                />

                <Route
                    path="/freshers"
                    element={<FreshersMode fleet={fleet} />}
                />

                <Route
                    path="/admin/fleet"
                    element={<AdminFleet />}
                />

                <Route
                    path="/bus/:id"
                    element={
                        <BusDetails
                            fleet={fleet}
                            routeDataByBus={routeDataByBus}
                        />
                    }
                />
                <Route path="/fleet-requests" element={<FleetRequests fleet={fleet} />} />

                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}
