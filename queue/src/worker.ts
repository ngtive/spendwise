import { Worker } from "bullmq";
import { connection } from "./connection";
import { logger } from "./logger";

export const botWorker = new Worker('bot-queue', async function (job) {
  console.log(job);
}, {
  connection,
});