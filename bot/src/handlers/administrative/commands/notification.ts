import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import redisSession from "../../../redis-session/redis-session";
import { sessions } from "../../../const/sessions";

export async function notificationHandler(ctx: NarrowedContext<Context<Update>, { message: Update.New & Update.NonChannel & Message.TextMessage, update_id: number }>) {
  await ctx.reply("متن نوتیفیکیشن را ارسال کنید");
  await redisSession.saveSession(ctx.update.message.chat.id.toString(), {
    name: sessions.get_notification_message,
  });
}