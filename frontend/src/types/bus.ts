export type BusStatus = "Live" | "Stale" | "Offline";
export interface Bus {
  id: number;
  registrationNumber?: string;
  routeName?: string;
  currentArea?: string;
  latitude: number;
  longitude: number;
  status: BusStatus;
  speed?: number;
  direction?: string;
  lastUpdated?: string;
  isAC?: boolean;
  estimatedArrival?: number;
  distanceFromVIT?: number;
  distanceFromUser?: number;
  route?: string[];
}