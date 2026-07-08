import { serve } from "bun";
import index from "./index.html";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:7000";

const server = serve({
  port: process.env.PORT ? Number(process.env.PORT) : 5173,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/health": async (req) => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`);
        return new Response(res.body, {
          status: res.status,
          headers: res.headers,
        });
      } catch (err) {
        return Response.json({ status: "offline", error: String(err) }, { status: 503 });
      }
    },

    "/api/*": async (req) => {
      try {
        const url = new URL(req.url);
        const targetUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
        const headers = new Headers(req.headers);
        headers.delete("host");
        headers.delete("connection");

        const res = await fetch(targetUrl, {
          method: req.method,
          headers: headers,
          body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
        });
        return new Response(res.body, {
          status: res.status,
          headers: res.headers,
        });
      } catch (err) {
        return Response.json(
          { error: `Failed to proxy request to backend at ${BACKEND_URL}` },
          { status: 503 }
        );
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Frontend dev server running at ${server.url}`);
console.log(`📡 Proxying API requests to backend at ${BACKEND_URL}`);
