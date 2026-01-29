import "dotenv/config";
import connectDB from "./config/db.js";
import "./worker.js";

connectDB();
console.log("Ride Worker started");