import type { Bus } from "./bus";
export interface UserLocation{
    lat: number;
    long: number;
}
export interface MapViewProps {
    selBus: Bus | null;
    filBus: Bus[];
    onBusSel: (b: Bus) => void;
}
export interface GeneralMarkerProps {
    position: [number, number];
}