import express from "express";
import mongoose from "mongoose";
const router = express.Router();

router.get("/health", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
    },
  };

  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.services.database = "connected";
    } else {
      health.services.database = "disconnected";
      health.status = "degraded";
    }
  } catch (err) {
    health.services.database = "error";
    health.status = "degraded";
  }

  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
