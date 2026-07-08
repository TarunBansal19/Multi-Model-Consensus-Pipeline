import callOpenAI from "./models/openai.js"
import callGemini from "./models/gemini.js"
import callClaude from "./models/claude.js"

async function layer(question) {
    const [opResponse, geminiResponse, claudeResponse] = await Promise.all([
        callOpenAI(question),
        callGemini(question),
        callClaude(question),
    ]);

    return [
        opResponse,
        geminiResponse,
        claudeResponse
    ]
}

export default layer;
