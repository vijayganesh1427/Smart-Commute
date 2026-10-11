import type { Bus } from "./bus";
import type { BusRouteResponse } from "../services/routeService";
export interface UserLocation{
    lat: number;
    long: number;
}
export interface MapViewProps {
    selBus: Bus | null;
    filBus: Bus[];
    onRouteDataChange: (data: BusRouteResponse | null) => void;
    onBusSel: (b: Bus) => void;
}
export interface GeneralMarkerProps {
    position: [number, number];
}