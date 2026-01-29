import express from "express";
import rideRoutes from "./routes/rideRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

// Health check route (before API routes)
app.use("/", healthRoutes);

// API routes
app.use("/api", rideRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
