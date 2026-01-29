import express from "express";
import Ride from "../models/Ride.js";
import rideQueue from "../queues/rideQueue.js";
import mongoose from "mongoose";

const router = express.Router();

// create a new ride
router.post("/rides", async (req, res, next) => {
  try {
    const { riderName, pickup, drop } = req.body;

    if (!riderName || !pickup || !drop) {
      const error = new Error("riderName, pickup, and drop are required");
      error.statusCode = 400;
      throw error;
    }

    const ride = await Ride.create({
      riderName,
      pickup,
      drop,
    });

    await rideQueue.add("ride-created", { rideId: ride._id.toString() });

    res.status(201).json({
      success: true,
      data: ride,
    });
  } catch (err) {
    next(err);
  }
});

// get a ride by id
router.get("/rides/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid ride ID format");
      error.statusCode = 400;
      throw error;
    }

    const ride = await Ride.findById(id);

    if (!ride) {
      const error = new Error("Ride not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

