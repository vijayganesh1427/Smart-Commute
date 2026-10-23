export type AdminRequestKind = "add" | "edit" | "remove";
export type AdminRequestStatus = "pending" | "approved" | "rejected" | "archived";
export type GpsProvider = "vamosys" | "paizogps";

export interface AdminRequest {
    id: string;
    kind: AdminRequestKind;
    status: AdminRequestStatus;
    busId: number;
    registrationNumber?: string;
    routeName: string;
    provider?: GpsProvider;
    gpsLink: string;
    isAC?: boolean;
    route?: string[];
    reason: string;
    submittedAt: string;
    reviewedAt?: string;
    reviewNote?: string;
}

export interface AdminRequestInput {
    kind: AdminRequestKind;
    busId: number;
    routeName: string;
    gpsLink: string;
    reason?: string;
}
