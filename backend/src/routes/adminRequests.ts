import { Router } from "express";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { requireAdmin } from "../middleware/requireAdmin";
import { setTrackingUrl } from "../services/trackingUrlStore";

const router = Router();

type RequestKind = "add" | "edit" | "remove";
type RequestStatus = "pending" | "approved" | "rejected" | "archived";
type GpsProvider = "vamosys" | "paizogps";

interface AdminRequest {
    id: string;
    kind: RequestKind;
    status: RequestStatus;
    busId: number;
    registrationNumber?: string;
    routeName: string;
    provider?: GpsProvider;
    gpsLink: string;
    isAC?: boolean;
    route?: string[];
    reason: string;
    submittedAt: string;
    reviewedAt?: string;
    reviewNote?: string;
}

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(currentDirectory, "../data/adminRequests.json");
const TEMP_FILE = `${DATA_FILE}.tmp`;
const BUSES_FILE = resolve(currentDirectory, "../config/buses.json");
const BUSES_TEMP_FILE = `${BUSES_FILE}.admin.tmp`;

async function readRequests(): Promise<AdminRequest[]> {
    try {
        const content = await readFile(DATA_FILE, "utf8");
        const parsed: unknown = JSON.parse(content);
        if (!Array.isArray(parsed)) throw new Error("Admin request data must be an array.");
        return parsed as AdminRequest[];
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        await mkdir(dirname(DATA_FILE), { recursive: true });
        await writeFile(DATA_FILE, "[]\n", "utf8");
        return [];
    }
}

let writeQueue: Promise<void> = Promise.resolve();

async function writeRequests(requests: AdminRequest[]): Promise<void> {
    const operation = writeQueue.then(async () => {
        await mkdir(dirname(DATA_FILE), { recursive: true });
        await writeFile(TEMP_FILE, JSON.stringify(requests, null, 2), "utf8");
        await rename(TEMP_FILE, DATA_FILE);
    });
    writeQueue = operation.catch(() => undefined);
    await operation;
}

function validGpsLink(provider: GpsProvider, rawLink: string): boolean {
    try {
        const url = new URL(rawLink);
        if (url.protocol !== "https:") return false;
        const host = url.hostname.toLowerCase();
        // Validate secure URLs and provider host names only. This does not
        // prove that a link is accessible or that credentials are valid.
        if (provider === "vamosys") return host.includes("vamosys");
        return host.includes("paizogps") || host.includes("paizo");
    } catch {
        return false;
    }
}

function validateBody(body: any): string | null {
    if (!body || !["add", "edit"].includes(body.kind)) return "kind must be add or edit.";
    if (!Number.isInteger(body.busId) || body.busId <= 0) return "busId must be a positive integer.";
    if (typeof body.routeName !== "string" || !body.routeName.trim()) return "routeName is required.";
    if (typeof body.gpsLink !== "string") return "gpsLink is required.";
    try { const url = new URL(body.gpsLink); if (url.protocol !== "https:") return "GPS link must use HTTPS."; }
    catch { return "Provide a valid GPS tracking URL."; }
    if (body.reason !== undefined && typeof body.reason !== "string") return "reason must be text.";
    return null;
}

// Public endpoint: students can submit requests, but cannot alter the live fleet.
router.post("/", async (req, res) => {
    const error = validateBody(req.body);
    if (error) return res.status(400).json({ message: error });

    try {
        const requests = await readRequests();
        const body = req.body;
        const request: AdminRequest = {
            id: randomUUID(),
            kind: body.kind,
            status: "pending",
            busId: body.busId,
            registrationNumber: typeof body.registrationNumber === "string" ? body.registrationNumber.trim() : undefined,
            routeName: body.routeName.trim(),
            provider: body.provider,
            gpsLink: body.gpsLink.trim(),
            isAC: typeof body.isAC === "boolean" ? body.isAC : undefined,
            route: Array.isArray(body.route) ? body.route.filter((stop: unknown) => typeof stop === "string").map((stop: string) => stop.trim()) : undefined,
            reason: typeof body.reason === "string" ? body.reason.trim() : "",
            submittedAt: new Date().toISOString(),
        };
        await writeRequests([request, ...requests]);
        return res.status(201).json(request);
    } catch (error) {
        console.error("Could not save admin request:", error);
        return res.status(500).json({ message: "Could not save the request." });
    }
});

// Admin-only list and decisions.
router.get("/", requireAdmin, async (_req, res) => {
    try {
        return res.json(await readRequests());
    } catch (error) {
        console.error("Could not read admin requests:", error);
        return res.status(500).json({ message: "Could not load requests." });
    }
});

async function applyRequestToFleet(request: AdminRequest): Promise<void> {
    let provider: GpsProvider;
    try {
        const url = new URL(request.gpsLink);
        const host = url.hostname.toLowerCase();
        if (host.includes("vamosys")) provider = "vamosys";
        else if (host.includes("paizogps") || host.includes("paizo")) provider = "paizogps";
        else throw new Error("GPS URL must belong to Vamosys or PaizoGPS before approval.");
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Invalid GPS URL.");
    }
    if (!validGpsLink(provider, request.gpsLink)) {
        throw new Error("GPS URL is not valid for the detected provider.");
    }

    let buses: any[];
    try {
        const raw = await readFile(BUSES_FILE, "utf8");
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("buses.json must contain an array.");
        buses = parsed as any[];
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Could not read buses.json.");
    }

    const index = buses.findIndex((bus) => Number(bus.busId) === request.busId);
    if (request.kind === "add") {
        if (index >= 0) throw new Error(`Bus ${request.busId} already exists. Submit an edit request instead.`);
        // The student form intentionally collects only minimal details. Admin can complete
        // registration, AC status, and route stops in All buses after approval.
        buses.push({
            busId: request.busId,
            provider,
            registrationNumber: request.registrationNumber?.trim() || `PENDING-${request.busId}`,
            routeName: request.routeName.trim(),
            isAC: request.isAC ?? false,
            route: request.route?.length ? request.route : [request.routeName.trim()],
        });
    } else {
        if (index < 0) throw new Error(`Bus ${request.busId} does not exist. Submit an add request instead.`);
        buses[index] = {
            ...buses[index],
            provider,
            registrationNumber: request.registrationNumber?.trim() || buses[index].registrationNumber,
            routeName: request.routeName.trim(),
            isAC: typeof request.isAC === "boolean" ? request.isAC : buses[index].isAC,
            route: request.route?.length ? request.route : buses[index].route,
        };
    }

    // Persist the provider URL in .env and update process.env immediately so the running scheduler sees it.
    await setTrackingUrl(provider, request.busId, request.gpsLink);

    // Keep buses.json limited to fleet metadata; never store GPS URLs or transient area/direction fields here.
    buses.forEach((bus) => {
        delete bus.trackingUrl;
        delete bus.currentArea;
        delete bus.direction;
    });
    await mkdir(dirname(BUSES_FILE), { recursive: true });
    await writeFile(BUSES_TEMP_FILE, JSON.stringify(buses, null, 2) + "\n", "utf8");
    await rename(BUSES_TEMP_FILE, BUSES_FILE);
}

router.patch("/:id/review", requireAdmin, async (req, res) => {
    const { decision, reviewNote } = req.body ?? {};
    if (!["approved", "rejected", "archived"].includes(decision)) {
        return res.status(400).json({ message: "decision must be approved, rejected, or archived." });
    }

    try {
        const requests = await readRequests();
        const index = requests.findIndex((item) => item.id === req.params.id);
        if (index < 0) return res.status(404).json({ message: "Request not found." });

        const current = requests[index];
        if (current.status !== "pending" && decision !== "archived") {
            return res.status(409).json({ message: "Only pending requests can be approved or rejected." });
        }

        if (decision === "approved") {
            try {
                await applyRequestToFleet(current);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Could not apply request to fleet.";
                return res.status(400).json({ message });
            }
        }

        const updated: AdminRequest = {
            ...current,
            status: decision,
            reviewedAt: new Date().toISOString(),
            reviewNote: typeof reviewNote === "string" ? reviewNote.trim().slice(0, 500) : "",
        };
        requests[index] = updated;
        await writeRequests(requests);
        return res.json(updated);
    } catch (error) {
        console.error("Could not review admin request:", error);
        return res.status(500).json({ message: "Could not update request status." });
    }
});

export default router;
