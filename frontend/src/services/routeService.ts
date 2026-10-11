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

export async function getBusRoute(
    busId: number
): Promise<BusRouteResponse> {
    const response = await fetch(
        `http://localhost:5000/api/buses/${busId}/route`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch route for Bus ${busId}`);
    }

    return response.json() as Promise<BusRouteResponse>;
}
