
import type { LatLngExpression } from "leaflet";

export interface BusRouteResponse {
    busId: number;
    route: LatLngExpression[];
    distance: number;
    duration: number;
    remainingDistanceKm: number;
    etaMinutes: number | null;
    busStatus: "Live" | "Stale" | "Offline";
}

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// Shared route cache for the lifetime of the frontend session.
const routeCache = new Map<number, BusRouteResponse>();
const pendingRequests = new Map<number, Promise<BusRouteResponse>>();

export function getCachedBusRoute(
    busId: number
): BusRouteResponse | undefined {
    return routeCache.get(busId);
}

export async function getBusRoute(
    busId: number,
    options: { forceRefresh?: boolean } = {}
): Promise<BusRouteResponse> {
    const { forceRefresh = false } = options;

    if (!forceRefresh) {
        const cached = routeCache.get(busId);
        if (cached) return cached;

        const pending = pendingRequests.get(busId);
        if (pending) return pending;
    }

    const request = (async () => {
        const response = await fetch(
            `${API_BASE_URL}/api/buses/${busId}/route`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch route for Bus ${busId}: HTTP ${response.status}`
            );
        }

        const data = await response.json() as BusRouteResponse;

        if (!Array.isArray(data.route)) {
            throw new Error(`Invalid route response for Bus ${busId}`);
        }

        routeCache.set(busId, data);
        return data;
    })();

    pendingRequests.set(busId, request);

    try {
        return await request;
    } finally {
        if (pendingRequests.get(busId) === request) {
            pendingRequests.delete(busId);
        }
    }
}

export function clearBusRouteCache(busId?: number): void {
    if (busId === undefined) {
        routeCache.clear();
        return;
    }

    routeCache.delete(busId);
}
