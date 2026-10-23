import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getAdminRequests,
    reviewAdminRequest,
} from "../../services/adminRequestService";
import type { AdminRequest, AdminRequestStatus } from "../../types/adminRequest";
import { getAdminFleet, updateAdminBus, type BusConfigRecord } from "../../services/adminFleetService";

const KEY_STORAGE = "smart-commute-admin-key";

const statusClass: Record<AdminRequestStatus, string> = {
    pending: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    rejected: "border-rose-500/40 bg-rose-500/10 text-rose-200",
    archived: "border-zinc-600 bg-zinc-800 text-zinc-300",
};

export default function AdminFleet() {
    const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) ?? "");
    const [keyDraft, setKeyDraft] = useState(() => sessionStorage.getItem(KEY_STORAGE) ?? "");
    const [requests, setRequests] = useState<AdminRequest[]>([]);
    const [filter, setFilter] = useState<"pending" | "all">("pending");
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [section, setSection] = useState<"requests" | "buses">("requests");
    const [buses, setBuses] = useState<BusConfigRecord[]>([]);
    const [selectedBusId, setSelectedBusId] = useState("");
    const [busForm, setBusForm] = useState<BusConfigRecord | null>(null);
    const [busBusy, setBusBusy] = useState(false);

    const loadBuses = useCallback(async (key: string) => {
        setBusBusy(true);
        setError("");
        try {
            const data = await getAdminFleet(key);
            setBuses(data);
            if (data.length) {
                const chosen = data.find((bus) => String(bus.busId) === selectedBusId) ?? data[0];
                setSelectedBusId(String(chosen.busId));
                setBusForm(chosen);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not load bus configuration.");
        } finally { setBusBusy(false); }
    }, [selectedBusId]);

    async function saveBus(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!busForm) return;
        setBusBusy(true); setError(""); setNotice("");
        try {
            const saved = await updateAdminBus(adminKey, busForm.busId, {
                provider: busForm.provider,
                registrationNumber: busForm.registrationNumber,
                routeName: busForm.routeName,
                currentArea: busForm.currentArea,
                direction: busForm.direction,
                isAC: busForm.isAC,
                route: busForm.route,
                trackingUrl: busForm.trackingUrl,
            });
            setBuses((previous) => previous.map((bus) => bus.busId === saved.busId ? saved : bus));
            setBusForm(saved);
            setNotice(`Bus ${saved.busId} configuration saved.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not save bus configuration.");
        } finally { setBusBusy(false); }
    }
    const load = useCallback(async (key: string) => {
        setLoading(true);
        setError("");
        try {
            const data = await getAdminRequests(key);
            setRequests(data);
            setAdminKey(key);
            sessionStorage.setItem(KEY_STORAGE, key);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load admin requests.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const saved = sessionStorage.getItem(KEY_STORAGE);
        if (saved) void load(saved);
    }, [load]);

    const visibleRequests = useMemo(() => {
        const sorted = [...requests].sort(
            (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
        );
        return filter === "pending" ? sorted.filter((item) => item.status === "pending") : sorted;
    }, [requests, filter]);

    async function decide(
        request: AdminRequest,
        decision: "approved" | "rejected" | "archived",
    ) {
        const note = window.prompt(
            decision === "approved" ? "Optional approval note:" : "Add a note for the audit trail (optional):",
            "",
        );
        if (note === null) return;
        setBusyId(request.id);
        setError("");
        setNotice("");
        try {
            const updated = await reviewAdminRequest(request.id, adminKey, decision, note);
            setRequests((previous) => previous.map((item) => item.id === updated.id ? updated : item));
            setNotice(`Request ${decision}.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update the request.");
        } finally {
            setBusyId(null);
        }
    }

    function signOut() {
        sessionStorage.removeItem(KEY_STORAGE);
        setAdminKey("");
        setKeyDraft("");
        setRequests([]);
        setNotice("");
        setError("");
    }

    return (
        <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">VITC Smart Commute</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight">Admin Fleet Management</h1>
                        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                            Review student-submitted bus changes. Decisions here update the request queue;
                            live fleet provisioning still requires a valid GPS-provider configuration.
                        </p>
                    </div>
                    {adminKey && (
                        <button onClick={signOut} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900">
                            Sign out
                        </button>
                    )}
                </div>

                {!adminKey ? (
                    <form
                        className="max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void load(keyDraft.trim());
                        }}
                    >
                        <h2 className="text-lg font-semibold">Administrator access</h2>
                        <p className="mt-1 text-sm text-zinc-400">Enter the backend ADMIN_API_KEY. It is kept in this browser tab only.</p>
                        <label className="mt-5 block text-sm font-medium" htmlFor="admin-key">Admin key</label>
                        <input
                            id="admin-key"
                            type="password"
                            autoComplete="current-password"
                            value={keyDraft}
                            onChange={(event) => setKeyDraft(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-cyan-400"
                            required
                        />
                        <button disabled={loading} className="mt-4 rounded-xl bg-cyan-400 px-4 py-2 font-bold text-zinc-950 disabled:opacity-50">
                            {loading ? "Checking…" : "Open admin dashboard"}
                        </button>
                    </form>
                ) : (
                    <>
                        {section === "requests" ? <>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex gap-2">
                                <button onClick={() => setFilter("pending")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${filter === "pending" ? "bg-cyan-400 text-zinc-950" : "border border-zinc-700 text-zinc-300"}`}>
                                    Pending ({requests.filter((item) => item.status === "pending").length})
                                </button>
                                <button onClick={() => setFilter("all")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${filter === "all" ? "bg-cyan-400 text-zinc-950" : "border border-zinc-700 text-zinc-300"}`}>
                                    All requests
                                </button>
                                <button onClick={() => { setSection("buses"); if (!buses.length) void loadBuses(adminKey); }} className={`rounded-xl px-4 py-2 text-sm font-semibold ${section === "buses" ? "bg-cyan-400 text-zinc-950" : "border border-zinc-700 text-zinc-300"}`}>
                                    All buses
                                </button>
                            </div>
                            <button onClick={() => void load(adminKey)} disabled={loading} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900 disabled:opacity-50">
                                {loading ? "Refreshing…" : "Refresh"}
                            </button>
                        </div>

                        {visibleRequests.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-zinc-700 px-6 py-14 text-center">
                                <p className="text-lg font-semibold">No requests here</p>
                                <p className="mt-1 text-sm text-zinc-400">New student requests will appear here when submitted.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {visibleRequests.map((request) => (
                                    <article key={request.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-lg font-bold">Bus {request.busId} · {request.routeName}</h2>
                                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusClass[request.status]}`}>{request.status}</span>
                                                    <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs uppercase text-zinc-300">{request.kind} request</span>
                                                </div>
                                                <p className="mt-1 text-sm text-zinc-400">{request.registrationNumber ?? "Details pending"} · {request.provider ?? "Provider pending"} · {request.isAC == null ? "AC status pending" : request.isAC ? "AC" : "Non-AC"}</p>
                                            </div>
                                            <p className="text-xs text-zinc-500">{new Date(request.submittedAt).toLocaleString()}</p>
                                        </div>
                                        <p className="mt-4 text-sm"><span className="font-semibold text-zinc-300">Reason: </span>{request.reason}</p>
                                        <p className="mt-2 text-sm"><span className="font-semibold text-zinc-300">Stops: </span>{request.route?.join(" → ") || "Route stops to be configured by admin"}</p>
                                        <p className="mt-2 break-all text-sm">
                                            <span className="font-semibold text-zinc-300">GPS link: </span>
                                            <a href={request.gpsLink} target="_blank" rel="noreferrer" className="text-cyan-300 underline underline-offset-2">{request.gpsLink}</a>
                                        </p>
                                        {request.reviewNote && <p className="mt-3 rounded-xl bg-zinc-950 p-3 text-sm text-zinc-300">Review note: {request.reviewNote}</p>}
                                        {request.status === "pending" ? (
                                            <div className="mt-5 flex flex-wrap gap-2">
                                                <button disabled={busyId === request.id} onClick={() => void decide(request, "approved")} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-zinc-950 disabled:opacity-50">Approve request</button>
                                                <button disabled={busyId === request.id} onClick={() => void decide(request, "rejected")} className="rounded-xl border border-rose-500/60 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-950/40 disabled:opacity-50">Reject</button>
                                            </div>
                                        ) : request.status !== "archived" ? (
                                            <div className="mt-5">
                                                <button disabled={busyId === request.id} onClick={() => void decide(request, "archived")} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50">Archive request</button>
                                            </div>
                                        ) : null}
                                    </article>
                                ))}
                            </div>
                        )}
                        </> : <section className="space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">All configured buses</h2><p className="text-sm text-zinc-400">Edit the authoritative bus configuration here.</p></div><button onClick={() => void loadBuses(adminKey)} disabled={busBusy} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900">{busBusy ? "Loading…" : "Refresh buses"}</button></div>
                            {buses.length === 0 ? <p className="rounded-xl border border-zinc-800 p-5 text-zinc-400">No configured buses loaded. Click Refresh buses.</p> : <form onSubmit={saveBus} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
                                <div><label className="mb-1 block text-sm text-zinc-300">Select bus</label><select className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100" value={selectedBusId} onChange={event => { const id = event.target.value; setSelectedBusId(id); setBusForm(buses.find(bus => String(bus.busId) === id) ?? null); }}>{buses.map(bus => <option key={bus.busId} value={bus.busId}>Bus {bus.busId} · {bus.registrationNumber} · {bus.routeName}</option>)}</select></div>
                                {busForm && <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                    <div><label className="mb-1 block text-sm text-zinc-300">Bus ID</label><input readOnly value={busForm.busId} className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-400"/></div>
                                    <div><label className="mb-1 block text-sm text-zinc-300">Registration number</label><input required value={busForm.registrationNumber} onChange={e => setBusForm({...busForm,registrationNumber:e.target.value})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"/></div>
                                    <div><label className="mb-1 block text-sm text-zinc-300">Route name</label><input required value={busForm.routeName} onChange={e => setBusForm({...busForm,routeName:e.target.value})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"/></div>
                                    <div><label className="mb-1 block text-sm text-zinc-300">GPS provider</label><select value={busForm.provider} onChange={e => setBusForm({...busForm,provider:e.target.value as BusConfigRecord["provider"]})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"><option value="vamosys">Vamosys</option><option value="paizogps">PaizoGPS</option></select></div>
                                    <div><label className="mb-1 block text-sm text-zinc-300">Current area fallback</label><input value={busForm.currentArea ?? ""} onChange={e => setBusForm({...busForm,currentArea:e.target.value})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"/></div>
                                    <div><label className="mb-1 block text-sm text-zinc-300">Direction</label><input value={busForm.direction ?? ""} onChange={e => setBusForm({...busForm,direction:e.target.value})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"/></div></div>
                                    <div><label className="mb-1 block text-sm text-zinc-300">GPS tracking URL</label><input type="url" required value={busForm.trackingUrl ?? ""} onChange={e => setBusForm({...busForm,trackingUrl:e.target.value})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"/></div>
                                    <div><label className="mb-1 block text-sm text-zinc-300">Route stops (comma-separated)</label><input required value={busForm.route.join(", ")} onChange={e => setBusForm({...busForm,route:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"/></div>
                                    <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={busForm.isAC} onChange={e => setBusForm({...busForm,isAC:e.target.checked})}/> AC bus</label>
                                    <button disabled={busBusy} className="rounded-xl bg-cyan-400 px-4 py-2 font-bold text-zinc-950 disabled:opacity-50">{busBusy ? "Saving…" : "Save bus changes"}</button>
                                </>}
                            </form>}
                        </section>}
                    </>
                )}

                {error && <p role="alert" className="mt-5 rounded-xl border border-rose-800 bg-rose-950/50 p-3 text-sm text-rose-200">{error}</p>}
                {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-800 bg-emerald-950/50 p-3 text-sm text-emerald-200">{notice}</p>}
            </div>
        </main>
    );
}
