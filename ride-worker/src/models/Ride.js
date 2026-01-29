import mongoose from "mongoose";

const { Schema } = mongoose;

const rideSchema = new Schema(
  {
    riderName: {
      type: String,
      required: true,
      trim: true,
    },
    pickup: {
      type: String,
      required: true,
      trim: true,
    },
    drop: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "REQUESTED",
        "DRIVER_ASSIGNED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "REQUESTED",
    },
    driver: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Ride", rideSchema);

