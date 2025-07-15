import { createClient } from "redis";
import { envVars } from "./env.js";


export const redisClient = createClient({
  // username: envVars.REDIS_USERNAME,
  // password: envVars.REDIS_PASSWORD,
  // socket: {
  //   host: envVars.REDIS_HOST,
  //   port: Number(envVars.REDIS_PORT),
  // },

  url: envVars.REDIS_URL
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis is connected 📛✅");
  }
};



// FOR REDIS URL 

// const redis = require("redis");

// const client = redis.createClient({
//   url: process.env.REDIS_URL
// });

// client.on("connect", () => {
//   console.log("Redis connected");
// });

// client.on("error", (err) => {
//   console.error("Redis error:", err);
// });

// await client.connect();
