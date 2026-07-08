# Multi-Model Consensus Pipeline

An intelligent consensus system that queries multiple LLMs in parallel and uses a superior model as a judge to evaluate, select, or synthesize the best final response.

## Architecture

- **Backend**: Express server running on Bun (Port 7000), handling parallel LLM queries (OpenAI, Gemini, Claude) and judicial synthesis.
- **Frontend**: React + Tailwind CSS application served via Bun development server (Port 5173) with API proxying, or statically served from the backend in production.

## Getting Started

### 1. Installation

Install all dependencies across the workspace:

```bash
bun install
```

### 2. Environment Setup

Create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=your_openai_key
CLAUDE_API_KEY=your_claude_key
GEMINI_API_KEY=your_gemini_key
```

### 3. Development

Start both the backend server and frontend development server concurrently with hot reloading:

```bash
bun run dev
```
- **Frontend dev server**: http://localhost:5173 (proxies API requests to backend)
- **Backend API server**: http://localhost:7000

### 4. Production Build & Start

Build the frontend static assets and run the backend production server:

```bash
bun run build
bun run start
```
The production server will serve the UI and API at http://localhost:7000.
