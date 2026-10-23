
interface GeocodingResult {
    name?: string;
    state?: string;
    country?: string;
}

interface AreaCacheEntry {
    latitude: number;
    longitude: number;
    area: string;
    resolvedAt: number;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const RETRY_DELAY_MS = 10 * 60 * 1000; // 10 minutes
const MOVEMENT_THRESHOLD_METERS = 500;

const areaCache = new Map<number, AreaCacheEntry>();
const lastAttemptAt = new Map<number, number>();

function distanceInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const radians = (degrees: number) => degrees * Math.PI / 180;
    const earthRadius = 6_371_000;

    const dLat = radians(lat2 - lat1);
    const dLon = radians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(radians(lat1)) *
        Math.cos(radians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * earthRadius * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );
}

export async function resolveCurrentArea(
    busId: number,
    latitude: number,
    longitude: number,
    fallbackArea = "Unknown"
): Promise<string> {
    const now = Date.now();
    const cached = areaCache.get(busId);

    if (cached) {
        const distance = distanceInMeters(
            cached.latitude,
            cached.longitude,
            latitude,
            longitude
        );

        const cacheIsFresh =
            now - cached.resolvedAt < CACHE_TTL_MS;

        if (distance < MOVEMENT_THRESHOLD_METERS && cacheIsFresh) {
            return cached.area;
        }
    }

    // Avoid repeatedly calling the API when it is failing.
    const lastAttempt = lastAttemptAt.get(busId) ?? 0;

    if (now - lastAttempt < RETRY_DELAY_MS) {
        return cached?.area ?? fallbackArea;
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        return cached?.area ?? fallbackArea;
    }

    lastAttemptAt.set(busId, now);

    try {
        const url = new URL(
            "https://api.openweathermap.org/geo/1.0/reverse"
        );

        url.searchParams.set("lat", String(latitude));
        url.searchParams.set("lon", String(longitude));
        url.searchParams.set("appid", apiKey);

        // `limit` is optional, so we omit it.

        const response = await fetch(url, {
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            throw new Error(
                `OpenWeather returned HTTP ${response.status}`
            );
        }

        const results =
            await response.json() as GeocodingResult[];

        const place = Array.isArray(results) ? results[0] : undefined;

        if (!place?.name?.trim()) {
            throw new Error("No location name returned");
        }

        const area = place.name.trim();

        areaCache.set(busId, {
            latitude,
            longitude,
            area,
            resolvedAt: Date.now(),
        });

        return area;
    } catch (error) {
        console.warn(
            `[geocoding] Bus ${busId}:`,
            error instanceof Error ? error.message : error
        );

        // Preserve the last successfully resolved area.
        return cached?.area ?? fallbackArea;
    }
}
