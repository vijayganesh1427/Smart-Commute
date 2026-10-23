
import { useCallback, useEffect, useRef, useState } from "react";
import type { Bus } from "../types/bus";

type BusStatus = Bus["status"];

interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface BusNotification {
    id: string;
    busId: number;
    message: string;
    createdAt: Date;
    type: "recovery" | "proximity";
}

const PROXIMITY_RADIUS_KM = 1;
const PROXIMITY_CHECK_INTERVAL_MS = 5_000;

function getDistanceKm(
    pointA: Coordinates,
    pointB: Coordinates,
): number {
    const earthRadiusKm = 6371;
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const latitudeDifference = toRadians(
        pointB.latitude - pointA.latitude,
    );
    const longitudeDifference = toRadians(
        pointB.longitude - pointA.longitude,
    );

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(pointA.latitude)) *
            Math.cos(toRadians(pointB.latitude)) *
            Math.sin(longitudeDifference / 2) ** 2;

    // Protect against floating-point rounding outside [0, 1].
    const safeA = Math.min(1, Math.max(0, a));

    return (
        2 *
        earthRadiusKm *
        Math.atan2(Math.sqrt(safeA), Math.sqrt(1 - safeA))
    );
}

export function useBusNotifications(
    favoriteBuses: number[],
    fleet: Bus[],
) {
    const [notifications, setNotifications] = useState<BusNotification[]>([]);
    const [permission, setPermission] = useState<NotificationPermission>(
        () =>
            typeof Notification === "undefined"
                ? "denied"
                : Notification.permission,
    );

    const [userLocation, setUserLocation] =
        useState<Coordinates | null>(null);

    const [locationAvailable, setLocationAvailable] = useState(false);

    // Keep the latest values available to long-lived effects and timers.
    const fleetRef = useRef<Bus[]>(fleet);
    const favoriteIdsRef = useRef<number[]>(favoriteBuses);
    const userLocationRef = useRef<Coordinates | null>(userLocation);

    fleetRef.current = fleet;
    favoriteIdsRef.current = favoriteBuses;
    userLocationRef.current = userLocation;

    // undefined means the initial fleet has not been processed yet.
    const previousStatusesRef = useRef<Map<number, BusStatus> | null>(null);

    // Tracks which buses are currently within the radius.
    const insideRadiusRef = useRef(new Set<number>());

    const addNotification = useCallback(
        (
            bus: Bus,
            message: string,
            type: BusNotification["type"],
        ) => {
            const notification: BusNotification = {
                id: `${bus.id}-${type}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
                busId: bus.id,
                message,
                createdAt: new Date(),
                type,
            };

            setNotifications((current) => [notification, ...current]);

            // Native notification support is optional.
            if (
                typeof Notification === "undefined" ||
                Notification.permission !== "granted"
            ) {
                return;
            }

            const options: NotificationOptions = {
                body: message,
                icon: "/favicon.ico",
                tag: `bus-${bus.id}-${type}`,
            };

            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready
                    .then((registration) =>
                        registration.showNotification(
                            "Smart Commute",
                            options,
                        ),
                    )
                    .catch((error: unknown) => {
                        console.error(
                            "Native notification display failed:",
                            error,
                        );
                    });
            } else {
                try {
                    new Notification("Smart Commute", options);
                } catch (error) {
                    console.error(
                        "Native notification display failed:",
                        error,
                    );
                }
            }
        },
        [],
    );

    // Optional user location.
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationAvailable(false);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationAvailable(true);
            },
            () => {
                setLocationAvailable(false);
                setUserLocation(null);
            },
            {
                enableHighAccuracy: false,
                maximumAge: 15_000,
                timeout: 10_000,
            },
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Track genuine status transitions. The first fleet response establishes
    // a baseline and must not generate recovery notifications.
    useEffect(() => {
        if (fleet.length === 0) return;

        const previousStatuses = previousStatusesRef.current;
        const currentStatuses = new Map<number, BusStatus>();

        for (const bus of fleet) {
            currentStatuses.set(bus.id, bus.status);
        }

        if (previousStatuses === null) {
            previousStatusesRef.current = currentStatuses;
            return;
        }

        for (const bus of fleet) {
            const previous = previousStatuses.get(bus.id);

            // Newly added buses establish a baseline without an alert.
            if (previous === undefined) continue;

            const recovered =
                bus.status === "Live" &&
                (previous === "Stale" || previous === "Offline");

            if (
                recovered &&
                favoriteIdsRef.current.includes(bus.id)
            ) {
                addNotification(
                    bus,
                    `${bus.routeName} is back online.`,
                    "recovery",
                );
            }
        }

        // Replace the snapshot so removed buses do not linger.
        previousStatusesRef.current = currentStatuses;
    }, [fleet, addNotification]);

    // Run one proximity timer. Refs ensure it always uses the latest fleet,
    // favorites and location without restarting the timer on every refresh.
    useEffect(() => {
        const checkProximity = () => {
            const location = userLocationRef.current;

            if (!location) return;

            const favoriteIds = new Set(favoriteIdsRef.current);
            const currentInside = insideRadiusRef.current;
            const nextInside = new Set<number>();

            for (const bus of fleetRef.current) {
                if (!favoriteIds.has(bus.id)) continue;

                const validCoordinates =
                    Number.isFinite(bus.latitude) &&
                    Number.isFinite(bus.longitude) &&
                    bus.latitude >= -90 &&
                    bus.latitude <= 90 &&
                    bus.longitude >= -180 &&
                    bus.longitude <= 180;

                if (!validCoordinates) continue;

                const distance = getDistanceKm(location, {
                    latitude: bus.latitude,
                    longitude: bus.longitude,
                });

                const isInside = distance <= PROXIMITY_RADIUS_KM;
                const wasInside = currentInside.has(bus.id);

                if (isInside) {
                    nextInside.add(bus.id);

                    if (!wasInside && bus.status === "Live") {
                        addNotification(
                            bus,
                            `${bus.routeName} is within ${PROXIMITY_RADIUS_KM} km of your location.`,
                            "proximity",
                        );
                    }
                }
            }

            // Replacing the set also clears buses that left the radius,
            // stopped being favorites, or disappeared from the fleet.
            insideRadiusRef.current = nextInside;
        };

        checkProximity();

        const intervalId = window.setInterval(
            checkProximity,
            PROXIMITY_CHECK_INTERVAL_MS,
        );

        return () => window.clearInterval(intervalId);
    }, [addNotification]);

    const requestPermission = useCallback(async () => {
        if (
            typeof Notification === "undefined" ||
            !window.isSecureContext
        ) {
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === "granted";
        } catch (error) {
            console.warn(
                "Unable to request notification permission.",
                error,
            );

            setPermission(Notification.permission);
            return false;
        }
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        permission,
        requestPermission,
        clearNotifications,
        userLocation,
        locationAvailable,
    };
}