import { Queue } from "bullmq";
import { connection } from "../config/redis.js";

const rideQueue = new Queue("ride-queue", { connection });

export default rideQueue;

