const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
};

console.log(
  "Connecting to Redis:",
  process.env.REDIS_HOST,
  process.env.REDIS_PORT
);

export { connection };
