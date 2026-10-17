import {
    Activity,
    ArrowLeft,
    BusFront,
    Clock3,
    Gauge,
    Heart,
    Info,
    Route,
    ShieldCheck,
    Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { buses } from "../../data/buses";

interface AnalyticsProps {
    favoriteBuses: number[];
}

function StatCard({
    label,
    value,
    description,
    icon: Icon,
}: {
    label: string;
    value: string | number;
    description: string;
    icon: typeof Activity;
}) {
    return (
        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/90 p-4 shadow-lg sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-zinc-400">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                        {value}
                    </p>
                </div>
                <span className="rounded-xl border border-cyan-500/30 bg-cyan-950/60 p-2.5 text-cyan-300">
                    <Icon size={20} />
                </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">{description}</p>
        </article>
    );
}

function AvailabilityCard({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <article className="flex gap-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <div>
                <h3 className="font-semibold text-zinc-200">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
            </div>
        </article>
    );
}

export default function Analytics({ favoriteBuses }: AnalyticsProps) {
    const favoriteSet = new Set(favoriteBuses);
    const favoriteFleet = buses.filter((bus) => favoriteSet.has(bus.id));
    const liveFavorites = favoriteFleet.filter((bus) => bus.status === "Live");
    const liveBuses = buses.filter((bus) => bus.status === "Live");
    const inactiveBuses = buses.filter((bus) => bus.status !== "Live");
    const averageLiveSpeed = liveBuses.length
        ? Math.round(
              liveBuses.reduce((total, bus) => total + bus.speed, 0) /
                  liveBuses.length,
          )
        : null;

    const statusCounts = [
        {
            label: "Live",
            count: buses.filter((bus) => bus.status === "Live").length,
            color: "bg-emerald-400",
            text: "text-emerald-300",
        },
        {
            label: "Stale",
            count: buses.filter((bus) => bus.status === "Stale").length,
            color: "bg-amber-400",
            text: "text-amber-300",
        },
        {
            label: "Offline",
            count: buses.filter((bus) => bus.status === "Offline").length,
            color: "bg-rose-400",
            text: "text-rose-300",
        },
    ];
    const maxStatusCount = Math.max(1, ...statusCounts.map((item) => item.count));

    return (
        <main className="min-h-screen bg-zinc-950 px-4 pb-10 pt-6 text-white sm:px-6 sm:pt-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/"
                    className="mb-6 inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition hover:border-cyan-500 hover:text-cyan-300"
                >
                    <ArrowLeft size={16} />
                    Back to map
                </Link>

                <header className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/60 p-3 text-cyan-300">
                            <Activity size={26} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                                Smart Commute
                            </p>
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                Analytics
                            </h1>
                        </div>
                    </div>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                        A quick view of your saved buses and the fleet information currently
                        available in this demo.
                    </p>
                </header>

                <section aria-labelledby="personal-analytics-heading" className="mb-9">
                    <div className="mb-4 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-400" />
                        <h2 id="personal-analytics-heading" className="text-lg font-bold sm:text-xl">
                            Your commute
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="Favourite buses"
                            value={favoriteFleet.length}
                            description="Buses currently saved in My Fleet."
                            icon={Star}
                        />
                        <StatCard
                            label="Favourite buses live"
                            value={liveFavorites.length}
                            description="Saved buses whose current demo status is Live."
                            icon={BusFront}
                        />
                        <StatCard
                            label="Live fleet"
                            value={`${liveBuses.length} / ${buses.length}`}
                            description="Buses currently marked Live in the available dataset."
                            icon={Activity}
                        />
                        <StatCard
                            label="Average live speed"
                            value={averageLiveSpeed === null ? "—" : `${averageLiveSpeed} km/h`}
                            description="Average of current speeds for Live demo buses, not a historical trend."
                            icon={Gauge}
                        />
                    </div>

                    {favoriteFleet.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5">
                            <h3 className="font-semibold text-cyan-200">Start with My Fleet</h3>
                            <p className="mt-1 text-sm leading-6 text-zinc-400">
                                Add buses to your favourites to see your saved-bus statistics here.
                            </p>
                            <Link
                                to="/my-fleet"
                                className="mt-3 inline-flex rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                            >
                                Open My Fleet
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/80">
                            <div className="border-b border-zinc-800 px-4 py-3">
                                <h3 className="font-semibold">Your favourite buses</h3>
                            </div>
                            <ul className="divide-y divide-zinc-800">
                                {favoriteFleet.map((bus) => (
                                    <li
                                        key={bus.id}
                                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <BusFront className="h-5 w-5 shrink-0 text-cyan-300" />
                                            <div className="min-w-0">
                                                <p className="font-semibold text-zinc-100">
                                                    Bus {bus.id} · {bus.routeName}
                                                </p>
                                                <p className="truncate text-xs text-zinc-500">
                                                    {bus.registrationNumber} · {bus.currentArea}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                bus.status === "Live"
                                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                                    : bus.status === "Stale"
                                                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                                      : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                                            }`}
                                        >
                                            {bus.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                <section aria-labelledby="fleet-snapshot-heading" className="mb-9">
                    <div className="mb-4 flex items-center gap-2">
                        <Route className="h-5 w-5 text-cyan-300" />
                        <h2 id="fleet-snapshot-heading" className="text-lg font-bold sm:text-xl">
                            Fleet snapshot
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/90 p-4 sm:p-5">
                            <h3 className="font-semibold">Bus status distribution</h3>
                            <p className="mt-1 text-sm text-zinc-500">
                                Current statuses from the mock fleet dataset.
                            </p>
                            <div className="mt-5 space-y-4">
                                {statusCounts.map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1.5 flex items-center justify-between text-sm">
                                            <span className={item.text}>{item.label}</span>
                                            <span className="text-zinc-300">
                                                {item.count} {item.count === 1 ? "bus" : "buses"}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                                            <div
                                                className={`h-full rounded-full ${item.color}`}
                                                style={{
                                                    width: `${(item.count / maxStatusCount) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-2xl border border-zinc-700 bg-zinc-900/90 p-4 sm:p-5">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                                <h3 className="font-semibold">Operational summary</h3>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-zinc-800/80 p-3">
                                    <p className="text-xs text-zinc-400">Live / active</p>
                                    <p className="mt-1 text-2xl font-bold text-emerald-300">
                                        {liveBuses.length}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-zinc-800/80 p-3">
                                    <p className="text-xs text-zinc-400">Not currently live</p>
                                    <p className="mt-1 text-2xl font-bold text-amber-300">
                                        {inactiveBuses.length}
                                    </p>
                                </div>
                                <div className="col-span-2 rounded-xl border border-zinc-700 p-3">
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        <Clock3 size={16} className="text-amber-300" />
                                        <span className="text-sm font-medium">Waiting-time analytics</span>
                                    </div>
                                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                                        Not available yet: the current dataset does not store actual
                                        student waiting-time history.
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-zinc-500">
                        This is a demo-data snapshot, not a live administrative dashboard. Historical
                        trends, route reliability, and request approval statistics require stored
                        records that are not currently available.
                    </p>
                </section>

                <section aria-labelledby="data-gaps-heading">
                    <div className="mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-amber-300" />
                        <h2 id="data-gaps-heading" className="text-lg font-bold sm:text-xl">
                            Analytics requiring more data
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <AvailabilityCard
                            title="Route reliability"
                            description="Needs historical arrival or delay records before reliability can be calculated."
                        />
                        <AvailabilityCard
                            title="Average speed trends"
                            description="Needs timestamped speed samples; a single current speed cannot show a trend."
                        />
                        <AvailabilityCard
                            title="Approval statistics"
                            description="Needs administrative request records and their approval/rejection outcomes."
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}
