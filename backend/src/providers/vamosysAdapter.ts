const VAMOSYS_API_URL = process.env.VAMOSYS_API_URL;

interface VamosysVehicle {
    latitude: string | number;
    longitude: string | number;
    speed: number | string;
    date?: number | string;
    lastSeen?: string;
    lastComunicationTime?: number | string;
    direction?: string;
    regNo?: string;
    vehicleId?: string;
}

interface VamosysResponse {
    response: string;
    data: VamosysVehicle[];
    error?: unknown;
}

export function parseVamosysTrackingUrl(trackingUrl: string) {
    const url = new URL(trackingUrl);

    if (
        url.protocol !== "https:" ||
        url.hostname !== "gpsvtspro.vamosys.com" ||
        !url.pathname.startsWith("/shareLinkForMultipleVehicles/")
    ) {
        throw new Error("Invalid Vamosys tracking URL");
    }

    const vehicleToken = url.pathname.split("/").filter(Boolean).at(-1);
    const group = url.searchParams.get("group");

    if (!vehicleToken || !group) {
        throw new Error("Vamosys URL must contain a token and group");
    }

    const groupPrefix = group.split(":")[0].toUpperCase();

    // Keep the mapping explicit; do not guess arbitrary account IDs.
    const knownUserIds: Record<string, string> = {
        "SBLEMAIN-ALL": "SBLEHO",
        "NATIONALTRAVELS-VIT": "NATIONALTRAVELS-VIT",
    };

    const userId = knownUserIds[groupPrefix];

    if (!userId) {
        throw new Error(`No configured Vamosys user ID for group ${groupPrefix}`);
    }

    return {
        vehicleList: [vehicleToken],
        userId,
        group,
    };
}

export async function fetchVamosysLocation(
    trackingUrl: string
): Promise<VamosysResponse> {
    if (!VAMOSYS_API_URL) {
        throw new Error("Missing VAMOSYS_API_URL environment variable");
    }

    const requestBody = parseVamosysTrackingUrl(trackingUrl);

    const response = await fetch(VAMOSYS_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
        throw new Error(`Vamosys HTTP ${response.status}`);
    }

    const result = (await response.json()) as VamosysResponse;

    if (
        result.response !== "Success" ||
        !Array.isArray(result.data) ||
        result.data.length === 0
    ) {
        throw new Error("Vamosys returned no valid vehicle data");
    }

    return result;
}
