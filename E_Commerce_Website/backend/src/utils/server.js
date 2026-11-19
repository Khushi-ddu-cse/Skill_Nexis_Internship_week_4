import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import { notFound, errorHandler } from "./middleware/errors.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(v => v.trim()) : "http://localhost:5173",
  credentials: false
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "MarketHub API" }));
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
try {
  await connectDB();
  const server = app.listen(port, () => console.log(`MarketHub API listening on http://localhost:${port}`));
  process.on("SIGTERM", () => server.close(() => process.exit(0)));
  process.on("SIGINT", () => server.close(() => process.exit(0)));
} catch (error) {
  console.error("Server startup failed:", error.message);
  process.exit(1);
}
