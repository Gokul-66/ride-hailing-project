import express from "express";
import Ride from "../models/Ride.js";
import rideQueue from "../queues/rideQueue.js";
import mongoose from "mongoose";

const router = express.Router();

function toRideDto(rawRide) {
  const ride = rawRide?._doc || rawRide;
  const idValue = ride?._id ?? ride?.id;

  let id = null;
  if (typeof idValue === "string") {
    id = idValue;
  } else if (idValue?.toString) {
    id = idValue.toString();
  } else if (idValue?.buffer) {
    id = Buffer.from(idValue.buffer).toString("hex");
  }

  return {
    id,
    riderName: ride?.riderName ?? "",
    pickup: ride?.pickup ?? "",
    drop: ride?.drop ?? "",
    status: ride?.status ?? "REQUESTED",
    driver: ride?.driver ?? null,
    createdAt: ride?.createdAt ?? null,
    updatedAt: ride?.updatedAt ?? null,
  };
}

// create a new ride
router.post("/rides", async (req, res, next) => {
  try {
    const { riderName, pickup, drop } = req.body;
    const MAX_ACTIVE_RIDES = 50;

    if (!riderName || !pickup || !drop) {
      const error = new Error("riderName, pickup, and drop are required");
      error.statusCode = 400;
      throw error;
    }

    const activeRideCount = await Ride.countDocuments({
      status: { $in: ["pending", "searching", "assigned"] }
    });

    if (activeRideCount >= MAX_ACTIVE_RIDES) {
      return res.status(400).json({
        error: "Ride capacity reached. Please try later."
      });
    }

    const ride = await Ride.create({
      riderName,
      pickup,
      drop,
      status: "pending",
    });

    await rideQueue.add("ride-created", { rideId: ride._id.toString() });

    res.status(201).json({
      success: true,
      data: toRideDto(ride),
    });
  } catch (err) {
    next(err);
  }
});

// get all rides
router.get("/rides", async (req, res, next) => {
  try {
    const rides = await Ride.find().sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: rides.map(toRideDto),
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

    const ride = await Ride.findById(id).lean();

    if (!ride) {
      const error = new Error("Ride not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: toRideDto(ride),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
