import express from "express"
import cors from "cors";
import layer from "./layer.js";
import runAggregator from "./aggregator.js";

import path from "path";
import { fileURLToPath } from "url";


const app = express();

app.use(cors(
    {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"]
    }
));
app.use(express.json());


app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
})

app.post("/api/ask", async (req, res) => {
    const { question } = req.body;

    try {
        const layerResponse = await layer(question);
        const aggregatorResponse = await runAggregator(question, layerResponse);

        res.json({
            responses: layerResponse,
            consensus: aggregatorResponse,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 7000;
const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})
