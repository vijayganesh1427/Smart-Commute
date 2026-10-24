import { readFile } from "node:fs/promises";
import path from "node:path";
import { fetchVamosysLocation } from "../providers/vamosysAdapter.js";
import { fetchPaizoGpsLocation } from "../providers/paizogpsAdapter.js";
import { saveGpsSnapshot } from "./gpsStore.js";
import { getTrackingUrl } from "./trackingUrlStore.js";

export type GpsProvider = "vamosys" | "paizogps";

interface BusConfig {
    busId: number;
    provider: GpsProvider;
}

const busesPath = path.resolve(
    process.cwd(),
    "src/config/buses.json"
);

async function getBusConfig(busId: number): Promise<BusConfig> {
    const raw = await readFile(busesPath, "utf8");
    const buses = JSON.parse(raw) as BusConfig[];

    const bus = buses.find((item) => item.busId === busId);

    if (!bus) {
        throw new Error(`Bus ${busId} is not configured in buses.json`);
    }

    return bus;
}

function validateCoordinates(latitude: unknown, longitude: unknown) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
        latitude == null ||
        longitude == null ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
    ) {
        throw new Error("Provider returned invalid coordinates");
    }

    return { latitude: lat, longitude: lng };
}

export async function refreshVamosysBus(busId: number) {
    const config = await getBusConfig(busId);

    if (config.provider !== "vamosys") {
        throw new Error(`Bus ${busId} is not configured for Vamosys`);
    }

    const trackingUrl = await getTrackingUrl("vamosys", busId);

    if (!trackingUrl) {
        throw new Error(
            `Missing VAMOSYS_BUS_${busId}_TRACKING_URL`
        );
    }

    const payload = await fetchVamosysLocation(trackingUrl);
    const vehicle = payload.data?.[0];

    if (!vehicle) {
        throw new Error("Vamosys returned no vehicle data");
    }

    const coordinates = validateCoordinates(
        vehicle.latitude,
        vehicle.longitude
    );

    await saveGpsSnapshot(busId, payload);

    return {
        busId,
        provider: "vamosys" as const,
        updated: true,
        ...coordinates,
        providerTimestamp:
            vehicle.date ??
            vehicle.lastComunicationTime ??
            vehicle.lastSeen ??
            null,
    };
}

export async function refreshPaizoGpsBus(busId: number) {
    const config = await getBusConfig(busId);

    if (config.provider !== "paizogps") {
        throw new Error(`Bus ${busId} is not configured for PaizoGPS`);
    }

    const trackingUrl = await getTrackingUrl("paizogps", busId);

    if (!trackingUrl) {
        throw new Error(
            `Missing PAIZOGPS_BUS_${busId}_TRACKING_URL`
        );
    }

    const payload = await fetchPaizoGpsLocation(trackingUrl);
    const coordinates = validateCoordinates(payload.lat, payload.lng);

    await saveGpsSnapshot(busId, payload);

    return {
        busId,
        provider: "paizogps" as const,
        updated: true,
        ...coordinates,
        providerTimestamp: payload.dt_tracker ?? null,
    };
}
