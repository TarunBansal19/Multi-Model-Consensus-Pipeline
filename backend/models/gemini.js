import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function geminiResponse(question) {
    const start = performance.now();
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: question,
    });
    const end = performance.now();

    return {
        model: 'gemini',
        text: response.text,
        time_taken: (end - start) / 1000
    }
}

export default geminiResponse;
