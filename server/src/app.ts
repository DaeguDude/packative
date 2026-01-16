import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import itemsRouter from "./routes/items";
import authRouter from "./routes/auth";

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

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);

export default app;
