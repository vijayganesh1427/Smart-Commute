import type { BusStatus } from "./bus";
export interface CustomStatusChipProps {
    type: "fleet" | "status";
    label: string;
    status?: BusStatus;
    isAC?: boolean;
}