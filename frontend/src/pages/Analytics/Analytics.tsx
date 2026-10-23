import {
    Activity,
    ArrowLeft,
    BusFront,
    Clock3,
    Gauge,
    Heart,
    Info,
    MapPin,
    Route,
    ShieldCheck,
    Star,
    TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Bus } from "../../types/bus";

interface AnalyticsProps {
    fleet: Bus[];
    favoriteBuses: number[];
}

function StatCard({
    label,
    value,
    description,
    icon: Icon,
    accent = "cyan",
}: {
    label: string;
    value: string | number;
    description: string;
    icon: typeof Activity;
    accent?: "cyan" | "green" | "yellow" | "pink";
}) {
    const accentStyles = {
        cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
        green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        yellow: "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
        pink: "border-pink-500/20 bg-pink-500/10 text-pink-300",
    };

    return (
        <article className="group rounded-2xl border border-white/[0.08] bg-[#0e1118] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-500/30 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm text-zinc-400">{label}</p>
                    <p className="mt-3 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {value}
                    </p>
                </div>

                <span
                    className={`rounded-xl border p-2.5 ${accentStyles[accent]}`}
                >
                    <Icon size={20} />
                </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-zinc-500">
                {description}
            </p>
        </article>
    );
}

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Activity;
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-4 flex items-start gap-3">
            <span className="mt-0.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2 text-cyan-300">
                <Icon size={18} />
            </span>

            <div>
                <h2 className="text-lg font-bold text-white sm:text-xl">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-sm text-zinc-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: Bus["status"] }) {
    const styles = {
        Live: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
        Stale: "border-amber-500/25 bg-amber-500/10 text-amber-300",
        Offline: "border-rose-500/25 bg-rose-500/10 text-rose-300",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    status === "Live"
                        ? "bg-emerald-400"
                        : status === "Stale"
                          ? "bg-amber-400"
                          : "bg-rose-400"
                }`}
            />
            {status}
        </span>
    );
}

export default function Analytics({
    fleet,
    favoriteBuses,
}: AnalyticsProps) {
    const favoriteSet = new Set(favoriteBuses);
    const favoriteFleet = fleet.filter((bus) => favoriteSet.has(bus.id));

    const liveBuses = fleet.filter((bus) => bus.status === "Live");
    const staleBuses = fleet.filter((bus) => bus.status === "Stale");
    const offlineBuses = fleet.filter((bus) => bus.status === "Offline");

    const liveFavorites = favoriteFleet.filter(
        (bus) => bus.status === "Live"
    );

    const inactiveBuses = staleBuses.length + offlineBuses.length;

    const averageLiveSpeed = liveBuses.length
        ? Math.round(
              liveBuses.reduce((total, bus) => total + bus.speed, 0) /
                  liveBuses.length
          )
        : null;

    const livePercentage = fleet.length
        ? Math.round((liveBuses.length / fleet.length) * 100)
        : 0;

    const statusCounts = [
        {
            label: "Live",
            count: liveBuses.length,
            color: "bg-emerald-400",
            text: "text-emerald-300",
            dot: "bg-emerald-400",
        },
        {
            label: "Stale",
            count: staleBuses.length,
            color: "bg-amber-400",
            text: "text-amber-300",
            dot: "bg-amber-400",
        },
        {
            label: "Offline",
            count: offlineBuses.length,
            color: "bg-rose-400",
            text: "text-rose-300",
            dot: "bg-rose-400",
        },
    ];

    return (
        <main className="min-h-screen bg-[#07090e] px-4 pb-12 pt-6 text-white sm:px-6 sm:pt-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    to="/"
                    className="mb-7 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-zinc-300 transition hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-cyan-200"
                >
                    <ArrowLeft size={16} />
                    Back to map
                </Link>

                {/* Page heading */}
                <header className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-3 text-cyan-300">
                            <Activity size={26} />
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                                Smart Commute
                            </p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                Analytics overview
                            </h1>
                        </div>
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                        Monitor fleet availability, bus statuses, and your
                        saved commutes in one place.
                    </p>
                </header>

                {/* Top-level metrics */}
                <section
                    aria-label="Fleet overview"
                    className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <StatCard
                        label="Total buses"
                        value={fleet.length}
                        description="Buses currently available in the fleet."
                        icon={BusFront}
                        accent="cyan"
                    />

                    <StatCard
                        label="Fleet availability"
                        value={`${livePercentage}%`}
                        description={`${liveBuses.length} buses currently reporting live status.`}
                        icon={TrendingUp}
                        accent="green"
                    />

                    <StatCard
                        label="Average live speed"
                        value={
                            averageLiveSpeed === null
                                ? "—"
                                : `${averageLiveSpeed} km/h`
                        }
                        description="Average reported speed among live buses."
                        icon={Gauge}
                        accent="yellow"
                    />

                    <StatCard
                        label="My favourites"
                        value={favoriteFleet.length}
                        description={`${liveFavorites.length} of your saved buses are currently live.`}
                        icon={Star}
                        accent="pink"
                    />
                </section>

                {/* Fleet status */}
                <section className="mb-10">
                    <SectionHeading
                        icon={Activity}
                        title="Fleet status"
                        description="A breakdown of the latest status reported by each bus."
                    />

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                        <article className="rounded-2xl border border-white/[0.08] bg-[#0e1118] p-5 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="font-semibold text-zinc-100">
                                    Status distribution
                                </h3>
                                <span className="text-xs text-zinc-500">
                                    {fleet.length} buses
                                </span>
                            </div>

                            {fleet.length > 0 ? (
                                <>
                                    <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-zinc-800">
                                        {statusCounts.map((item) =>
                                            item.count > 0 ? (
                                                <div
                                                    key={item.label}
                                                    className={`${item.color} transition-all duration-500`}
                                                    style={{
                                                        width: `${
                                                            (item.count /
                                                                fleet.length) *
                                                            100
                                                        }%`,
                                                    }}
                                                    title={`${item.label}: ${item.count}`}
                                                />
                                            ) : null
                                        )}
                                    </div>

                                    <div className="mt-6 space-y-5">
                                        {statusCounts.map((item) => (
                                            <div key={item.label}>
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`h-2.5 w-2.5 rounded-full ${item.dot}`}
                                                        />
                                                        <span
                                                            className={`text-sm font-medium ${item.text}`}
                                                        >
                                                            {item.label}
                                                        </span>
                                                    </div>

                                                    <span className="text-sm text-zinc-300">
                                                        {item.count}
                                                        <span className="ml-2 text-xs text-zinc-500">
                                                            {Math.round(
                                                                (item.count /
                                                                    fleet.length) *
                                                                    100
                                                            )}
                                                            %
                                                        </span>
                                                    </span>
                                                </div>

                                                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                                    <div
                                                        className={`h-full rounded-full ${item.color}`}
                                                        style={{
                                                            width: `${
                                                                (item.count /
                                                                    fleet.length) *
                                                                100
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="mt-5 text-sm text-zinc-500">
                                    Fleet data is not available yet.
                                </p>
                            )}
                        </article>

                        <article className="rounded-2xl border border-white/[0.08] bg-[#0e1118] p-5 sm:p-6">
                            <div className="flex items-center gap-2">
                                <ShieldCheck
                                    size={19}
                                    className="text-cyan-300"
                                />
                                <h3 className="font-semibold text-zinc-100">
                                    Operational summary
                                </h3>
                            </div>

                            <div className="mt-5 space-y-3">
                                <div className="flex items-center justify-between rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] p-4">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-200">
                                            Live buses
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            Currently reporting live
                                        </p>
                                    </div>
                                    <span className="text-2xl font-bold text-emerald-300">
                                        {liveBuses.length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between rounded-xl border border-amber-500/15 bg-amber-500/[0.05] p-4">
                                    <div>
                                        <p className="text-sm font-medium text-amber-200">
                                            Stale buses
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            GPS data needs refreshing
                                        </p>
                                    </div>
                                    <span className="text-2xl font-bold text-amber-300">
                                        {staleBuses.length}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between rounded-xl border border-rose-500/15 bg-rose-500/[0.05] p-4">
                                    <div>
                                        <p className="text-sm font-medium text-rose-200">
                                            Offline buses
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            No recent usable GPS update
                                        </p>
                                    </div>
                                    <span className="text-2xl font-bold text-rose-300">
                                        {offlineBuses.length}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-start gap-2 rounded-xl bg-zinc-800/50 p-3">
                                <Clock3
                                    size={15}
                                    className="mt-0.5 shrink-0 text-zinc-400"
                                />
                                <p className="text-xs leading-5 text-zinc-400">
                                    Status reflects the latest available GPS
                                    timestamps, not historical reliability.
                                </p>
                            </div>
                        </article>
                    </div>
                </section>

                {/* My favourites */}
                <section className="mb-10">
                    <SectionHeading
                        icon={Heart}
                        title="My commute"
                        description="A quick overview of the buses you have saved."
                    />

                    {favoriteFleet.length === 0 ? (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0e1118] p-6 sm:p-8">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl border border-pink-500/20 bg-pink-500/10 p-3 text-pink-300">
                                    <Star size={22} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">
                                        Build your personal fleet
                                    </h3>
                                    <p className="mt-1 max-w-lg text-sm leading-6 text-zinc-400">
                                        Save the buses you use regularly to
                                        keep track of their status from My
                                        Fleet.
                                    </p>
                                    <Link
                                        to="/my-fleet"
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                                    >
                                        <Star size={15} />
                                        Open My Fleet
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e1118]">
                            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4 sm:px-5">
                                <h3 className="font-semibold text-white">
                                    Saved buses
                                </h3>
                                <Link
                                    to="/my-fleet"
                                    className="text-sm text-cyan-300 transition hover:text-cyan-200"
                                >
                                    View all
                                </Link>
                            </div>

                            <ul className="divide-y divide-white/[0.06]">
                                {favoriteFleet.map((bus) => (
                                    <li
                                        key={bus.id}
                                        className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-white/[0.02] sm:px-5"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                                                <BusFront size={19} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-zinc-100">
                                                    Bus {bus.id} · {bus.routeName}
                                                </p>

                                                <p className="mt-1 flex items-center gap-1 truncate text-xs text-zinc-500">
                                                    <MapPin
                                                        size={12}
                                                        className="shrink-0"
                                                    />
                                                    {bus.currentArea ||
                                                        "Area unavailable"}
                                                </p>
                                            </div>
                                        </div>

                                        <StatusBadge status={bus.status} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* Future metrics: concise, no demo disclaimers */}
                <section>
                    <SectionHeading
                        icon={Route}
                        title="Service insights"
                        description="Additional performance metrics can be calculated as trip history becomes available."
                    />

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <article className="rounded-2xl border border-white/[0.08] bg-[#0e1118] p-5">
                            <Route className="mb-4 h-5 w-5 text-cyan-300" />
                            <h3 className="font-semibold text-zinc-100">
                                Route reliability
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Compare scheduled and actual arrival times to
                                understand route punctuality.
                            </p>
                            <p className="mt-4 text-xs text-zinc-500">
                                Requires recorded trip history
                            </p>
                        </article>

                        <article className="rounded-2xl border border-white/[0.08] bg-[#0e1118] p-5">
                            <Gauge className="mb-4 h-5 w-5 text-emerald-300" />
                            <h3 className="font-semibold text-zinc-100">
                                Speed trends
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Track changes in speed over time and compare
                                patterns across routes.
                            </p>
                            <p className="mt-4 text-xs text-zinc-500">
                                Requires historical GPS samples
                            </p>
                        </article>

                        <article className="rounded-2xl border border-white/[0.08] bg-[#0e1118] p-5">
                            <Activity className="mb-4 h-5 w-5 text-amber-300" />
                            <h3 className="font-semibold text-zinc-100">
                                Waiting times
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Estimate typical passenger waiting times
                                using recorded arrivals and departures.
                            </p>
                            <p className="mt-4 text-xs text-zinc-500">
                                Requires arrival history
                            </p>
                        </article>
                    </div>

                    <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                        <Info
                            size={15}
                            className="mt-0.5 shrink-0 text-zinc-500"
                        />
                        <p className="text-xs leading-5 text-zinc-500">
                            Metrics above describe current fleet data. Historical
                            trends and service reliability will become
                            meaningful once trip records are collected.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
