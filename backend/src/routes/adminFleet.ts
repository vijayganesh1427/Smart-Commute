import { Router } from "express";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { requireAdmin } from "../middleware/requireAdmin";
import { getTrackingUrl, removeTrackingUrl, setTrackingUrl, type GpsProvider } from "../services/trackingUrlStore";

const router = Router();
type Provider = GpsProvider;
interface BusConfig {
    busId: number;
    provider: Provider;
    registrationNumber: string;
    routeName: string;
    isAC: boolean;
    route: string[];
}
interface BusConfigWithLegacyFields extends BusConfig {
    currentArea?: string;
    direction?: string;
    trackingUrl?: string;
}

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const busesPath = resolve(currentDirectory, "../config/buses.json");
const tempPath = `${busesPath}.admin.tmp`;

async function writeBuses(buses: BusConfig[]): Promise<void> {
    await mkdir(dirname(busesPath), { recursive: true });
    await writeFile(tempPath, `${JSON.stringify(buses, null, 2)}\n`, "utf8");
    await rename(tempPath, busesPath);
}

/** Remove legacy fields from buses.json and migrate any legacy URLs to .env. */
async function readBuses(): Promise<BusConfig[]> {
    const parsed: unknown = JSON.parse(await readFile(busesPath, "utf8"));
    if (!Array.isArray(parsed)) throw new Error("buses.json must contain an array.");
    let changed = false;
    const buses: BusConfig[] = [];
    for (const item of parsed as BusConfigWithLegacyFields[]) {
        if (!item || !Number.isInteger(item.busId)) throw new Error("buses.json contains an invalid bus entry.");
        if (item.trackingUrl && !await getTrackingUrl(item.provider, item.busId)) {
            await setTrackingUrl(item.provider, item.busId, item.trackingUrl);
            changed = true;
        }
        if ("trackingUrl" in item || "currentArea" in item || "direction" in item) changed = true;
        const clean = { ...item };
        delete clean.trackingUrl;
        delete clean.currentArea;
        delete clean.direction;
        buses.push(clean);
    }
    if (changed) await writeBuses(buses);
    return buses;
}

function validTrackingUrl(provider: Provider, raw: unknown): raw is string {
    if (typeof raw !== "string") return false;
    try {
        const url = new URL(raw);
        if (url.protocol !== "https:") return false;
        const host = url.hostname.toLowerCase();
        return provider === "vamosys" ? host.includes("vamosys") : host.includes("paizogps") || host.includes("paizo");
    } catch { return false; }
}

function validate(body: any): string | null {
    if (!body || !Number.isInteger(Number(body.busId)) || Number(body.busId) <= 0) return "busId must be a positive integer.";
    if (!["vamosys", "paizogps"].includes(body.provider)) return "provider must be vamosys or paizogps.";
    if (typeof body.registrationNumber !== "string" || !body.registrationNumber.trim()) return "registrationNumber is required.";
    if (typeof body.routeName !== "string" || !body.routeName.trim()) return "routeName is required.";
    if (typeof body.isAC !== "boolean") return "isAC must be boolean.";
    if (!Array.isArray(body.route) || !body.route.length || !body.route.every((stop: unknown) => typeof stop === "string" && stop.trim())) return "route must contain at least one stop.";
    if (!validTrackingUrl(body.provider, body.trackingUrl)) return "Provide an HTTPS tracking URL matching the selected provider.";
    return null;
}

router.get("/", requireAdmin, async (_req, res) => {
    try {
        const buses = await readBuses();
        const result = await Promise.all(buses.map(async (bus) => ({
            ...bus,
            trackingUrl: await getTrackingUrl(bus.provider, bus.busId),
        })));
        return res.json(result);
    } catch (error) {
        console.error("Admin fleet read failed", error);
        return res.status(500).json({ message: "Could not read fleet configuration." });
    }
});

router.put("/:busId", requireAdmin, async (req, res) => {
    const busId = Number(req.params.busId);
    if (!Number.isInteger(busId) || busId <= 0) return res.status(400).json({ message: "Invalid bus ID." });
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });

    try {
        const buses = await readBuses();
        const index = buses.findIndex((bus) => bus.busId === busId);
        if (index < 0) return res.status(404).json({ message: "Bus is not in buses.json. Use the add-request approval workflow for new buses." });
        const body = req.body;
        const newBusId = Number(body.busId);
        if (newBusId !== busId && buses.some((bus) => bus.busId === newBusId)) {
            return res.status(409).json({ message: `Bus ID ${newBusId} is already in use.` });
        }
        const previous = buses[index];
        const updated: BusConfig = {
            ...previous,
            busId: newBusId,
            provider: body.provider,
            registrationNumber: body.registrationNumber.trim(),
            routeName: body.routeName.trim(),
            isAC: body.isAC,
            route: body.route.map((stop: string) => stop.trim()),
        };
        // Store the URL under the new ID first; then remove the old key if the ID changed.
        await setTrackingUrl(updated.provider, newBusId, body.trackingUrl);
        buses[index] = updated;
        await writeBuses(buses);
        if (newBusId !== busId) await removeTrackingUrl(busId);
        return res.json({ ...updated, trackingUrl: await getTrackingUrl(updated.provider, newBusId) });
    } catch (error) {
        console.error("Admin fleet update failed", error);
        return res.status(500).json({ message: "Could not update bus configuration." });
    }
});

router.delete("/:busId", requireAdmin, async (req, res) => {
    const busId = Number(req.params.busId);
    if (!Number.isInteger(busId) || busId <= 0) return res.status(400).json({ message: "Invalid bus ID." });
    try {
        const buses = await readBuses();
        const remaining = buses.filter((bus) => bus.busId !== busId);
        if (remaining.length === buses.length) return res.status(404).json({ message: "Bus not found." });
        await writeBuses(remaining);
        await removeTrackingUrl(busId);
        return res.json({ message: `Bus ${busId} deleted.`, busId });
    } catch (error) {
        console.error("Admin fleet delete failed", error);
        return res.status(500).json({ message: "Could not delete bus configuration." });
    }
});

export default router;
