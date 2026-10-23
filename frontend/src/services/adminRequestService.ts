import type { AdminRequest, AdminRequestInput, AdminRequestStatus } from "../types/adminRequest";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

async function parseResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(typeof data.message === "string" ? data.message : `Request failed (${response.status})`);
    }
    return data as T;
}

export async function submitAdminRequest(input: AdminRequestInput): Promise<AdminRequest> {
    const response = await fetch(`${API_BASE_URL}/api/admin/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(input),
    });
    return parseResponse<AdminRequest>(response);
}

export async function getAdminRequests(adminKey: string): Promise<AdminRequest[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/requests`, {
        headers: { Accept: "application/json", "x-admin-key": adminKey },
        cache: "no-store",
    });
    return parseResponse<AdminRequest[]>(response);
}

export async function reviewAdminRequest(
    id: string,
    adminKey: string,
    decision: Extract<AdminRequestStatus, "approved" | "rejected" | "archived">,
    reviewNote = "",
): Promise<AdminRequest> {
    const response = await fetch(`${API_BASE_URL}/api/admin/requests/${encodeURIComponent(id)}/review`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-admin-key": adminKey,
        },
        body: JSON.stringify({ decision, reviewNote }),
    });
    return parseResponse<AdminRequest>(response);
}
