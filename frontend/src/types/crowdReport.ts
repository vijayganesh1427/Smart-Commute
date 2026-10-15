export type CrowdLevel = "Low" | "Moderate" | "High";

export interface CrowdReport {
    id: string;
    busId: number;
    level: CrowdLevel;
    createdAt: string;
}
