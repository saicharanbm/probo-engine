import { createClient, RedisClientType } from "redis";

let publisherClient: RedisClientType;

export const connectToRedis = async () => {
  if (!publisherClient) {
    publisherClient = createClient();

    try {
      await publisherClient.connect();
      console.log("Connected to Redis successfully");
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      throw error;
    }
  } else {
    console.log("Redis connection already established.");
  }
};

export { publisherClient };
