export interface BackendBus {
    id: number;
    latitude: number;
    longitude: number;
    speed: number;
    status: "Live" | "Stale" | "Offline";
}

export const buses: BackendBus[] = [
    {
        id: 1,
        latitude: 12.845,
        longitude: 80.226,
        speed: 34,
        status: "Live",
    },
    {
        id: 2,
        latitude: 12.923,
        longitude: 80.198,
        speed: 0,
        status: "Stale",
    },
    {
        id: 3,
        latitude: 12.9246,
        longitude: 80.116,
        speed: 0,
        status: "Offline",
    },
    {
        id: 4,
        latitude: 12.97671556,
        longitude: 80.15065111,
        speed: 0,
        status: "Offline"
    }
];