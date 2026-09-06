import type { Bus } from "./bus";
export interface BusMarkerProps {
    bus: Bus;
    isSelected: boolean;
    onSelect: (b: Bus)=>void;
}