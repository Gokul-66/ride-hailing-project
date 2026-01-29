import "dotenv/config";

import { Worker } from "bullmq";
import mongoose from "mongoose";
import { connection } from "./config/redis.js";
import Ride from "./models/Ride.js";

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
  
      const driverId = `DRIVER_${Math.floor(Math.random() * 900) + 100}`;
  
      ride.driver = driverId;
      ride.status = "DRIVER_ASSIGNED";
  
      await ride.save();
  
      console.log(
        `Worker: successfully assigned driver ${driverId} to ride ${rideId}`
      );
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

