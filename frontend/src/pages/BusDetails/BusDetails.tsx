
import { useNavigate, useParams } from "react-router-dom";
import {
    BusFront,
    ArrowLeft,
    MapPin,
    Gauge,
    Clock,
    Route as RouteIcon,
    Navigation,
    MapPinned,
    CircleDot,
    CheckCircle2,
} from "lucide-react";

import type { Bus } from "../../types/bus";
import type { BusRouteResponse } from "../../services/routeService";

interface BusDetailsProps {
    fleet: Bus[];
    routeDataByBus: Record<number, BusRouteResponse>;
}

function formatDistanceKm(
    distance: number | null | undefined
): string {
    if (
        distance == null ||
        !Number.isFinite(distance) ||
        distance < 0
    ) {
        return "Unavailable";
    }

    return `${distance.toFixed(1)} km`;
}

function formatEta(minutes: number | null | undefined): string {
    if (
        minutes == null ||
        !Number.isFinite(minutes) ||
        minutes < 0
    ) {
        return "Unavailable";
    }

    const rounded = Math.ceil(minutes);

    if (rounded < 1) return "Less than 1 min";
    if (rounded < 60) return `${rounded} min`;

    const hours = Math.floor(rounded / 60);
    const remaining = rounded % 60;

    return remaining
        ? `${hours} hr ${remaining} min`
        : `${hours} hr`;
}

export default function BusDetails({
    fleet,
    routeDataByBus,
}: BusDetailsProps) {
    const { id } = useParams();
    const navigate = useNavigate();

    const busId = Number(id);
    const bus = fleet.find((item) => item.id === busId);
    const routeData = routeDataByBus[busId];

    if (!bus) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-5 text-center text-white">
                <BusFront className="h-12 w-12 text-purple-300" />
                <h1 className="text-2xl font-bold">Bus not found</h1>

                <button
                    type="button"
                    onClick={() => navigate("/my-fleet")}
                    className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950 px-4 py-2.5 text-sm text-cyan-100 hover:bg-cyan-950"
                >
                    <ArrowLeft size={16} />
                    Back to My Fleet
                </button>
            </main>
        );
    }

    const canShowLiveEta =
        bus.status === "Live" &&
        routeData?.busStatus === "Live" &&
        routeData.etaMinutes != null &&
        Number.isFinite(routeData.etaMinutes) &&
        routeData.etaMinutes >= 0;

    const canShowLiveSpeed = bus.status === "Live";

    /*
     * OSRM-style routing APIs return total distance in METRES.
     * remainingDistanceKm is already expressed in KILOMETRES.
     */
    const totalDistanceKm =
        routeData && Number.isFinite(routeData.distance)
            ? routeData.distance / 1000
            : null;

    const namedStops = Array.isArray(bus.route)
        ? bus.route.filter(
              (stop): stop is string =>
                  typeof stop === "string" && stop.trim().length > 0
          )
        : [];

    const statusStyles: Record<string, string> = {
        Live: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        Stale: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
        Offline: "border-red-400/20 bg-red-400/10 text-red-300",
    };

    return (
        <main className="min-h-screen bg-[#05070b] px-4 pb-10 pt-8 text-white sm:px-6 sm:pt-12">
            <div className="mx-auto max-w-4xl">
                {/* One back button and one map button */}
                <div className="mb-5 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/my-fleet")}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        My Fleet
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(`/?bus=${bus.id}`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/70 px-3.5 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-950"
                    >
                        <MapPinned size={16} />
                        View on Map
                    </button>
                </div>

                {/* Bus header */}
                <section className="rounded-2xl border border-cyan-900/60 bg-gradient-to-br from-[#05291f] to-[#071a19] p-5 sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10">
                            <BusFront className="h-7 w-7 text-purple-300" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold sm:text-3xl">
                                    Bus {bus.id}
                                </h1>

                                <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                        statusStyles[bus.status] ??
                                        "border-zinc-700 bg-zinc-800 text-zinc-300"
                                    }`}
                                >
                                    {bus.status}
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-zinc-400">
                                {bus.routeName}
                            </p>

                            <div className="mt-2 flex items-center gap-1.5 text-sm text-zinc-400">
                                <MapPin size={14} />
                                {bus.currentArea || "Area unavailable"}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Summary cards */}
                <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <SummaryCard
                        icon={<Gauge size={15} />}
                        label="Speed"
                        value={
                            canShowLiveSpeed
                                ? `${bus.speed} km/h`
                                : "—"
                        }
                        hint="Latest GPS reading"
                    />

                    <SummaryCard
                        icon={<Clock size={15} />}
                        label="Estimated arrival"
                        value={
                            canShowLiveEta
                                ? formatEta(routeData.etaMinutes)
                                : "Unavailable"
                        }
                        hint={
                            canShowLiveEta
                                ? "Live estimate"
                                : "Requires live GPS"
                        }
                        highlight
                    />

                    <SummaryCard
                        icon={<RouteIcon size={15} />}
                        label="Total distance"
                        value={formatDistanceKm(totalDistanceKm)}
                        hint="Full route"
                    />

                    <SummaryCard
                        icon={<Navigation size={15} />}
                        label="Remaining"
                        value={formatDistanceKm(
                            routeData?.remainingDistanceKm
                        )}
                        hint="Remaining distance"
                    />
                </section>

                {/* Actual named stops */}
                <section className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60">
                    <div className="border-b border-white/[0.07] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <RouteIcon
                                size={18}
                                className="text-cyan-300"
                            />
                            <h2 className="font-semibold">
                                Route & stops
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-zinc-500">
                            {namedStops.length > 0
                                ? `${namedStops.length} configured stops`
                                : "Stop information"}
                        </p>
                    </div>

                    {namedStops.length > 0 ? (
                        <div className="p-5">
                            <div className="relative space-y-0">
                                {namedStops.map((stop, index) => (
                                    <div
                                        key={`${stop}-${index}`}
                                        className="relative flex gap-3 pb-5 last:pb-0"
                                    >
                                        {index < namedStops.length - 1 && (
                                            <div className="absolute bottom-0 left-[11px] top-6 w-px bg-cyan-900" />
                                        )}

                                        <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-950">
                                            {index === namedStops.length - 1 ? (
                                                <CheckCircle2
                                                    size={13}
                                                    className="text-cyan-300"
                                                />
                                            ) : (
                                                <CircleDot
                                                    size={13}
                                                    className="text-cyan-300"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-3">
                                            <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                                                {index === 0
                                                    ? "Starting stop"
                                                    : index === namedStops.length - 1
                                                        ? "Final stop"
                                                        : `Stop ${index + 1}`}
                                            </p>

                                            <p className="mt-1 font-medium text-zinc-200">
                                                {stop}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-5">
                            <p className="text-sm text-zinc-300">
                                Named stops aren't configured for this bus yet.
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                                The map route is still available when route
                                coordinates have been loaded.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    hint,
    highlight = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    hint: string;
    highlight?: boolean;
}) {
    return (
        <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-zinc-900/70 p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
                {icon}
                <span>{label}</span>
            </div>

            <p
                className={`mt-3 break-words text-xl font-bold ${
                    highlight ? "text-cyan-300" : "text-white"
                }`}
            >
                {value}
            </p>

            <p className="mt-1 text-xs text-zinc-500">{hint}</p>
        </div>
    );
}
