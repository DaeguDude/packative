import express from "express";
import cors from "cors";
import itemsRouter from "./routes/items";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/items", itemsRouter);

export default app;
