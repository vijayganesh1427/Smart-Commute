
import { Star, BusFront, MapPin, Clock, ArrowLeft } from "lucide-react";
import type { Bus } from "../../types/bus";
import { STATUS_CONFIG } from "../../constants/statusConfig";
import { useNavigate } from "react-router-dom";
import type { MyFleetProps } from "../../types/myFleetProps";
import type { BusRouteResponse } from "../../services/routeService";

interface SharedMyFleetProps extends MyFleetProps {
    routeDataByBus: Record<number, BusRouteResponse>;
}

export default function MyFleet({
    fleet,
    favoriteBuses,
    toggleFavorite,
    routeDataByBus,
}: SharedMyFleetProps) {
    const myFleet = fleet.filter((bus) => favoriteBuses.includes(bus.id));
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-black px-4 pb-8 pt-8 text-white sm:px-6 sm:pt-12">
            <div className="mx-auto max-w-5xl">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mb-6 flex items-center gap-2 rounded-lg border border-cyan-500 bg-cyan-950 px-3 py-2 text-sm text-slate-200 transition hover:bg-cyan-900"
                >
                    <ArrowLeft size={16} />
                    Back to Map
                </button>

                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        <h1 className="text-2xl font-bold">My Fleet</h1>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                        Your saved buses
                    </p>
                </div>

                {myFleet.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-16 text-center">
                        <Star className="mb-4 h-10 w-10 text-yellow-400" />
                        <h2 className="text-lg font-semibold">
                            No buses in your fleet yet
                        </h2>
                        <p className="mt-2 max-w-sm text-sm text-zinc-400">
                            Search for a bus and tap the star to add it to your fleet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myFleet.map((bus) => (
                            <FleetCard
                                key={bus.id}
                                bus={bus}
                                onRemove={toggleFavorite}
                                routeData={routeDataByBus[bus.id]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

function FleetCard({
    bus,
    onRemove,
    routeData,
}: {
    bus: Bus;
    onRemove: (busId: number) => void;
    routeData?: BusRouteResponse;
}) {
    const navigate = useNavigate();
    const statusColor = STATUS_CONFIG[bus.status].text;

    const canShowLiveEta =
        bus.status === "Live" &&
        routeData?.busStatus === "Live" &&
        routeData.etaMinutes !== null &&
        routeData.etaMinutes !== undefined &&
        Number.isFinite(routeData.etaMinutes) &&
        routeData.etaMinutes >= 0;

    const distance =
        routeData &&
        Number.isFinite(routeData.remainingDistanceKm) &&
        routeData.remainingDistanceKm >= 0
            ? `${routeData.remainingDistanceKm.toFixed(1)} km left`
            : null;

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/bus/${bus.id}`)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/bus/${bus.id}`);
                }
            }}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-cyan-900/60 bg-[#021f18] px-4 py-4 shadow-lg transition hover:border-cyan-900"
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-700 bg-purple-950/70">
                    <BusFront className="h-5 w-5 text-purple-300" />
                </div>

                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 font-bold text-white">
                            Bus {bus.id}
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span className="truncate text-sm font-medium text-zinc-300">
                            {bus.routeName}
                        </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                        <span className={statusColor}>{bus.status}</span>

                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {bus.currentArea}
                        </span>

                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            {canShowLiveEta
                                ? `${Math.ceil(routeData.etaMinutes!)} min`
                                : "ETA unavailable"}
                        </span>

                        {distance && (
                            <span className="text-zinc-400">{distance}</span>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    onRemove(bus.id);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-500/70 bg-zinc-900 transition hover:scale-105"
                aria-label={`Remove Bus ${bus.id} from fleet`}
            >
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </button>
        </article>
    );
}
