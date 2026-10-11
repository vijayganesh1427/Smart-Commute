import { Router } from "express";
import { routeWaypoints } from "../data/routeWay.js";
import { buses } from "../data/buses.js";
import type { CachedRoute } from "../types/cachedRouteProps.js";

const router = Router();

const routeCache = new Map<number, CachedRoute>();

// Distance between two latitude/longitude coordinates, in kilometres.
function getDistance(
    pointA: [number, number],
    pointB: [number, number]
): number {
    const earthRadius = 6371;

    const toRadians = (degrees: number) =>
        (degrees * Math.PI) / 180;

    const lat1 = toRadians(pointA[0]);
    const lat2 = toRadians(pointB[0]);
    const deltaLat = toRadians(pointB[0] - pointA[0]);
    const deltaLng = toRadians(pointB[1] - pointA[1]);

    const a =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLng / 2) ** 2;

    return (
        earthRadius *
        2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    );
}

// Approximate the remaining route distance using the nearest
// vertex in the cached route geometry.
function getRemainingDistance(
    currentPosition: [number, number],
    route: [number, number][]
): number {
    if (route.length < 2) {
        return 0;
    }

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < route.length; i++) {
        const distance = getDistance(currentPosition, route[i]);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
        }
    }

    let remainingDistance = 0;

    for (let i = nearestIndex; i < route.length - 1; i++) {
        remainingDistance += getDistance(route[i], route[i + 1]);
    }

    return remainingDistance;
}

router.get("/:busId/route", async (req, res) => {
    try {
        const busId = Number(req.params.busId);

        if (!Number.isInteger(busId) || busId <= 0) {
            return res.status(400).json({
                error: "Invalid bus ID",
            });
        }

        const points = routeWaypoints[busId];
        const bus = buses.find((item) => item.id === busId);

        if (!points || !bus) {
            return res.status(404).json({
                error: "Bus or route not found",
            });
        }

        let cachedRoute = routeCache.get(busId);

        // Generate and cache the route only on a cache miss.
        if (!cachedRoute) {
            const coordinates = points
                .map(([lat, lng]) => `${lng},${lat}`)
                .join(";");

            const url =
                "https://router.project-osrm.org/route/v1/driving/" +
                `${coordinates}?overview=full&geometries=geojson`;

            const response = await fetch(url);

            if (!response.ok) {
                return res.status(502).json({
                    error: "Routing service failed",
                });
            }

            const data = await response.json();
            const osrmRoute = data.routes?.[0];

            if (
                data.code !== "Ok" ||
                !osrmRoute?.geometry?.coordinates?.length
            ) {
                return res.status(502).json({
                    error: "No valid route returned by routing service",
                });
            }

            const route: [number, number][] =
                osrmRoute.geometry.coordinates.map(
                    ([longitude, latitude]: [number, number]) => [
                        latitude,
                        longitude,
                    ]
                );

            cachedRoute = {
                route,
                distance: osrmRoute.distance,
                duration: osrmRoute.duration,
            };

            routeCache.set(busId, cachedRoute);

            console.log(`Route cached: Bus ${busId}`);
        } else {
            console.log(`Route cache hit: Bus ${busId}`);
        }

        // Recalculate ETA for every request using the current bus data.
        const currentPosition: [number, number] = [
            bus.latitude,
            bus.longitude,
        ];

        const remainingDistanceKm = getRemainingDistance(
            currentPosition,
            cachedRoute.route
        );

        const etaMinutes =
            bus.status === "Live" && bus.speed > 0
                ? Math.ceil((remainingDistanceKm / bus.speed) * 60)
                : null;

        return res.json({
            busId,
            route: cachedRoute.route,
            distance: cachedRoute.distance,
            duration: cachedRoute.duration,
            remainingDistanceKm: Number(
                remainingDistanceKm.toFixed(2)
            ),
            etaMinutes,
            busStatus: bus.status,
        });
    } catch (error) {
        console.error("Route generation failed:", error);

        return res.status(500).json({
            error: "Failed to generate route",
        });
    }
});

export default router;