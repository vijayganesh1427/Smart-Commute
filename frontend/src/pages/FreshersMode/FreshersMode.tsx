import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BusFront,
    MapPin,
    Search,
    ChevronDown,
    ChevronUp,
    Compass,
    CircleHelp,
    Route as RouteIcon,
    ShieldCheck,
} from "lucide-react";
import type { Bus } from "../../types/bus";


const faqs = [
    {
        question: "How do I find my college bus?",
        answer:
            "Use the search bar to search by bus ID, route name, or current area. Select a result to view its details and explore the bus route.",
    },
    {
        question: "What do Live, Stale, and Offline mean?",
        answer:
            "Live means the bus has a recent location update. Stale means its displayed location may be old. Offline means a recent usable location is unavailable.",
    },
    {
        question: "How do I save a bus I use regularly?",
        answer:
            "Open a bus on the map and use the favourite option in its details. Saved buses appear in My Fleet, where you can find them again quickly.",
    },
    {
        question: "Can I share a bus with a friend?",
        answer:
            "Open the bus details and use Share. Smart Commute creates a link to that bus. The link works for others when they can access the same deployed app or reachable network address.",
    },
    {
        question: "What if a bus or pickup point is missing?",
        answer:
            "Try searching by route name or nearby area. If you still cannot find the bus, contact the college transport office for route information.",
    },
    {
        question: "How do I choose a suitable route?",
        answer:
            "Look for a route that includes an area close to your pickup point, then inspect the bus details and status. Confirm the actual pickup point and timing with the college transport office before travelling.",
    },
];

const steps = [
    {
        number: "01",
        title: "Search for your bus",
        description:
            "Search using the bus ID, route name, or an area shown in the app.",
    },
    {
        number: "02",
        title: "Check the details",
        description:
            "Review the displayed route, current area, direction, and status. Use the displayed route and status information to plan your commute.",
    },
    {
        number: "03",
        title: "Save it to My Fleet",
        description:
            "Favourite the buses you use often so you can find them faster later.",
    },
    {
        number: "04",
        title: "Explore and share",
        description:
            "Open a bus on the map to inspect its route, or share its link with a friend.",
    },
];

export default function FreshersMode({fleet}:{fleet:Bus[]}) {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const recommendations = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return fleet.filter((bus) => {
            if (!normalized) return true;
            const searchable = [
                String(bus.id),
                bus.routeName,
                bus.currentArea,
                ...(bus.route ?? []),
            ]
                .join(" ")
                .toLowerCase();
            return searchable.includes(normalized);
        });
    }, [query]);

    return (
        <main className="min-h-screen bg-[#100018] text-slate-100">
            <header className="sticky top-0 z-20 border-b border-cyan-900/70 bg-[#16001f]/95 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
                        <BusFront size={22} />
                        <span className="font-semibold">Freshers Mode</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/my-fleet")}
                        className="rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                        My Fleet
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
                <section className="relative overflow-hidden rounded-3xl border border-cyan-900/70 bg-gradient-to-br from-[#241034] via-[#171027] to-[#092b35] p-6 sm:p-10">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
                    <div className="relative max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-800 bg-cyan-950/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                            <Compass size={14} />
                            Your first commute, made simpler
                        </div>
                        <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
                            New to campus transport?
                            <span className="mt-1 block text-cyan-300">
                                Start here.
                            </span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                            Learn how to explore buses, understand route information,
                            save your regular buses, and make a more informed commute
                            plan.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => document.getElementById("bus-finder")?.scrollIntoView({ behavior: "smooth" })}
                                className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                            >
                                Find a bus
                            </button>
                            <button
                                type="button"
                                onClick={() => document.getElementById("getting-started")?.scrollIntoView({ behavior: "smooth" })}
                                className="rounded-xl border border-slate-600 bg-slate-950/30 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900"
                            >
                                How it works
                            </button>
                        </div>
                    </div>
                </section>

                <section id="getting-started" className="mt-10 scroll-mt-24">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-950 p-3 text-cyan-300">
                            <RouteIcon size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white sm:text-2xl">Getting started</h2>
                            <p className="mt-1 text-sm text-slate-400">Four simple steps to use Smart Commute.</p>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step) => (
                            <article key={step.number} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                                <p className="text-sm font-bold tracking-widest text-cyan-400">{step.number}</p>
                                <h3 className="mt-3 font-semibold text-white">{step.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-950 p-3 text-cyan-300">
                            <MapPin size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white sm:text-2xl">How to choose a suitable route</h2>
                            <p className="mt-1 text-sm text-slate-400">Use the information available, then verify real-world details.</p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                            <h3 className="font-semibold text-white">1. Start with your pickup area</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">Search for your neighbourhood or a nearby area listed under a bus route.</p>
                        </article>
                        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                            <h3 className="font-semibold text-white">2. Compare route details</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">Check the route name, listed route points, direction, and displayed bus status.</p>
                        </article>
                        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                            <h3 className="font-semibold text-white">3. Confirm before travelling</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-400">Confirm the official pickup location, departure time, and availability with the college transport office.</p>
                        </article>
                    </div>
                </section>

                <section id="bus-finder" className="mt-10 scroll-mt-24">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-950 p-3 text-cyan-300">
                            <BusFront size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white sm:text-2xl">Explore buses</h2>
                            <p className="mt-1 text-sm text-slate-400">Search by bus ID, route, area, or listed route point.</p>
                        </div>
                    </div>
                    <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 focus-within:border-cyan-500">
                        <Search size={19} className="shrink-0 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Try Kelambakkam, Medavakkam, Airport..."
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                        />
                    </label>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {recommendations.map((bus) => (
                            <article key={bus.id} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bus #{bus.id}</p>
                                        <h3 className="mt-1 text-lg font-bold text-white">{bus.routeName}</h3>
                                        <p className="mt-1 text-sm text-slate-400">{bus.registrationNumber}</p>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        bus.status === "Live"
                                            ? "bg-emerald-950 text-emerald-300"
                                            : bus.status === "Stale"
                                                ? "bg-amber-950 text-amber-300"
                                                : "bg-slate-800 text-slate-300"
                                    }`}>
                                        {bus.status}
                                    </span>
                                </div>
                                <p className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                                    <MapPin size={15} className="text-cyan-400" />
                                    Current area: {bus.currentArea}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {(bus.route ?? []).map((stop) => (
                                        <span key={stop} className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300">{stop}</span>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/?bus=${bus.id}`)}
                                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-700 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-950"
                                >
                                    View on map
                                    <ArrowLeft size={15} className="rotate-180" />
                                </button>
                            </article>
                        ))}
                    </div>
                    {recommendations.length === 0 && (
                        <div className="mt-4 rounded-2xl border border-dashed border-slate-700 p-8 text-center">
                            <Search className="mx-auto text-slate-500" size={25} />
                            <p className="mt-3 font-semibold text-white">No matching buses</p>
                            <p className="mt-1 text-sm text-slate-400">Try a different bus ID, route, or area.</p>
                        </div>
                    )}
                </section>

                <section className="mt-10">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-950 p-3 text-cyan-300">
                            <CircleHelp size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white sm:text-2xl">Frequently asked questions</h2>
                            <p className="mt-1 text-sm text-slate-400">Quick answers for your first few trips.</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <article key={faq.question} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(isOpen ? null : index)}
                                        aria-expanded={isOpen}
                                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                                    >
                                        <span className="font-semibold text-white">{faq.question}</span>
                                        {isOpen ? <ChevronUp size={18} className="shrink-0 text-cyan-300" /> : <ChevronDown size={18} className="shrink-0 text-slate-400" />}
                                    </button>
                                    {isOpen && (
                                        <p className="px-5 pb-5 text-sm leading-6 text-slate-400">{faq.answer}</p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>

                <aside className="mt-10 flex gap-3 rounded-2xl border border-cyan-900/70 bg-cyan-950/40 p-5">
                    <ShieldCheck className="mt-0.5 shrink-0 text-cyan-300" size={22} />
                    <div>
                        <h2 className="font-semibold text-white">A quick reminder</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                            Use Smart Commute to explore the interface and available information. For actual service timings, official pickup points, and route changes, rely on verified college transport information.
                        </p>
                    </div>
                </aside>

                <footer className="pb-4 pt-8 text-center text-xs text-slate-600">
                    Smart Commute · Freshers Mode
                </footer>
            </div>
        </main>
    );
}
