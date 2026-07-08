import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
    baseURL: "https://api.aicredits.in/v1",
    apiKey: process.env.OPENAI_API_KEY,
});

async function opResponse(question) {
    const start = performance.now();
    const response = await client.responses.create({
        model: 'gpt-5.4-mini',
        input: question,
    });
    const end = performance.now();

    return {
        model: 'openai',
        text: response.output_text,
        time_taken: (end - start) / 1000
    }
}

export default opResponse;

