import { Router } from "express";
import { readFile, writeFile, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();

type CrowdLevel = "Low" | "Moderate" | "High";

interface CrowdReport {
    id: string;
    busId: number;
    level: CrowdLevel;
    createdAt: string;
}

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const DATA_FILE = resolve(
    currentDirectory,
    "../data/crowdReports.json"
);

const TEMP_FILE = `${DATA_FILE}.tmp`;

async function readReports(): Promise<CrowdReport[]> {
    const content = await readFile(DATA_FILE, "utf-8");
    const parsed: unknown = JSON.parse(content);

    if (!Array.isArray(parsed)) {
        throw new Error("Crowd report data must be a JSON array.");
    }

    return parsed as CrowdReport[];
}

// Serialize writes so simultaneous submissions don't overwrite
// one another using stale copies of the file.
let writeQueue: Promise<void> = Promise.resolve();

function queueWrite(
    report: CrowdReport
): Promise<CrowdReport> {
    const operation = writeQueue.then(async () => {
        const reports = await readReports();

        const updated = [report, ...reports].slice(0, 100);

        await writeFile(
            TEMP_FILE,
            JSON.stringify(updated, null, 2),
            "utf-8"
        );

        await rename(TEMP_FILE, DATA_FILE);

        return report;
    });

    writeQueue = operation.then(
        () => undefined,
        () => undefined
    );

    return operation;
}

// GET /api/crowd-reports
// GET /api/crowd-reports?busId=1
router.get("/", async (req, res) => {
    try {
        const reports = await readReports();
        const busIdParam = req.query.busId;

        if (busIdParam === undefined) {
            return res.json(reports);
        }

        const busId = Number(busIdParam);

        if (!Number.isInteger(busId) || busId <= 0) {
            return res.status(400).json({
                message: "busId must be a positive integer.",
            });
        }

        return res.json(
            reports.filter((report) => report.busId === busId)
        );
    } catch (error) {
        console.error("Failed to read crowd reports:", error);

        return res.status(500).json({
            message: "Failed to load crowd reports.",
        });
    }
});

// POST /api/crowd-reports
router.post("/", async (req, res) => {
    const { busId, level } = req.body ?? {};

    if (
        !Number.isInteger(busId) ||
        busId <= 0 ||
        !["Low", "Moderate", "High"].includes(level)
    ) {
        return res.status(400).json({
            message: "A valid busId and crowd level are required.",
        });
    }

    const report: CrowdReport = {
        id: crypto.randomUUID(),
        busId,
        level: level as CrowdLevel,
        createdAt: new Date().toISOString(),
    };

    try {
        const savedReport = await queueWrite(report);

        return res.status(201).json(savedReport);
    } catch (error) {
        console.error("Failed to save crowd report:", error);

        return res.status(500).json({
            message: "Failed to save crowd report.",
        });
    }
});

export default router;