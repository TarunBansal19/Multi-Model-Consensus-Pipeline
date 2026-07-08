import Anthropic from '@anthropic-ai/sdk';
import dotenv from "dotenv";

dotenv.config();

const client = new Anthropic({
    baseURL: "https://api.aicredits.in",
    authToken: process.env.CLAUDE_API_KEY
});

async function claudeResponse(question) {
    const start = performance.now();
    const message = await client.messages.create({
        max_tokens: 1024,
        messages: [{ content: question, role: 'user' }],
        model: 'anthropic/claude-haiku-4.5',
    });
    const end = performance.now();

    return {
        model: 'claude',
        text: message.content[0].text,
        time_taken: (end - start) / 1000
    }
}

export default claudeResponse;

