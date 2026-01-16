import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import listEndpoints from "express-list-endpoints";
import itemsRouter from "./routes/items";
import authRouter from "./routes/auth";
import postsRouter from "./routes/posts";

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/posts", postsRouter);

// List all routes
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app);

  // Group endpoints by router
  const grouped: Record<string, typeof endpoints> = {};
  endpoints.forEach((endpoint) => {
    const parts = endpoint.path.split("/").filter(Boolean);
    let group = "root";
    if (parts[0] === "api" && parts[1]) {
      group = parts[1];
    } else if (parts[0] && parts[0] !== "api") {
      group = parts[0];
    }
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(endpoint);
  });

  const methodColors: Record<string, string> = {
    GET: "#61affe",
    POST: "#49cc90",
    PUT: "#fca130",
    DELETE: "#f93e3e",
    PATCH: "#50e3c2",
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Propotive API</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #eee; padding: 40px; }
    h1 { font-size: 2rem; margin-bottom: 8px; }
    .subtitle { color: #888; margin-bottom: 32px; }
    .group { background: #16213e; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
    .group-header { background: #0f3460; padding: 12px 16px; font-weight: 600; text-transform: capitalize; font-size: 1.1rem; }
    .endpoint { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #0f3460; gap: 12px; }
    .endpoint:last-child { border-bottom: none; }
    .method { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; min-width: 60px; text-align: center; color: #fff; }
    .path { font-family: monospace; font-size: 14px; }
    .path span { color: #fca130; }
    .middleware { color: #666; font-size: 12px; margin-left: auto; }
  </style>
</head>
<body>
  <h1>Propotive API</h1>
  <p class="subtitle">v1.0.0 • ${endpoints.length} endpoints</p>
  ${Object.entries(grouped)
    .map(
      ([group, eps]) => `
    <div class="group">
      <div class="group-header">${group}</div>
      ${eps
        .map(
          (ep) => `
        ${ep.methods
          .map(
            (method) => `
          <div class="endpoint">
            <span class="method" style="background: ${methodColors[method] || "#666"}">${method}</span>
            <span class="path">${ep.path.replace(/:(\w+)/g, "<span>:$1</span>")}</span>
            <span class="middleware">${ep.middlewares.filter((m) => m !== "anonymous").join(", ")}</span>
          </div>
        `
          )
          .join("")}
      `
        )
        .join("")}
    </div>
  `
    )
    .join("")}
</body>
</html>`;

  res.type("html").send(html);
});

export default app;
