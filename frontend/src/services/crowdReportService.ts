import type { CrowdLevel, CrowdReport } from "../types/crowdReport";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let message = `Request failed (${response.status}).`;

        try {
            const body = await response.json();
            if (typeof body.message === "string") {
                message = body.message;
            }
        } catch {
            // Keep the default error message.
        }

        throw new Error(message);
    }

    return response.json() as Promise<T>;
}

export async function getCrowdReports(
    busId?: number
): Promise<CrowdReport[]> {
    const query = busId === undefined
        ? ""
        : `?busId=${encodeURIComponent(busId)}`;

    const response = await fetch(
        `${API_BASE_URL}/api/crowd-reports${query}`
    );

    return handleResponse<CrowdReport[]>(response);
}

export async function getLatestCrowdReport(
    busId: number
): Promise<CrowdReport | undefined> {
    const reports = await getCrowdReports(busId);

    return reports.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
    )[0];
}

export async function submitCrowdReport(
    busId: number,
    level: CrowdLevel
): Promise<CrowdReport> {
    const response = await fetch(
        `${API_BASE_URL}/api/crowd-reports`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ busId, level }),
        }
    );

    return handleResponse<CrowdReport>(response);
}