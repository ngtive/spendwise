import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import {
  generateSingleMessageFromExpense,
  isNumeric,
} from "../../helpers/helper";
import { prisma } from "../../prisma";

export async function detailCommandHandler(
  ctx: NarrowedContext<
    Context<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >,
) {
  const text = ctx.message.text;
  const telegramId = ctx.message.chat.id.toString();
  const match = /^\/detail_(.*)$/.exec(text);
  if (match?.length === 2) {
    const expenseId = match[1];
    if (isNumeric(expenseId)) {
      const expense = await prisma.expense.findFirst({
        where: { id: parseInt(expenseId), user: { telegramId: telegramId } },
        include: { label: {} },
      });
      if (expense) {
        await ctx.reply(generateSingleMessageFromExpense(expense), {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "افزودن توضیحات",
                  callback_data: `add_description_${expenseId}`,
                },
              ],
            ],
          },
        });
      }
    }
  }
}
