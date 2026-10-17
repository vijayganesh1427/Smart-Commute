import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BusFront,
    Check,
    CircleAlert,
    Search,
    ShieldAlert,
    SlidersHorizontal,
    Activity,
    MapPin,
    Route as RouteIcon,
} from "lucide-react";
import { buses as seedBuses } from "../../data/buses";
import type { Bus } from "../../types/bus";

const STORAGE_KEY = "smartCommuteFleet";

function loadFleet(): Bus[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return seedBuses.map((bus) => ({ ...bus }));

        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed)) return seedBuses.map((bus) => ({ ...bus }));

        const savedById = new Map<number, Bus>(
            parsed
                .filter((item): item is Bus =>
                    typeof item === "object" &&
                    item !== null &&
                    typeof (item as Bus).id === "number" &&
                    ["Live", "Stale", "Offline"].includes((item as Bus).status)
                )
                .map((bus) => [bus.id, bus])
        );

        return seedBuses.map((bus) => ({
            ...bus,
            ...(savedById.get(bus.id) ?? {}),
        }));
    } catch {
        return seedBuses.map((bus) => ({ ...bus }));
    }
}

function persistFleet(fleet: Bus[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
}

type StatusFilter = "All" | Bus["status"];

const statusStyles: Record<Bus["status"], string> = {
    Live: "bg-emerald-950 text-emerald-300 border-emerald-900",
    Stale: "bg-amber-950 text-amber-300 border-amber-900",
    Offline: "bg-slate-800 text-slate-300 border-slate-700",
};

export default function AdminFleet() {
    const navigate = useNavigate();
    const [fleet, setFleet] = useState<Bus[]>(loadFleet);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [savedMessage, setSavedMessage] = useState("");
    const [editingBusId, setEditingBusId] = useState<number | null>(null);

    const counts = useMemo(() => ({
        total: fleet.length,
        live: fleet.filter((bus) => bus.status === "Live").length,
        stale: fleet.filter((bus) => bus.status === "Stale").length,
        offline: fleet.filter((bus) => bus.status === "Offline").length,
    }), [fleet]);

    const filteredFleet = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return fleet.filter((bus) => {
            const matchesQuery = !normalized || [
                String(bus.id),
                bus.registrationNumber,
                bus.routeName,
                bus.currentArea,
                ...(bus.route ?? []),
            ].join(" ").toLowerCase().includes(normalized);
            return matchesQuery && (statusFilter === "All" || bus.status === statusFilter);
        });
    }, [fleet, query, statusFilter]);

    const changeStatus = (busId: number, status: Bus["status"]) => {
        const updated = fleet.map((bus) =>
            bus.id === busId ? { ...bus, status } : bus
        );
        setFleet(updated);
        persistFleet(updated);
        setSavedMessage(`Bus #${busId} updated to ${status}.`);
        setEditingBusId(null);
    };

    const resetDemoFleet = () => {
        const confirmed = window.confirm(
            "Reset all fleet statuses to the original demo data? This cannot be undone."
        );
        if (!confirmed) return;
        const reset = seedBuses.map((bus) => ({ ...bus }));
        setFleet(reset);
        persistFleet(reset);
        setSavedMessage("Fleet statuses reset to the original demo data.");
        setEditingBusId(null);
    };

    return (
        <main className="min-h-screen bg-[#100018] text-slate-100">
            <header className="sticky top-0 z-20 border-b border-cyan-900/70 bg-[#16001f]/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 rounded-lg border border-cyan-800 px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-950"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Back to map</span>
                        <span className="sm:hidden">Map</span>
                    </button>
                    <div className="flex items-center gap-2 text-cyan-300">
                        <SlidersHorizontal size={21} />
                        <span className="font-semibold">Fleet Management</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/analytics")}
                        className="rounded-lg border border-cyan-800 px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-950"
                    >
                        Analytics
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
                <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Operations overview</p>
                        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Fleet dashboard</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Review demo fleet status, inspect route information, and update a bus's displayed status.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={resetDemoFleet}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-900"
                    >
                        Reset demo data
                    </button>
                </section>

                <div className="mb-6 flex gap-3 rounded-2xl border border-amber-800/70 bg-amber-950/30 p-4">
                    <ShieldAlert size={22} className="mt-0.5 shrink-0 text-amber-300" />
                    <div>
                        <p className="font-semibold text-amber-200">Demo admin interface — not access-controlled</p>
                        <p className="mt-1 text-sm leading-5 text-amber-100/70">
                            Changes are saved in this browser's localStorage only. There is no admin authentication, shared server persistence, or authorization check. Do not use this page to manage a real fleet.
                        </p>
                    </div>
                </div>

                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                        { label: "Total buses", value: counts.total, icon: BusFront, accent: "text-cyan-300" },
                        { label: "Live", value: counts.live, icon: Activity, accent: "text-emerald-300" },
                        { label: "Stale", value: counts.stale, icon: CircleAlert, accent: "text-amber-300" },
                        { label: "Offline", value: counts.offline, icon: CircleAlert, accent: "text-slate-300" },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <article key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm text-slate-400">{item.label}</p>
                                    <Icon size={19} className={item.accent} />
                                </div>
                                <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
                            </article>
                        );
                    })}
                </section>

                <section className="mt-8">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                        <label className="flex flex-1 items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 focus-within:border-cyan-500">
                            <Search size={18} className="shrink-0 text-slate-400" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search bus ID, registration, route, or area..."
                                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                            />
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                            aria-label="Filter buses by status"
                        >
                            <option value="All">All statuses</option>
                            <option value="Live">Live</option>
                            <option value="Stale">Stale</option>
                            <option value="Offline">Offline</option>
                        </select>
                    </div>

                    {savedMessage && (
                        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
                            <Check size={17} />
                            {savedMessage}
                        </p>
                    )}

                    <div className="space-y-4">
                        {filteredFleet.map((bus) => (
                            <article key={bus.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
                                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-lg font-bold text-white">Bus #{bus.id} · {bus.routeName}</h2>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[bus.status]}`}>
                                                {bus.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-400">{bus.registrationNumber}</p>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slate-500">Current area</p>
                                                <p className="mt-1 flex items-center gap-2 text-sm text-slate-200"><MapPin size={15} className="text-cyan-400" />{bus.currentArea}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slate-500">Direction</p>
                                                <p className="mt-1 text-sm text-slate-200">{bus.direction}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-slate-500">Last update (demo)</p>
                                                <p className="mt-1 text-sm text-slate-200">{bus.lastUpdated}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-start gap-2">
                                            <RouteIcon size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                                            <div className="flex flex-wrap gap-2">
                                                {(bus.route ?? []).map((stop) => (
                                                    <span key={stop} className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300">{stop}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full shrink-0 lg:w-56">
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Update displayed status</label>
                                        <select
                                            value={bus.status}
                                            onChange={(event) => changeStatus(bus.id, event.target.value as Bus["status"])}
                                            className="w-full rounded-xl border border-slate-700 bg-[#16001f] px-3 py-3 text-sm text-white outline-none focus:border-cyan-500"
                                            aria-label={`Change status for bus ${bus.id}`}
                                        >
                                            <option value="Live">Live</option>
                                            <option value="Stale">Stale</option>
                                            <option value="Offline">Offline</option>
                                        </select>
                                        {editingBusId === bus.id && (
                                            <p className="mt-2 text-xs text-cyan-300">Select a status to save it.</p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingBusId(bus.id);
                                                navigate(`/?bus=${bus.id}`);
                                            }}
                                            className="mt-2 w-full rounded-xl border border-cyan-800 px-3 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-950"
                                        >
                                            View on map
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {filteredFleet.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">
                            <Search size={25} className="mx-auto text-slate-500" />
                            <p className="mt-3 font-semibold text-white">No buses found</p>
                            <p className="mt-1 text-sm text-slate-400">Try another search or status filter.</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
