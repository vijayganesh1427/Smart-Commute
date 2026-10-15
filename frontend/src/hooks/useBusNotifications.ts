import { useCallback, useEffect, useRef, useState } from "react";
import type { Bus } from "../types/bus";
//import { buses } from "../data/buses";

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

const PROXIMITY_RADIUS_KM = 55;
const PROXIMITY_CHECK_INTERVAL_MS = 5000;

function getDistanceKm(
    pointA: Coordinates,
    pointB: Coordinates
): number {
    const earthRadiusKm = 6371;
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const latitudeDifference = toRadians(
        pointB.latitude - pointA.latitude
    );
    const longitudeDifference = toRadians(
        pointB.longitude - pointA.longitude
    );

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(pointA.latitude)) *
            Math.cos(toRadians(pointB.latitude)) *
            Math.sin(longitudeDifference / 2) ** 2;

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useBusNotifications(
  favoriteBuses: number[],
  fleet: Bus[],
  updateBusStatus: (busId: number, status: Bus["status"]) => void
) {
    const [notifications, setNotifications] = useState<BusNotification[]>([]);
    const [permission, setPermission] = useState<NotificationPermission>(
        typeof Notification === "undefined"
            ? "denied"
            : Notification.permission
    );
    const [userLocation, setUserLocation] =
        useState<Coordinates | null>(null);
    const [locationAvailable, setLocationAvailable] = useState(false);

    const previousStatuses = useRef(
        new Map<number, BusStatus>(fleet.map((bus) => [bus.id, bus.status]))
    );
    const favoriteIds = useRef(favoriteBuses);
    const insideRadius = useRef(new Set<number>());
    const notifiedRecovery = useRef(new Set<number>());

    favoriteIds.current = favoriteBuses;

    const addNotification = useCallback(
        (
            bus: Bus,
            message: string,
            type: BusNotification["type"]
        ) => {
            const notification: BusNotification = {
                id: `${bus.id}-${type}-${Date.now()}`,
                busId: bus.id,
                message,
                createdAt: new Date(),
                type,
            };
    
            // Always add the in-app notification first.
            // Native notification failures must not break the UI.
            setNotifications((current) => [notification, ...current]);
    
            
                if (
                typeof Notification !== "undefined" &&
                Notification.permission === "granted"
            ) {
                if ("serviceWorker" in navigator) {
                    navigator.serviceWorker.ready
                        .then((registration) =>
                            registration.showNotification("Smart Commute", {
                                body: message,
                                icon: "/favicon.ico",
                                tag: `bus-${bus.id}-${type}`,
                            })
                        )
                        .catch((error) => {
                            console.error("Notification display failed:", error);
                        });
                } else {
                    console.warn("Service Workers are not supported.");
                }
            }
        },
        []
    );

    // Optional user location: notifications still work without permission.
    useEffect(() => {
        if (!navigator.geolocation) return;

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
                maximumAge: 15000,
                timeout: 10000,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Notify when a favourite bus transitions from Stale/Offline to Live.
    useEffect(() => {
        for (const bus of fleet) {
            const previous = previousStatuses.current.get(bus.id);
            const current = bus.status;

            // Register newly encountered buses without generating alerts.
            if (previous === undefined) {
                previousStatuses.current.set(bus.id, current);
                continue;
            }

            // No transition occurred.
            if (previous === current) continue;

            // Save the new status before processing the transition.
            previousStatuses.current.set(bus.id, current);

            const isRecovery =
                current === "Live" &&
                (previous === "Stale" || previous === "Offline");

            if (isRecovery && favoriteIds.current.includes(bus.id)) {
                addNotification(
                    bus,
                    `${bus.routeName} is back online.`,
                    "recovery"
                );
            }
        }
    }, [fleet, addNotification]);

    // Notify once when a live favourite bus enters the proximity radius.
    // Notify once when a favourite bus enters the radius while Live.
useEffect(() => {
    if (!userLocation) return;

    const checkProximity = () => {
        for (const bus of fleet) {
            if (!favoriteIds.current.includes(bus.id)) {
                insideRadius.current.delete(bus.id);
                continue;
            }

            const distance = getDistanceKm(userLocation, {
                latitude: bus.latitude,
                longitude: bus.longitude,
            });

            const isInside = distance <= PROXIMITY_RADIUS_KM;
            const wasInside = insideRadius.current.has(bus.id);

            if (isInside) {
                // Record entry even if the bus is currently not Live.
                insideRadius.current.add(bus.id);

                if (!wasInside && bus.status === "Live") {
                    addNotification(
                        bus,
                        `${bus.routeName} is within ${PROXIMITY_RADIUS_KM} km of your location.`,
                        "proximity"
                    );
                }
            } else {
                insideRadius.current.delete(bus.id);
            }
        }
    };

    checkProximity();

    const interval = window.setInterval(
        checkProximity,
        PROXIMITY_CHECK_INTERVAL_MS
    );

    return () => window.clearInterval(interval);
}, [userLocation, fleet, addNotification]);

    const requestPermission = async () => {
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
            console.warn("Unable to request notification permission.", error);
    
            setPermission(
                typeof Notification !== "undefined"
                    ? Notification.permission
                    : "denied"
            );
    
            return false;
        }
    };

    // Temporary test helper: cycles a mock bus through its statuses.
    const simulateStatusChange = (busId: number) => {
        const bus = fleet.find((item) => item.id === busId);
        if (!bus) return;

        const nextStatus: Record<BusStatus, BusStatus> = {
            Live: "Stale",
            Stale: "Offline",
            Offline: "Live",
        };

        updateBusStatus(busId, nextStatus[bus.status]);
    };

    const clearNotifications = () => setNotifications([]);

    return {
        notifications,
        permission,
        requestPermission,
        clearNotifications,
        simulateStatusChange,
        userLocation,
        locationAvailable,
    };
}