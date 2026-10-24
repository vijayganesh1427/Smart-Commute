import { readFile } from "node:fs/promises";
import path from "node:path";
import { readGpsSnapshots } from "./gpsStore.js";
import { resolveCurrentArea } from "./reverseGeocodingService.js";

export type FleetStatus = "Live" | "Stale" | "Offline";
export type GpsProvider = "vamosys" | "paizogps";

export interface NormalizedBus {
    id: number;
    registrationNumber: string;
    routeName: string;
    currentArea: string;
    latitude: number;
    longitude: number;
    status: FleetStatus;
    speed: number;
    direction: string;
    heading: number | null;
    lastUpdated: string;
    lastSeen: string | null;
    isAC: boolean;
    route: string[];
    provider: GpsProvider;
}

interface BusConfig {
    busId: number;
    provider: GpsProvider;
    registrationNumber: string;
    routeName: string;
    isAC: boolean;
    route: string[];
}

interface ProviderSnapshot {
    payload: unknown;
    lastSuccessfulFetchAt: string;
}

const busesPath = path.resolve(
    process.cwd(),
    "src/config/buses.json"
);

const LIVE_WINDOW_MS = 2 * 60 * 1000;
const STALE_WINDOW_MS = 15 * 60 * 1000;

function finiteNumber(value: unknown): number | null {
    if (
        (typeof value !== "number" && typeof value !== "string") ||
        String(value).trim() === ""
    ) {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function parseProviderDate(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) {
        // Epoch seconds or milliseconds.
        return value > 10_000_000_000 ? value : value * 1000;
    }

    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    // Common provider format: DD-MM-YYYY HH:mm:ss
    const match = value.match(
        /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/
    );

    if (match) {
        const [, dd, mm, yyyy, hh, min, ss] = match;

        const date = new Date(
            Number(yyyy),
            Number(mm) - 1,
            Number(dd),
            Number(hh),
            Number(min),
            Number(ss)
        );

        return Number.isFinite(date.getTime())
            ? date.getTime()
            : null;
    }

    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function statusFromTimestamp(
    timestamp: number | null,
    now = Date.now()
): FleetStatus {
    if (timestamp === null) return "Offline";

    const age = now - timestamp;

    if (age < 0) return "Stale";
    if (age <= LIVE_WINDOW_MS) return "Live";
    if (age <= STALE_WINDOW_MS) return "Stale";

    return "Offline";
}

function ageLabel(timestamp: number | null, now = Date.now()): string {
    if (timestamp === null) return "Unknown";

    const seconds = Math.max(
        0,
        Math.floor((now - timestamp) / 1000)
    );

    if (seconds < 60) return `${seconds} sec ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    return `${Math.floor(hours / 24)} day(s) ago`;
}

function normalize(
    config: BusConfig,
    snapshot: ProviderSnapshot,
    now = Date.now()
): NormalizedBus {
    const payload = snapshot.payload as Record<string, any>;

    let latitude: number | null;
    let longitude: number | null;
    let speed: number | null;
    let timestamp: number | null;
    let heading: number | null;
    let providerRegistration = "";

    if (config.provider === "vamosys") {
        if (
            payload?.response !== "Success" ||
            !Array.isArray(payload.data) ||
            !payload.data[0]
        ) {
            throw new Error("Invalid Vamosys payload");
        }

        const item = payload.data[0];

        latitude = finiteNumber(item.latitude ?? item.lat);
        longitude = finiteNumber(item.longitude ?? item.lng);
        speed = finiteNumber(item.speed);

        timestamp = parseProviderDate(
            item.date ??
            item.lastComunicationTime ??
            item.lastSeen
        );

        providerRegistration = String(
            item.regNo ?? item.vehicleId ?? ""
        );

        const compass: Record<string, number> = {
            N: 0, NE: 45, E: 90, SE: 135,
            S: 180, SW: 225, W: 270, NW: 315,
        };

        heading =
            compass[String(item.direction ?? "").toUpperCase()] ?? null;
    } else {
        if (payload?.type !== "Success") {
            throw new Error("Invalid PaizoGPS payload");
        }

        latitude = finiteNumber(payload.lat);
        longitude = finiteNumber(payload.lng);
        speed = finiteNumber(payload.speed);
        timestamp = parseProviderDate(payload.dt_tracker);
        heading = finiteNumber(payload.angle);
        providerRegistration = String(payload.plate_number ?? "");
    }

    if (
        latitude === null ||
        longitude === null ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error("Invalid GPS coordinates");
    }

    const safeTimestamp =
        timestamp !== null && timestamp <= now + 5 * 60 * 1000
            ? timestamp
            : null;

    const status = statusFromTimestamp(safeTimestamp, now);

    return {
        id: config.busId,
        registrationNumber:
            config.registrationNumber ||
            providerRegistration ||
            `Bus ${config.busId}`,
        routeName: config.routeName,
        currentArea: "Unknown",
        latitude,
        longitude,
        status,
        speed: speed !== null && speed >= 0 && status !== "Offline"
            ? speed
            : 0,
        direction: "Unknown",
        heading,
        lastUpdated: ageLabel(safeTimestamp, now),
        lastSeen:
            safeTimestamp === null
                ? null
                : new Date(safeTimestamp).toISOString(),
        isAC: config.isAC,
        route: config.route,
        provider: config.provider,
    };
}

export async function getFleet(): Promise<NormalizedBus[]> {
    const raw = await readFile(busesPath, "utf8");
    const configs = JSON.parse(raw) as BusConfig[];
    const snapshots = await readGpsSnapshots();

    const buses: NormalizedBus[] = [];

    for (const config of configs) {
        const snapshot = snapshots[String(config.busId)];

        // No GPS snapshot yet: omit this bus until its first successful fetch.
        if (!snapshot) continue;

        try {
            const bus = normalize(config, snapshot);

            bus.currentArea = await resolveCurrentArea(
                bus.id,
                bus.latitude,
                bus.longitude,
                "Unknown"
            );

            buses.push(bus);
        } catch (error) {
            console.error(
                `[fleet] Bus ${config.busId}:`,
                error instanceof Error ? error.message : error
            );
        }
    }

    return buses.sort((a, b) => a.id - b.id);
}

export async function getBusById(
    busId: number
): Promise<NormalizedBus | undefined> {
    const fleet = await getFleet();
    return fleet.find((bus) => bus.id === busId);
}
