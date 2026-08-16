export type statusType="Live"|"Updating"|"Offline";
export interface StatusChipProp{
    status: statusType;
    count: number;
}