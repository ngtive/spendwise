import { KeyboardButton, ReplyKeyboardMarkup } from "telegraf/types";
import moment from "moment-jalaali";
import { getLabels } from "../services/label";

export const generateDateKeyboard = (): KeyboardButton[][] => {
  let keyboard = [];
  keyboard.push([{ text: "امروز" }, { text: "دیروز" }]);

  let dayCounter = 1;
  for (const _ of new Array(10)) {
    const date = moment().subtract(dayCounter, "d");
    keyboard.push([{ text: date.locale("en").format("jYYYY-jMM-jDD") }]);
    dayCounter++;
  }
  return keyboard;
};

export const generateCancelKeyboard = (): KeyboardButton[][] => {
  return [
    [
      {
        text: "انصراف",
      },
    ],
  ];
};

export const generateCancelReplyMarkup = (): ReplyKeyboardMarkup => {
  return {
    keyboard: generateCancelKeyboard(),
    one_time_keyboard: true,
    resize_keyboard: true,
  };
};

export const generateListKeyboard = (): ReplyKeyboardMarkup => {
  return {
    keyboard: [
      [{ text: "امروز" }, { text: "دیروز" }],
      [{ text: "ماه جاری" }, { text: "ماه گذشته" }],
      [{ text: "هفته جاری" }, { text: "هفته گذشته" }],
      [{ text: "سال جاری" }, { text: "سال گذشته" }],
      [{ text: "اکسل کل" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
};

export const generateLabelsReplyMarkup =
  async (): Promise<ReplyKeyboardMarkup> => {
    const keyboard: KeyboardButton[][] = [[]];
    let rowCounter = 0;
    const labels = await getLabels();
    labels.forEach((item) => {
      if (rowCounter === 0) {
        keyboard.push([{ text: item.name }]);
        rowCounter++;
      } else {
        keyboard?.[keyboard.length - 1].push({
          text: item.name,
        });
        rowCounter = 0;
      }
    });
    keyboard.push([{ text: "بدون لیبل" }]);
    return {
      keyboard: keyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
    };
  };

export const generateInitialReplyMarkupKeyboard = (): ReplyKeyboardMarkup => {
  return {
    keyboard: [[{ text: "ثبت مخارج" }, { text: "لیست" }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
};
