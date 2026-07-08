import express from "express"
import cors from "cors";
import layer from "./layer.js";
import runAggregator from "./aggregator.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend/dist")));

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

app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 7000;
const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})
