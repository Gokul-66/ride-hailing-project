import "dotenv/config";

import { Worker } from "bullmq";
import mongoose from "mongoose";
import { connection } from "./config/redis.js";
import Ride from "./models/Ride.js";

const ASSIGNMENT_DELAY_MS = Number(process.env.ASSIGNMENT_DELAY_MS || 60000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const rideWorker = new Worker(
  "ride-queue",
  async (job) => {
    const { rideId } = job.data;

    if (!rideId) {
      throw new Error("Missing rideId");
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      throw new Error(`Ride not found: ${rideId}`);
    }
    if (ride.status === "DRIVER_ASSIGNED") {
      console.log(`Worker: ride already assigned → ${rideId}`);
      return;
    }

    if (ride.status === "COMPLETED") {
      console.log(`Worker: ride already completed → ${rideId}`);
      return;
    }

    if (Math.random() < 0.2) {
      console.log(`Worker: no drivers available → ${rideId}`);
      return;
    }

    // Simulate dispatch latency so UI can show REQUESTED before assignment.
    await sleep(ASSIGNMENT_DELAY_MS);

    const driverId = `DRIVER_${Math.floor(Math.random() * 900) + 100}`;

    ride.driver = driverId;
    ride.status = "DRIVER_ASSIGNED";

    await ride.save();

    console.log(`Dispatch Event → Driver ${driverId} → Ride ${rideId}`);
  },
  {
    connection,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  }
);

rideWorker.on("completed", (job) => {
  console.log(`Worker: job ${job.id} completed`);
});

rideWorker.on("failed", (job, err) => {
  console.error(
    `Worker: job ${job?.id} failed with error: ${err?.message || err}`
  );
});

process.on("SIGINT", async () => {
  await rideWorker.close();
  await mongoose.connection.close();
  process.exit(0);
});
