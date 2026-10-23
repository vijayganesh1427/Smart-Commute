import express from "express";
import cors from "cors";
import routeRouter from "./routes/route";
import crowdReportsRouter from "./routes/crowdReports";
import "dotenv/config";
import gpsRouter from "./routes/gps.js";
import { startGpsRefreshScheduler } from "./services/gpsRefreshScheduler.js";
import gpsPaizoRouter from "./routes/gpsPaizo.js";
import adminRequestsRouter from "./routes/adminRequests";
import adminFleetRouter from "./routes/adminFleet";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/gps", gpsRouter);
app.use("/api/gps/paizo", gpsPaizoRouter);
app.use("/api/admin/requests", adminRequestsRouter);
app.use("/api/admin/fleet", adminFleetRouter);

app.get("/", (_req, res) => {
    res.json({
        message: "Smart Commute Backend is running!",
    });
});

app.use("/api/buses", routeRouter);
app.use("/api/crowd-reports", crowdReportsRouter);

const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
    startGpsRefreshScheduler();
});