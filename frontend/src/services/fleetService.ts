import type { Bus } from "../types/bus";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

interface FleetResponse {
    source: string;
    count: number;
    buses: Bus[];
}

export async function getFleet(): Promise<FleetResponse> {
    const response = await fetch(`${API_BASE_URL}/api/buses`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Fleet API returned HTTP ${response.status}`);
    }

    const result = await response.json() as FleetResponse;
    if (!Array.isArray(result.buses)) {
        throw new Error("Fleet API returned an invalid response");
    }
    console.log(result);
    return result;
}
