import { Worker } from "bullmq";
import { connection } from "./connection";
import { bot } from "./bot";

export const botWorker = new Worker(process.env.QUEUE_NAME ?? "queue", async function(job) {
  switch (job.name) {
    case "send-text-message":
      await bot.telegram.sendMessage(job.data.chatId, job.data.text);
      break;
    default:
      break;
  }
}, {
  connection,
});