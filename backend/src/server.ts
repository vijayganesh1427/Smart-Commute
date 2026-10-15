import express from "express";
import cors from "cors";
import routeRouter from "./routes/route";
import crowdReportsRouter from "./routes/crowdReports";

const app = express();

app.use(cors());
app.use(express.json());

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
});