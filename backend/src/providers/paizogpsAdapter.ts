const PAIZOGPS_API_URL = process.env.PAIZOGPS_API_URL;

export interface PaizoGpsResponse {
    type: string;
    lat: string | number;
    lng: string | number;
    speed?: string | number;
    angle?: string | number;
    plate_number?: string;
    dt_tracker?: string;
    [key: string]: unknown;
}

export function parsePaizoGpsTrackingUrl(trackingUrl: string) {
    const url = new URL(trackingUrl);

    if (
        url.protocol !== "https:" ||
        url.hostname !== "paizogps.in" ||
        url.pathname !== "/track/LiveTrack.php"
    ) {
        throw new Error("Invalid PaizoGPS tracking URL");
    }

    const vehicleNumber = url.searchParams.get("VehicleNo");
    const tripKey = url.searchParams.get("tripkey");

    if (!vehicleNumber || !tripKey) {
        throw new Error(
            "PaizoGPS tracking URL must contain VehicleNo and tripkey"
        );
    }

    return { vehicleNumber, tripKey };
}

export async function fetchPaizoGpsLocation(
    trackingUrl: string
): Promise<PaizoGpsResponse> {
    if (!PAIZOGPS_API_URL) {
        throw new Error("Missing PAIZOGPS_API_URL environment variable");
    }

    const { vehicleNumber, tripKey } =
        parsePaizoGpsTrackingUrl(trackingUrl);

    const body = new URLSearchParams({
        cmd: "DeviceTrack",
        key: tripKey,
        deviceid: vehicleNumber,
    });

    const response = await fetch(PAIZOGPS_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body,
        signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
        throw new Error(`PaizoGPS HTTP ${response.status}`);
    }

    const result: unknown = await response.json();

    if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw new Error("PaizoGPS returned an invalid response");
    }

    const data = result as Record<string, unknown>;
    const latitude = Number(data.lat);
    const longitude = Number(data.lng);

    if (
        data.type !== "Success" ||
        data.lat == null ||
        data.lng == null ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error("PaizoGPS returned no valid location");
    }

    return data as PaizoGpsResponse;
}
