import { useState } from "react";
import type { Bus } from "../../types/bus";
import { STATUS_CONFIG } from "../../constants/statusConfig";
import {
    BusFront,
    MapPin,
    ArrowRight,
    Gauge,
    Navigation,
    Clock,
    Snowflake,
    Slash,
    Star,
} from "lucide-react";

export default function DisplayBusDetails({
    bus,
    child1,
}: {
    bus: Bus;
    child1: boolean;
}) {
    const [isFavourite, setIsFavourite] = useState(false);
    const config=STATUS_CONFIG[bus.status];
    // Floating bus header
    if (child1) {
        return (
            <div
                className="
                    w-full
                    flex
                    items-center
                    justify-between
                    px-3
                "
            >
                {/* Bus identity */}
                <div className="flex min-w-0 items-center gap-2">
                    <BusFront className="h-5 w-5 shrink-0 text-yellow-300" />

                    <span className="text-lg font-bold text-white">
                        {bus.id}
                    </span>

                    <span className="text-zinc-500 text-2xl pb-1">
                        |
                    </span>

                    <span className="truncate font-semibold text-zinc-200">
                        {bus.routeName}
                    </span>
                </div>

                {/* AC + Favourite */}
                <div className="flex shrink-0 items-center gap-2">

                    {/* AC / Non-AC */}
                    <div
                        className="
                            relative
                            flex
                            items-center
                            gap-1
                            rounded-lg
                            border
                            border-cyan-500/70
                            bg-zinc-900
                            px-2
                            py-1
                        "
                    >
                        <Snowflake className="h-4 w-4 text-sky-400" />

                        {!bus.isAC && (
                            <Slash
                                className="absolute left-2 text-red-600"
                                size={16}
                            />
                        )}

                        <span className="text-xs text-white">
                            {bus.isAC ? "AC" : "Non-AC"}
                        </span>
                    </div>
                    
                    {/* Favourite */}
                    <button
                        type="button"
                        onClick={() =>
                            setIsFavourite((prev) => !prev)
                        }
                        className="
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-yellow-500
                            bg-zinc-900
                            p-1.5
                            transition
                            hover:scale-105
                        "
                        aria-label={
                            isFavourite
                                ? "Remove from favourites"
                                : "Add to favourites"
                        }
                    >
                        <Star
                            className={`
                                h-5
                                w-5
                                transition
                                ${
                                    isFavourite
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-yellow-300"
                                }
                            `}
                        />
                    </button>
                </div>
            </div>
        );
    }

    // Main BottomSheet content
    return (
        <div className="w-full">

            {/* Status */}
            <div className={`absolute flex items-center right-12 top-3 gap-2 px-2 py-1 text-xs backdrop-blur-xl font-bold tracking-wider border ${config.border} rounded-lg ${config.text} uppercase`}>
                {bus.status!="Offline" && <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.ping} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 border ${config.bg}`}></span>
                </span>}
                <span>{bus.status}</span>
            </div>

            {/* Registration */}
            <div className="text-zinc-100">
                Reg: {bus.registrationNumber}
            </div>

            {/* Assigned Route */}
            <div className="mt-4">
                <div className="mb-2 text-xs font-semibold uppercase text-zinc-400">
                    Assigned Route
                </div>

                <div
                    className="
                        overflow-x-auto
                        whitespace-nowrap
                        rounded-xl
                        border
                        border-cyan-500/30
                        bg-cyan-950/30
                        px-3
                        py-3
                        text-sm
                        font-semibold
                        text-cyan-300
                    "
                >
                    {bus.route?.map(bus=>
                        <>
                            {bus}
                            <span className="mx-2 text-zinc-500">
                                →
                            </span>
                        </>)}

                    VIT Chennai
                </div>
            </div>

            {/* Stats */}
            <div
                className="
                    mt-5
                    grid
                    grid-cols-2
                    gap-2
                    sm:grid-cols-4
                "
            >
                {/* Speed */}
                <div
                    className="
                        rounded-xl
                        border
                        border-zinc-700
                        bg-zinc-900
                        p-3
                    "
                >
                    <div className="flex items-center gap-1">
                        <Gauge className="h-4 w-4 text-cyan-400" />

                        <span className="text-xs text-zinc-400">
                            Speed
                        </span>
                    </div>

                    <div className="mt-1 font-bold text-white">
                        {bus.speed} km/h
                    </div>
                </div>

                {/* Distance */}
                <div
                    className="
                        rounded-xl
                        border
                        border-zinc-700
                        bg-zinc-900
                        p-3
                    "
                >
                    <div className="flex items-center gap-1">
                        <Navigation className="h-4 w-4 text-emerald-400" />

                        <span className="text-xs text-zinc-400">
                            Distance
                        </span>
                    </div>

                    <div className="mt-1 font-bold text-white">
                        {bus.distanceFromVIT} km
                    </div>
                </div>

                {/* ETA */}
                <div
                    className="
                        rounded-xl
                        border
                        border-zinc-700
                        bg-zinc-900
                        p-3
                    "
                >
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-yellow-400" />

                        <span className="text-xs text-zinc-400">
                            Smart ETA
                        </span>
                    </div>

                    <div className="mt-1 font-bold text-cyan-400">
                        {bus.estimatedArrival} mins
                    </div>
                </div>

                {/* Direction */}
                <div
                    className="
                        rounded-xl
                        border
                        border-zinc-700
                        bg-zinc-900
                        p-3
                    "
                >
                    <div className="flex items-center gap-1">
                        <ArrowRight className="h-4 w-4 text-purple-400" />

                        <span className="text-xs text-zinc-400">
                            Direction
                        </span>
                    </div>

                    <div className="mt-1 text-sm font-bold text-white">
                        {bus.direction}
                    </div>
                </div>
            </div>

            {/* Current Area */}
            <div
                className="
                    mt-5
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-zinc-700
                    bg-zinc-900
                    px-4
                    py-4
                "
            >
                <MapPin className="h-6 w-6 shrink-0 text-red-500" />

                <div>
                    <div className="text-xs uppercase text-zinc-400">
                        Current Area
                    </div>

                    <div className="mt-1 font-semibold text-white">
                        {bus.currentArea}
                    </div>
                </div>
            </div>

        </div>
    );
}