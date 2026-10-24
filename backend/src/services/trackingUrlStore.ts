import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type GpsProvider = "vamosys" | "paizogps";

const ENV_FILE = resolve(process.cwd(), ".env");
const TEMP_ENV_FILE = `${ENV_FILE}.admin.tmp`;

export function trackingUrlKey(provider: GpsProvider, busId: number): string {
    const prefix = provider === "vamosys" ? "VAMOSYS" : "PAIZOGPS";
    return `${prefix}_BUS_${busId}_TRACKING_URL`;
}

function parseEnvValue(raw: string): string {
    const value = raw.trim();
    if (value.startsWith('"') && value.endsWith('"')) {
        try { return JSON.parse(value) as string; } catch { return value.slice(1, -1); }
    }
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
    return value.replace(/\s+#.*$/, "").trim();
}

async function readEnvLines(): Promise<string[]> {
    try {
        return (await readFile(ENV_FILE, "utf8")).split(/\r?\n/);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        return [];
    }
}

export async function getTrackingUrl(provider: GpsProvider, busId: number): Promise<string> {
    const key = trackingUrlKey(provider, busId);
    if (process.env[key]) return process.env[key] as string;

    // Read .env directly as a fallback, including values written while the process is running.
    const lines = await readEnvLines();
    const line = lines.find((item) => item.trimStart().startsWith(`${key}=`));
    if (!line) return "";
    const value = parseEnvValue(line.slice(line.indexOf("=") + 1));
    if (value) process.env[key] = value;
    return value;
}

/** Persist the URL in .env and update process.env immediately for the running GPS scheduler. */
export async function setTrackingUrl(
    provider: GpsProvider,
    busId: number,
    rawUrl: string,
): Promise<void> {
    const url = rawUrl.trim();
    const keys = [trackingUrlKey("vamosys", busId), trackingUrlKey("paizogps", busId)];
    const targetKey = trackingUrlKey(provider, busId);
    const lines = await readEnvLines();
    const next: string[] = [];
    for (const line of lines) {
        const trimmed = line.trimStart();
        const key = trimmed.includes("=") ? trimmed.slice(0, trimmed.indexOf("=")).trim() : "";
        if (keys.includes(key)) continue;
        next.push(line);
    }
    if (url) next.push(`${targetKey}=${JSON.stringify(url)}`);
    while (next.length && next[next.length - 1] === "") next.pop();
    await mkdir(dirname(ENV_FILE), { recursive: true });
    await writeFile(TEMP_ENV_FILE, `${next.join("\n")}\n`, "utf8");
    await rename(TEMP_ENV_FILE, ENV_FILE);

    for (const key of keys) delete process.env[key];
    if (url) process.env[targetKey] = url;
}

export async function removeTrackingUrl(busId: number): Promise<void> {
    const keys = [trackingUrlKey("vamosys", busId), trackingUrlKey("paizogps", busId)];
    const lines = await readEnvLines();
    const next = lines.filter((line) => {
        const trimmed = line.trimStart();
        const key = trimmed.includes("=") ? trimmed.slice(0, trimmed.indexOf("=")).trim() : "";
        return !keys.includes(key);
    });
    while (next.length && next[next.length - 1] === "") next.pop();
    await mkdir(dirname(ENV_FILE), { recursive: true });
    await writeFile(TEMP_ENV_FILE, `${next.join("\n")}\n`, "utf8");
    await rename(TEMP_ENV_FILE, ENV_FILE);
    for (const key of keys) delete process.env[key];
}
