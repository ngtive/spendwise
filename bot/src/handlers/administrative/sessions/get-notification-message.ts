import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import { prisma } from "../../../prisma";
import { botQueue } from "../../../queue/bot-queue";
import redisSession from "../../../redis-session/redis-session";

export async function getNotificationMessage(ctx: NarrowedContext<Context<Update>, {
  message: Update.New & Update.NonChannel & Message.TextMessage,
  update_id: number
}>) {
  const users = await prisma.user.findMany({});
  users.forEach(user => {
    botQueue.add(`send-text-message`, {
      chatId: ctx.update.message.chat.id,
      text: ctx.update.message.text,
    }, {
      removeOnComplete: true,
      removeOnFail: true,
    });
  });
  await redisSession.clearSession(ctx.update.message.chat.id.toString());
}