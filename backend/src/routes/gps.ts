import { Router } from "express";
import { refreshVamosysBus } from "../services/gpsIngestionService.js";

const router = Router();

router.post("/refresh/:busId", async (req, res) => {
    const busId = Number(req.params.busId);

    if (!Number.isInteger(busId) || busId < 1) {
        return res.status(400).json({ error: "Invalid bus ID" });
    }

    try {
        const result = await refreshVamosysBus(busId);
        return res.json(result);
    } catch (error) {
        // Avoid returning provider URLs, tokens, or credentials to the client.
        console.error(
            `[gps] Refresh failed for bus ${busId}:`,
            error instanceof Error ? error.message : "Unknown error"
        );

        return res.status(502).json({
            error: `Could not refresh GPS data for bus ${busId}`,
        });
    }
});

export default router;