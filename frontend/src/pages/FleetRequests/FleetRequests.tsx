import { FormEvent, useState } from "react";
import { submitAdminRequest } from "../../services/adminRequestService";
import type { Bus } from "../../types/bus";

type Props = { fleet: Bus[] };
const input = "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-400";
const label = "mb-1.5 block text-sm font-medium text-zinc-300";

export default function FleetRequests({ fleet }: Props) {
  const [kind, setKind] = useState<"add" | "edit">("add");
  const [busId, setBusId] = useState("");
  const [routeName, setRouteName] = useState("");
  const [gpsLink, setGpsLink] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function selectBus(id: string) {
    setBusId(id);
    const bus = fleet.find((item) => String(item.id) === id);
    if (bus) setRouteName(bus.routeName ?? "");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const request = await submitAdminRequest({
        kind, busId: Number(busId), routeName: routeName.trim(),
        gpsLink: gpsLink.trim(), reason: reason.trim(),
      } as never);
      setMessage(`Submitted! Request reference: ${request.id}`);
      setGpsLink(""); setReason("");
      if (kind === "add") { setBusId(""); setRouteName(""); }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request submission failed.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-8">
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">VITC Smart Commute</p>
      <h1 className="mt-2 text-3xl font-bold">Fleet change request</h1>
      <p className="mt-2 mb-6 text-sm text-zinc-400">Submit the basic details. The administrator verifies the link and completes the remaining fleet configuration.</p>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-7">
        <div><label className={label}>Request type</label><div className="grid grid-cols-2 gap-2">
          {(["add", "edit"] as const).map(value => <button key={value} type="button" onClick={() => { setKind(value); setMessage(""); if (value === "add") { setBusId(""); setRouteName(""); } }} className={`rounded-xl border px-4 py-3 font-semibold ${kind === value ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}`}>{value === "add" ? "Add bus" : "Edit bus"}</button>)}
        </div></div>
        {kind === "edit" && <div><label className={label}>Select existing bus</label><select className={input} value={busId} required onChange={e => selectBus(e.target.value)}><option value="">Choose bus…</option>{fleet.map(bus => <option key={bus.id} value={bus.id}>Bus {bus.id} · {bus.registrationNumber} · {bus.routeName}</option>)}</select></div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Bus ID</label><input className={input} type="number" min="1" step="1" required value={busId} onChange={e => setBusId(e.target.value)} placeholder="e.g. 101"/></div>
          <div><label className={label}>Route name</label><input className={input} required maxLength={120} value={routeName} onChange={e => setRouteName(e.target.value)} placeholder="e.g. Tambaram"/></div>
        </div>
        <div><label className={label}>GPS tracking URL</label><input className={input} type="url" required value={gpsLink} onChange={e => setGpsLink(e.target.value)} placeholder="https://…"/><p className="mt-1 text-xs text-zinc-500">Provider and link validity will be checked by the administrator.</p></div>
        <div><label className={label}>Reason (optional)</label><textarea className={input} rows={3} maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} placeholder="Any useful context"/></div>
        {message && <p role="status" className="rounded-xl border border-cyan-900 bg-cyan-950/40 p-3 text-sm text-cyan-200">{message}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-zinc-950 disabled:opacity-50">{busy ? "Submitting…" : "Submit request"}</button>
      </form>
    </div>
  </main>;
}
