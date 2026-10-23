import { readFile } from "node:fs/promises";
import path from "node:path";
import {
    refreshVamosysBus,
    refreshPaizoGpsBus,
    type GpsProvider,
} from "./gpsIngestionService.js";

const busesPath = path.resolve(
    process.cwd(),
    "src/config/buses.json"
);

const DEFAULT_INTERVAL_MS = 60_000;

let timer: ReturnType<typeof setInterval> | undefined;
let isRefreshing = false;

interface BusConfig {
    busId: number;
    provider: GpsProvider;
    trackingUrl?: string
}

async function getConfiguredBuses(): Promise<BusConfig[]> {
    const raw = await readFile(busesPath, "utf8");
    const buses = JSON.parse(raw) as BusConfig[];

    return buses.filter((bus) => {
        if (bus.provider === "vamosys") {
            return Boolean(
                bus.trackingUrl || process.env[`VAMOSYS_BUS_${bus.busId}_TRACKING_URL`]
            );
        }

        if (bus.provider === "paizogps") {
            return Boolean(
                bus.trackingUrl || process.env[`PAIZOGPS_BUS_${bus.busId}_TRACKING_URL`]
            );
        }

        return false;
    });
}

export async function refreshConfiguredBuses(): Promise<void> {
    if (isRefreshing) {
        console.log("[gps] Refresh already running; skipping this cycle.");
        return;
    }

    isRefreshing = true;

    try {
        const buses = await getConfiguredBuses();

        console.log(`[gps] Refreshing ${buses.length} configured bus(es).`);

        for (const bus of buses) {
            try {
                const result =
                    bus.provider === "vamosys"
                        ? await refreshVamosysBus(bus.busId)
                        : await refreshPaizoGpsBus(bus.busId);

                console.log(`[gps] Bus ${bus.busId} refreshed:`, result);
            } catch (error) {
                console.error(
                    `[gps] Bus ${bus.busId} refresh failed:`,
                    error instanceof Error ? error.message : error
                );
            }
        }
    } catch (error) {
        console.error(
            "[gps] Could not load bus configuration:",
            error instanceof Error ? error.message : error
        );
    } finally {
        isRefreshing = false;
    }
}

export function startGpsRefreshScheduler(): void {
    if (timer) return;

    const configuredInterval = Number(
        process.env.GPS_REFRESH_INTERVAL_MS
    );

    const intervalMs =
        Number.isFinite(configuredInterval) && configuredInterval >= 10_000
            ? configuredInterval
            : DEFAULT_INTERVAL_MS;

    console.log(
        `[gps] Automatic refresh enabled: every ${intervalMs / 1000}s`
    );

    void refreshConfiguredBuses();

    timer = setInterval(() => {
        void refreshConfiguredBuses();
    }, intervalMs);
}
