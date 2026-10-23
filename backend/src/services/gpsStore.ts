import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";

export interface GpsSnapshot {
    payload: unknown;
    lastSuccessfulFetchAt: string;
}

type GpsSnapshots = Record<string, GpsSnapshot>;

const storeDirectory = path.resolve(
    process.cwd(),
    "src/data/live-gps"
);
const storePath = path.join(storeDirectory, "latestGps.json");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureStore(): Promise<void> {
    await mkdir(storeDirectory, { recursive: true });

    try {
        await readFile(storePath, "utf8");
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            try {
                await writeFile(storePath, "{}\n", { flag: "wx" });
            } catch (writeError) {
                // Another operation may have created the file meanwhile.
                if (
                    !(writeError instanceof Error) ||
                    !("code" in writeError) ||
                    writeError.code !== "EEXIST"
                ) {
                    throw writeError;
                }
            }
        } else {
            throw error;
        }
    }
}

export async function readGpsSnapshots(): Promise<GpsSnapshots> {
    await ensureStore();

    const raw = await readFile(storePath, "utf8");
    const parsed: unknown = JSON.parse(raw);

    if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
    ) {
        throw new Error("GPS snapshot store must be a JSON object");
    }

    return parsed as GpsSnapshots;
}

export function saveGpsSnapshot(
    busId: number,
    payload: unknown
): Promise<void> {
    const operation = writeQueue.then(async () => {
        await ensureStore();

        const snapshots = await readGpsSnapshots();

        snapshots[String(busId)] = {
            payload,
            lastSuccessfulFetchAt: new Date().toISOString(),
        };

        const temporaryPath = `${storePath}.${process.pid}.tmp`;

        await writeFile(
            temporaryPath,
            `${JSON.stringify(snapshots, null, 2)}\n`,
            "utf8"
        );

        await rename(temporaryPath, storePath);
    });

    writeQueue = operation.then(
        () => undefined,
        () => undefined
    );

    return operation;
}
