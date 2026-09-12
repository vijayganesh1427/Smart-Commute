export interface MyFleetProps {
    favoriteBuses: number[];
    toggleFavorite: (busId: number) => void;
}