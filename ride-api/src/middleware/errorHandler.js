import mongoose from "mongoose";

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal server error";

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Custom error with status code
  if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Log error for debugging (in production, use proper logging)
  if (statusCode === 500) {
    console.error("Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
