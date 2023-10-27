import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import { generateInitialReplyMarkupKeyboard } from "../../helpers/keyboard";
import { prisma } from "../../prisma";

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
    const telegramUser = ctx.update.message.from;
    let databaseUser = await prisma.user.findUnique({
      where: {
        telegramId: telegramUser.id.toString(),
      },
    });
    // create user if not exist
    if (!databaseUser) {
      databaseUser = await prisma.user.create({
        data: {
          telegramId: telegramUser.id.toString(),
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
        },
      });
    }
    if (!databaseUser.currency) {
      await ctx.reply("You did not set the currency type, please choose one from keyboard", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "$",
                callback_data: "set-currency-usd",
              },
              {
                text: "IRR (ریال)",
                callback_data: "set-currency-irr",
              },
            ],
            [
              {
                text: "IR TOMAN (تومان)",
                callback_data: "set-currency-toman",
              },
              {
                text: "€ (Euro)",
                callback_data: "set-currency-euro",
              },
            ],
            [
              {
                text: "£ (Pound)",
                callback_data: "set-currency-pound",
              },
            ],
          ],
        },
      });
    } else {
      await ctx.reply(`Hello, ${telegramUser.first_name} welcome back`, {
        reply_markup: generateInitialReplyMarkupKeyboard(),
      });
    }
  }
}
