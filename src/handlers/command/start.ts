import { Context, NarrowedContext } from "telegraf";
import { createNewUserIfNotExists } from "../../services/user";
import { Message, Update } from "telegraf/types";
import { generateInitialReplyMarkupKeyboard } from "../../helpers/keyboard";

export async function startCommandHandler(
  ctx: NarrowedContext<
    Context<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >,
) {
  if (ctx.message) {
    await createNewUserIfNotExists(ctx.message.from);
    const userFirstName = ctx.message.from.first_name;
    await ctx.reply(`سلام ${userFirstName}`, {
      reply_markup: generateInitialReplyMarkupKeyboard(),
    });
  }
}
