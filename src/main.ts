import dotEnv from "dotenv";

dotEnv.config();
import { logger } from "./logger";
import { bot } from "./bot";
import { prisma } from "./prisma";
import { textHandler } from "./handlers/text-handler";
import { callbackQueryHandler } from "./handlers/callback-query";
import moment from "moment-jalaali";
import { redisClient } from "./redis";
import { botQueue } from "./queue/bot-queue";

moment.locale("fa");

bot.use(async (ctx: any, next) => {
  const update = ctx.update;
  if (update.message) {
    if (update.message.text) {
      await textHandler(ctx);
    }
  } else if (update.callback_query) {
    await callbackQueryHandler(ctx);
  }
  await next();
});


botQueue.add('test', {
  test: 1,
})

redisClient.on("connect", () => {
  logger.info("Redis connected !");
});
prisma.$connect().then(() => {
  logger.info("Prisma connected !");
});

process.once("SIGINT", () => {
  bot.stop("SIGINT");
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
});
bot.launch().then(() => {
  logger.info(`bot launched !`);
});
