import express from "express";
import cors from "cors";
import routeRouter from "./routes/route.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Smart Commute Backend is running!"
    });
});

app.use("/api/buses", routeRouter);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});