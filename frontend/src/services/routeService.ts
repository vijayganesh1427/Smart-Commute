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
).replace(/\/$/, "");

export async function getBusRoute(
    busId: number
): Promise<BusRouteResponse> {
    const response = await fetch(
        `${API_BASE_URL}/api/buses/${busId}/route`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch route for Bus ${busId}`);
    }

    return response.json() as Promise<BusRouteResponse>;
}