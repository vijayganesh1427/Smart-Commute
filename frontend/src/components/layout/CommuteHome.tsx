
import { useNavigate } from "react-router-dom";
import {
    BusFront,
    Search,
    Star,
    MapPinned,
    ChevronRight,
    Info,
} from "lucide-react";

export default function CommuteHome() {
    const navigate = useNavigate();

    return (
        <div className="w-full space-y-5 px-4 pb-6 pt-3 text-white">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-teal-400">
                        VITC SMART COMMUTE
                    </p>

                    <h2 className="mt-1 text-2xl font-bold tracking-tight">
                        Your commute
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                        Where would you like to go?
                    </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-400/10">
                    <BusFront className="h-6 w-6 text-teal-300" />
                </div>
            </div>

            {/* Search prompt */}
            <button
                type="button"
                onClick={() => {
                    window.dispatchEvent(
                        new Event("smart-commute:focus-search")
                    );
                }}
                className="group flex w-full items-center gap-3 rounded-2xl border border-teal-500/20 bg-teal-950/50 p-4 text-left transition hover:border-teal-400/50 hover:bg-teal-950"
            >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-400/10">
                    <Search className="h-5 w-5 text-teal-300" />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="font-semibold">Find your bus</p>
                    <p className="mt-1 text-sm text-zinc-400">
                        Search by bus number, route or area
                    </p>
                </div>

                <ChevronRight className="h-5 w-5 text-zinc-500 transition group-hover:translate-x-1" />
            </button>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => navigate("/my-fleet")}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-yellow-400/30 hover:bg-white/[0.07]"
                >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10">
                        <Star className="h-5 w-5 text-yellow-300" />
                    </div>

                    <p className="font-semibold">My Fleet</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                        Your favorite buses
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-teal-400/30 hover:bg-white/[0.07]"
                >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10">
                        <MapPinned className="h-5 w-5 text-teal-300" />
                    </div>

                    <p className="font-semibold">Explore map</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                        Explore buses and routes
                    </p>
                </button>
            </div>

            {/* Hint */}
            <div className="flex items-start gap-2 border-t border-white/10 pt-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />

                <p className="text-xs leading-relaxed text-zinc-400">
                    Select a bus marker on the map to see its location,
                    status and route details.
                </p>
            </div>
        </div>
    );
}
