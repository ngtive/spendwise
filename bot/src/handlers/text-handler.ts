import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/types";
import redisSession from "../redis-session/redis-session";
import { dateFormat, sessions } from "../const/sessions";
import { startCommandHandler } from "./command/start";
import { generateMessageFromExpense, isNumeric } from "../helpers/helper";
import moment from "moment-jalaali";
import { getLabelByName } from "../services/label";

import {
  createExpense,
  getExpensesAllInExcel,
  getExpensesByCurrentMonth,
  getExpensesByCurrentWeek,
  getExpensesByCurrentYear,
  getExpensesByLastMonth,
  getExpensesByLastWeek,
  getExpensesByLastYear,
  getExpensesByToday,
  getExpensesByYesterday,
} from "../services/expense";
import { logger } from "../logger";
import { bot } from "../bot";
import { detailCommandHandler } from "./command/detail";
import { prisma } from "../prisma";
import { Label } from "@prisma/client";
import { createLabelCommandHandler } from "./command/create-label";
import {
  generateCancelReplyMarkup,
  generateDateKeyboard,
  generateInitialReplyMarkupKeyboard,
  generateLabelsReplyMarkup,
  generateListKeyboard,
} from "../helpers/keyboard";
import { notificationHandler } from "./administrative/commands/notification";
import { getNotificationMessage } from "./administrative/sessions/get-notification-message";

export async function cancelSessionHandler(
  ctx: NarrowedContext<
    Context<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >,
) {
  const chatId = ctx.update.message.chat.id;
  await redisSession.clearSession(chatId.toString());
  await ctx.reply("انجام شد", {
    reply_to_message_id: ctx.update.message.message_id,
    reply_markup: generateInitialReplyMarkupKeyboard(),
  });
}

export async function privateChatTextHandler(
  ctx: NarrowedContext<
    Context<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >,
): Promise<void> {
  const chatId = ctx.update.message.chat.id;
  const messageId = ctx.update.message.message_id;
  const telegramId = chatId.toString();
  const text = ctx.update.message.text;

  if (text === "انصراف") {
    await cancelSessionHandler(ctx);
    return;
  }

  const userSession = await redisSession.getSession(telegramId);
  if (userSession) {
    const sessionName = userSession.name;
    switch (sessionName) {
      case sessions.get_notification_message:
        await getNotificationMessage(ctx);
        break;
      case sessions.get_title:
        const title = text;
        await ctx.reply("لطفا عدد مبلغ را بفرستید!", {
          reply_to_message_id: messageId,
        });
        await redisSession.saveSession(telegramId, {
          name: sessions.get_amount,
          data: {
            title: title,
            label: null,
            amount: null,
          },
        });
        return;
      case sessions.get_amount:
        const amount = text;
        if (isNumeric(amount)) {
          await ctx.reply("لطفا لیبل را انتخاب کنید!", {
            reply_markup: await generateLabelsReplyMarkup(),
          });
          await redisSession.saveSession(telegramId, {
            name: sessions.get_label_name,
            data: {
              title: userSession.data.title,
              amount: amount,
            },
          });
          return;
        } else {
          await ctx.reply("مقدار وارد شده برای مبلغ اشتباه است!", {
            reply_to_message_id: ctx.message.message_id,
            reply_markup: generateCancelReplyMarkup(),
          });
        }
        return;
      case sessions.get_label_name:
        let label: Label | null = null;
        if (text !== "بدون لیبل") label = await getLabelByName(text);
        await redisSession.saveSession(telegramId, {
          name: sessions.get_date,
          data: {
            label: label?.id,
            title: userSession.data.title,
            amount: userSession.data.amount,
            date: null,
          },
        });
        await ctx.reply(
          "لطفا تاریخ را انتخاب کنید\nفرمت انتخاب تاریخ: 1402-02-02 به شمسی",
          {
            reply_markup: {
              keyboard: generateDateKeyboard(),
              one_time_keyboard: true,
              force_reply: true,
              resize_keyboard: true,
            },
          },
        );
        return;
      case sessions.get_date:
        let date = moment(text, dateFormat.get_date_format);
        if (!date.isValid()) {
          switch (text) {
            case "امروز":
              date = moment();
              break;
            case "دیروز":
              date = moment().subtract("d");
              break;
            default:
              await ctx.reply("فرمت تاریخ اشتباه است!", {
                reply_to_message_id: messageId,
              });
              return;
          }
        }
        const labelId: number | undefined = userSession.data.label;

        await createExpense(
          telegramId,
          labelId ?? undefined,
          userSession.data.amount,
          userSession.data.title,
          date.toDate(),
        );
        logger.info(
          `Expense saved for user ${chatId} amount: ${userSession.data.amount}`,
        );
        await redisSession.clearSession(telegramId);

        await ctx.reply("ثبت شد!", {
          reply_markup: generateInitialReplyMarkupKeyboard(),
        });
        return;
      case sessions.add_description:
        const expenseId = userSession.expenseId;
        if (isNumeric(expenseId)) {
          await prisma.expense.update({
            where: {
              id: parseInt(expenseId),
            },
            data: {
              description: text,
            },
          });
          await redisSession.clearSession(telegramId);
          await ctx.reply("توضیحات با موفقیت اضافه شد!", {
            reply_markup: generateInitialReplyMarkupKeyboard(),
          });
        }
        break;
      case sessions.create_label:
        const waitLabels = await prisma.waitingLabel.create({
          data: {
            name: text,
            createdBy: {
              connect: {
                telegramId: telegramId,
              },
            },
            approved: false,
          },
        });
        await ctx.reply(
          "درخواست شما به مدیریت داده شد بعد از تایید به لیست اضافه می شود!",
          {
            reply_to_message_id: messageId,
            reply_markup: generateInitialReplyMarkupKeyboard(),
          },
        );
        if (process.env.ADMIN_TELEGRAM_ID) {
          await bot.telegram.sendMessage(
            parseInt(process.env.ADMIN_TELEGRAM_ID) ?? "",
            `یکی یک لیبل با نام\r\n${text}\r\nاضافه کرده است آیا موافقت می کنید ؟`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "تایید",
                      callback_data: `accept_label_${waitLabels.id}`,
                    },
                    {
                      text: "رد",
                      callback_data: `reject_label_${waitLabels.id}`,
                    },
                  ],
                ],
              },
            },
          );
        }
        await redisSession.clearSession(telegramId);
        return;
    }
  }

  if (/^\/detail_(.*)$/.test(text)) return detailCommandHandler(ctx);

  switch (text) {
    case "/start":
      await startCommandHandler(ctx);
      return;
    case "/create_label":
      await createLabelCommandHandler(ctx);
      return;
    case "Submit expense":
      await redisSession.saveSession(telegramId, {
        name: sessions.get_title,
        data: {
          title: null,
          label: null,
          amount: null,
        },
      });
      await ctx.reply("لطفا موضوع خرج کرد را وارد کنید", {
        reply_to_message_id: messageId,
        reply_markup: generateCancelReplyMarkup(),
      });
      return;
    case "List":
      await ctx.reply("انتخاب کنید", {
        reply_markup: generateListKeyboard(),
        reply_to_message_id: ctx.update.message.message_id,
      });
      return;
    case "Today":
      await ctx.reply(
        generateMessageFromExpense(await getExpensesByToday(telegramId)),
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "دریافت اکسل", callback_data: "excel_current_day" }],
            ],
          },
        },
      );
      return;
    case "Yesterday":
      await ctx.reply(
        generateMessageFromExpense(await getExpensesByYesterday(telegramId)),
        {
          reply_markup: {
            ...generateInitialReplyMarkupKeyboard(),
            inline_keyboard: [
              [{ text: "دریافت اکسل", callback_data: "excel_passed_day" }],
            ],
          },
        },
      );
      return;
    case "Current month":
      await ctx.reply(
        generateMessageFromExpense(await getExpensesByCurrentMonth(telegramId)),
        {
          reply_markup: {
            ...generateInitialReplyMarkupKeyboard(),
            inline_keyboard: [
              [{ text: "دریافت اکسل", callback_data: "excel_current_month" }],
            ],
          },
        },
      );
      return;
    case "Passed month":
      await ctx.reply(
        generateMessageFromExpense(await getExpensesByLastMonth(telegramId)),
        {
          reply_markup: {
            ...generateInitialReplyMarkupKeyboard(),
            inline_keyboard: [
              [{ text: "دریافت اکسل", callback_data: "excel_passed_month" }],
            ],
          },
        },
      );
      return;
    case "Current week":
      await ctx.reply(
        generateMessageFromExpense(await getExpensesByCurrentWeek(telegramId)),
        {
          reply_markup: {
            ...generateInitialReplyMarkupKeyboard(),
            inline_keyboard: [
              [{ text: "دریافت اکسل", callback_data: "excel_current_week" }],
            ],
          },
        },
      );
      return;
    case "Passed week":
      await ctx.reply(
        generateMessageFromExpense(await getExpensesByLastWeek(telegramId)),
        {
          reply_markup: {
            ...generateInitialReplyMarkupKeyboard(),
            inline_keyboard: [
              [{ text: "دریافت اکسل", callback_data: "excel_passed_week" }],
            ],
          },
        },
      );
      return;
    case "Current year":
      await ctx.reply(
        generateMessageFromExpense(await getExpensesByCurrentYear(telegramId)),
        {
          reply_markup: {
            ...generateInitialReplyMarkupKeyboard(),
            inline_keyboard: [
              [{ text: "دریافت اکسل", callback_data: "excel_current_year" }],
            ],
          },
        },
      );
      return;
    case "Passed year":
      await ctx.reply(
        generateMessageFromExpense(await getExpensesByLastYear(telegramId)),
        {
          reply_markup: {
            ...generateInitialReplyMarkupKeyboard(),
            inline_keyboard: [
              [{ text: "دریافت اکسل", callback_data: "excel_passed_year" }],
            ],
          },
        },
      );
      return;
    case "All in excel":
      const excelBuffer = await getExpensesAllInExcel(telegramId);
      await ctx.replyWithDocument({
        source: excelBuffer,
        filename: `${moment().format("jYYYY-jMM-jDD")}.xlsx`,
      });
      return;
    default:
      break;
  }

  if (telegramId === process.env.ADMIN_TELEGRAM_ID) {
    switch (text) {
      case '/notification':
        await notificationHandler(ctx);
        break;
      default:
        break;
    }
  }
}

export async function textHandler(
  ctx: NarrowedContext<
    Context<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >,
) {
  if (ctx.update.message.chat.type === "private") {
    await privateChatTextHandler(ctx);
  }
}
