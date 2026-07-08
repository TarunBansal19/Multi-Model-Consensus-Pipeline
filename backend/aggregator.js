import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
    baseURL: 'https://api.aicredits.in/v1',
    apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are an impartial judge evaluating three candidate's answers to a user's question. Evaluate Purely on Merit, ignoring the model name, token usage, or time taken. Your goal is to produce a single, high-quality answer that represents the best possible response to the user.

Score each response on:
- Correctness (factual accuracy)
- Completeness (does it fully answer the question)
- Clarity (well-organized, easy to follow)

Then decide:
- If one response is clearly best, use it as-is (or nearly as-is). Don't force a merge for its own sake
- If no single response is best, synthesize a new answer combining the strongest elements of multiple responses.`;

const USER_PROMPT = (question, responses) => `User Question : ${question}
Candidate Responses : ${JSON.stringify(responses, null, 2)}`;


const RESULT_SCHEMA = {
    type: 'object',
    properties: {
        source: {
            type: 'string',
            enum: ['claude', 'openai', 'gemini', 'claude-synthesized']
        },
        best_response: { type: 'string' },
        reasoning: { type: 'string' }
    },
    required: ['source', 'best_response', 'reasoning'],
    additionalProperties: false
};

async function runAggregator(question, responses) {
    const start = performance.now();
    const response = await client.responses.create({
        model: 'gpt-5.4-mini',
        input: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: USER_PROMPT(question, responses) }
        ],
        max_output_tokens: 2048,
        text: {
            format: {
                type: 'json_schema',
                name: 'aggregator_result',
                schema: RESULT_SCHEMA,
                strict: true
            }
        }
    });

    const end = performance.now();

    const result = JSON.parse(response.output_text);

    return {
        source: result.source,
        text: result.best_response,
        reasoning: result.reasoning,
        time_taken: (end - start) / 1000,
    };
}

export default runAggregator;

