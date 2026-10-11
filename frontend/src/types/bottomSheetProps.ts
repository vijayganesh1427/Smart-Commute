import type { Bus } from "./bus";
export interface BottomSheetProps{
    children1?: React.ReactNode;
    children2: React.ReactNode;
};
export interface DisplayBusProps{
    bus: Bus;
    child1: boolean;
    isFavourite: boolean;
    etaMinutes?: number | null;
    remainingDistanceKm?: number | null;
    onToggleFavourite: (busId: number) => void;
};