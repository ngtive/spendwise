import { Context, NarrowedContext } from "telegraf";
import { Update, CallbackQuery } from "telegraf/types";
import moment, { Moment } from "moment-jalaali";
import { prisma } from "../prisma";
import { generateExcel } from "../services/expense";
import redisSession from "../redis-session/redis-session";

import { isNumeric } from "../helpers/helper";
import {
  generateCancelReplyMarkup,
  generateInitialReplyMarkupKeyboard,
} from "../helpers/keyboard";

export async function callbackQueryHandler(
  ctx: NarrowedContext<
    Context<Update>,
    Update.CallbackQueryUpdate<CallbackQuery.DataQuery>
  >,
) {
  const callbackQueryData = ctx.update.callback_query.data;
  if (/^add_description_(.*)$/.test(callbackQueryData)) {
    await addDescriptionHandler(ctx);
  } else if (/^excel_(.*)$/.test(callbackQueryData)) {
    const matcher = /^excel_(.*)$/.exec(callbackQueryData);
    let start: Moment | null = null;
    let end: Moment | null = null;
    switch (matcher?.[1]) {
      case "current_day":
        start = moment().startOf("day");
        end = moment().endOf("day");
        break;
      case "passed_day":
        start = moment().subtract(1, "day").startOf("day");
        end = moment().subtract(1, "day").endOf("day");
        break;
      case "current_month":
        start = moment().startOf("month").startOf("day");
        end = moment().endOf("day");
        break;
      case "passed_month":
        start = moment().subtract(1, "month").startOf("month").startOf("day");
        end = moment().subtract(1, "month").endOf("month").endOf("day");
        break;
      case "current_week":
        start = moment().startOf("week").startOf("day");
        end = moment().endOf("week").endOf("day");
        break;
      case "passed_week":
        start = moment().subtract(1, "week").startOf("week").startOf("day");
        end = moment().subtract(1, "week").endOf("week").endOf("day");
        break;
      case "current_year":
        start = moment().startOf("year").startOf("day");
        end = moment();
        break;
      case "passed_year":
        start = moment().subtract(1, "year").startOf("year").startOf("day");
        end = moment().subtract(1, "year").endOf("year").endOf("day");
        break;
      default:
        break;
    }

    if (start && end) await excelHandler(ctx, start, end);
  } else if (/^accept_label_(.*)$/.test(callbackQueryData)) {
    const matcher = /^accept_label_(.*)$/.exec(callbackQueryData);
    if (matcher?.length === 2) {
      const waitLabelId = matcher[1];
      const waitLabel = await prisma.waitingLabel.findUnique({
        where: {
          id: parseInt(waitLabelId),
        },
      });
      if (waitLabel) {
        await prisma.waitingLabel.update({
          where: {
            id: waitLabel.id,
          },
          data: {
            approved: true,
          },
        });
        await prisma.label.create({
          data: {
            name: waitLabel.name,
          },
        });
        await ctx.reply("تایید شد", {
          reply_markup: generateInitialReplyMarkupKeyboard(),
        });
      }
    }
  } else if (/^reject_label_(.*)$/.test(callbackQueryData)) {
    const matcher = /^reject_label_(.*)$/.exec(callbackQueryData);
    if (matcher && matcher.length === 2) {
      const waitLabelId = matcher[1];
      if (isNumeric(waitLabelId)) {
        prisma.waitingLabel.update({
          where: {
            id: parseInt(waitLabelId),
          },
          data: {
            approved: false,
          },
        });
        await ctx.reply("رد شد!", {
          reply_markup: generateInitialReplyMarkupKeyboard(),
        });
      }
    }
  }
}

export async function excelHandler(
  ctx: NarrowedContext<
    Context<Update>,
    Update.CallbackQueryUpdate<CallbackQuery.DataQuery>
  >,
  start: Moment,
  end: Moment,
) {
  const telegramId = ctx.update.callback_query.from.id.toString();
  const expenses = await prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: start.toDate(),
        lte: end.toDate(),
      },
    },
    include: {
      label: {},
    },
  });
  await ctx.replyWithDocument({
    source: await generateExcel(expenses),
    filename: "Report.xlsx",
  });
}

export async function addDescriptionHandler(
  ctx: NarrowedContext<
    Context<Update>,
    Update.CallbackQueryUpdate<CallbackQuery.DataQuery>
  >,
) {
  const telegramId: string = ctx.update.callback_query.from.id.toString();
  const callbackQueryData = ctx.update.callback_query.data;

  const matcher = /^add_description_(.*)$/.exec(callbackQueryData);
  if (matcher?.[1]) {
    const findExpenseCount = await prisma.expense.count({
      where: {
        id: parseInt(matcher?.[1]),
      },
    });

    if (findExpenseCount > 0) {
      await redisSession.saveSession(telegramId, {
        name: `add_description`,
        expenseId: matcher[1],
        description: null,
      });
      await ctx.reply("لطفا متن توضیحات را ارسال کنید", {
        reply_markup: generateCancelReplyMarkup(),
      });
    }
  }
}
