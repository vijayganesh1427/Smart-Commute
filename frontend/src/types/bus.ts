export type BusStatus = "live" | "updating" | "offline";
export interface Bus {
  id: number;
  registrationNumber?: string;
  routeName?: string;
  currentArea?: string;
  latitude: number;
  longitude: number;
  status?: BusStatus;
  speed?: number;
  direction?: string;
  lastUpdated?: string;
  isAC?: boolean;
  estimatedArrival?: string;
  distanceFromUser?: number;
}