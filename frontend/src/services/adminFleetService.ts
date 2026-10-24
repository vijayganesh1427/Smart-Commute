export type GpsProvider = "vamosys" | "paizogps";

export interface BusConfigRecord {
    busId: number;
    provider: GpsProvider;
    registrationNumber: string;
    routeName: string;
    isAC: boolean;
    route: string[];
    trackingUrl: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const headers = (key: string) => ({ "Content-Type": "application/json", "x-admin-key": key, Accept: "application/json" });

async function readError(response: Response): Promise<string> {
    try {
        const body = await response.json() as { message?: string };
        return body.message || `Request failed (HTTP ${response.status})`;
    } catch {
        return `Request failed (HTTP ${response.status})`;
    }
}

export async function getAdminFleet(key: string): Promise<BusConfigRecord[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/fleet`, { headers: headers(key), cache: "no-store" });
    if (!response.ok) throw new Error(await readError(response));
    const data = await response.json() as unknown;
    if (!Array.isArray(data)) throw new Error("Admin fleet API returned an invalid response.");
    return data as BusConfigRecord[];
}

export async function updateAdminBus(key: string, originalBusId: number, body: BusConfigRecord): Promise<BusConfigRecord> {
    const response = await fetch(`${API_BASE_URL}/api/admin/fleet/${originalBusId}`, {
        method: "PUT", headers: headers(key), body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await readError(response));
    return await response.json() as BusConfigRecord;
}

export async function deleteAdminBus(key: string, busId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/fleet/${busId}`, { method: "DELETE", headers: headers(key) });
    if (!response.ok) throw new Error(await readError(response));
}
