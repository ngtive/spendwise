import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import redisSession from "../../redis-session/redis-session";
import { sessions } from "../../const/sessions";
import { generateCancelReplyMarkup } from "../../helpers/keyboard";

export async function createLabelCommandHandler(
  ctx: NarrowedContext<
    Context<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >,
) {
  const messageId = ctx.update.message.message_id;
  const telegramId = ctx.update.message.chat.id.toString();

  await redisSession.saveSession(telegramId, {
    name: sessions.create_label,
  });
  await ctx.reply(
    "نام لیبل را به صورت متنی بفرستید در صورت موافقت تایید می شود!",
    {
      reply_to_message_id: messageId,
      reply_markup: generateCancelReplyMarkup(),
    },
  );
}
