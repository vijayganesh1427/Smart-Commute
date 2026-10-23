import type { Bus } from "./bus";

export interface MyFleetProps {
    fleet: Bus[];
    favoriteBuses: number[];
    toggleFavorite: (busId: number) => void;
}