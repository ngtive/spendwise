import { Queue } from "bullmq";

export const botQueue = new Queue('bot-queue', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379')
  }
});