import {config} from 'dotenv';
config();

import { botWorker } from "./worker";
import { logger } from "./logger";


botWorker.on("ready", () => {
  console.log("Worker is ready");
});

botWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed`);
});