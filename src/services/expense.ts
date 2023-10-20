import { prisma } from "../prisma";
import moment from "moment-jalaali";
import { dateFormat } from "../const/sessions";
import xlsx from "node-xlsx";
import { Expense, Label } from "@prisma/client";

export async function createExpense(
  telegramId: string,
  labelId: number | undefined,
  amount: string,
  title: string,
  date: Date,
) {
  if (!labelId)
    return prisma.expense.create({
      data: {
        amount: amount,
        title: title,
        user: {
          connect: {
            telegramId: telegramId,
          },
        },
        createdAt: date,
      },
    });
  return prisma.expense.create({
    data: {
      amount: amount,
      title: title,
      label: {
        connect: {
          id: labelId,
        },
      },
      user: {
        connect: {
          telegramId: telegramId,
        },
      },
      createdAt: date,
    },
  });
}

export async function getExpensesByToday(telegramId: string) {
  const today = moment().startOf("day");

  return prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: today.toDate(),
      },
    },
    include: {
      label: {},
    },
  });
}

export async function getExpensesByYesterday(telegramId: string) {
  const yesterday = moment().subtract(1, "day").startOf("day");

  return prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: yesterday.startOf("day").toDate(),
        lte: yesterday.endOf("day").toDate(),
      },
    },
  });
}

export async function getExpensesByCurrentWeek(telegramId: string) {
  const startOfWeek = moment().startOf("w").startOf("d");
  console.log(startOfWeek.format("jYYYY-jMM-jDD hh:mm:ss"));

  return prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: startOfWeek.toDate(),
      },
    },
  });
}

export async function getExpensesByLastWeek(telegramId: string) {
  const startOfLastWeek = moment()
    .startOf("week")
    .startOf("day")
    .subtract(1, "weeks");
  const endOfLastWeek = moment()
    .startOf("week")
    .startOf("day")
    .subtract(1, "weeks")
    .endOf("week");

  return prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: startOfLastWeek.toDate(),
        lte: endOfLastWeek.toDate(),
      },
    },
  });
}

export async function getExpensesByCurrentYear(telegramId: string) {
  const startOfCurrentYear = moment().startOf("year").startOf("day");

  return prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: startOfCurrentYear.toDate(),
      },
    },
  });
}

export async function getExpensesByLastYear(telegramId: string) {
  const startOfLastYear = moment()
    .subtract(1, "year")
    .startOf("year")
    .startOf("day");
  const startOfCurrentYear = moment().startOf("year").startOf("day");

  return prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: startOfLastYear.toDate(),
        lte: startOfCurrentYear.toDate(),
      },
    },
  });
}

export async function getExpensesByCurrentMonth(telegramId: string) {
  const startOfCurrentMonth = moment().startOf("month").startOf("day");

  return prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: startOfCurrentMonth.toDate(),
      },
    },
  });
}

export async function getExpensesByLastMonth(telegramId: string) {
  const startOfLastMonth = moment()
    .subtract(1, "month")
    .startOf("month")
    .startOf("day");

  const endOfLastMonth = moment()
    .subtract(1, "month")
    .endOf("month")
    .endOf("day");

  return prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: startOfLastMonth.toDate(),
        lte: endOfLastMonth.toDate(),
      },
    },
  });
}

export async function getExpensesByDate(telegramId: string, dateInp: string) {
  let date = moment(dateInp, dateFormat.get_date_format);

  const startOfDay = date.startOf("day");
  const endOfDay = date.startOf("day");

  return prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
      createdAt: {
        gte: startOfDay.toDate(),
        lte: endOfDay.toDate(),
      },
    },
  });
}

export async function generateExcel(
  expenses: Array<
    Expense & {
      label: Label | null;
    }
  >,
) {
  let sumAmount: number = 0;
  const sheetData = expenses.map((exp) => {
    sumAmount += Number(exp.amount);
    return [
      exp.title,
      exp.amount,
      exp.description,
      exp.label?.name,
      moment(exp.createdAt).format("jYYYY-jMM-jDD hh:mm:ss a"),
    ];
  });

  return xlsx.build([
    {
      name: "Expenses Sheet",
      data: [["Title", "Amount", "Description", "Label", "Date"], ...sheetData],
      options: {},
    },
  ]);
}

export async function getExpensesAllInExcel(telegramId: string) {
  const expenses = await prisma.expense.findMany({
    where: {
      user: {
        telegramId: telegramId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let sumAmount: number = 0;

  const sheetData = expenses.map((exp) => {
    sumAmount += Number(exp.amount);
    return [
      exp.title,
      exp.amount,
      moment(exp.createdAt).format("jYYYY-jMM-jDD hh:mm:ss a"),
    ];
  });

  return xlsx.build([
    {
      name: "Expenses Sheet",
      data: [["Title", "Amount", "Date"], ...sheetData],
      options: {},
    },
  ]);
}
