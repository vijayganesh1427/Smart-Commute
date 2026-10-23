
import { Router } from "express";
import { refreshPaizoGpsBus } from "../services/gpsIngestionService.js";

const router = Router();

router.post("/refresh/:busId", async (req, res) => {
    const busId = Number(req.params.busId);

    if (!Number.isInteger(busId) || busId < 1) {
        return res.status(400).json({ error: "Invalid bus ID" });
    }

    try {
        const result = await refreshPaizoGpsBus(busId);
        return res.json(result);
    } catch (error) {
        console.error(
            `[gps] PaizoGPS refresh failed for bus ${busId}:`,
            error instanceof Error ? error.message : error
        );

        return res.status(502).json({
            error: `Could not refresh PaizoGPS data for bus ${busId}`,
        });
    }
});

export default router;
