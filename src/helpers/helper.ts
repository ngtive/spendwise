import moment from "moment-jalaali";
import { Expense, Label } from "@prisma/client";

export function generateMonthNames(year: number = moment().jYear()) {
  return [...Array.from(Array(12 - 1 + 1).keys(), (num) => num + 1)].map(
    (m) => {
      return moment(`${year}-${m}-1`, "jYYYY-jM-jD");
    },
  );
}

export function isNumeric(str: string): boolean {
  return !isNaN(Number(str));
}

export function generateMessageFromExpense(expenses: Expense[]) {
  let sumPrice = 0;
  for (const exp of expenses) {
    if (isNumeric(exp.amount)) {
      sumPrice += parseInt(exp.amount);
    }
  }
  const expense = expenses
    .map(
      (exp) =>
        `${exp.title}: ${exp.amount}\r\n${moment(
          exp.createdAt,
        ).calendar()}\r\n/detail_${exp.id}`,
    )
    .join("\r\n");
  return expense.length > 2
    ? `${expense}\r\n\r\nsum: ${sumPrice}`
    : "دیتایی وجود ندارد";
}

export function generateSingleMessageFromExpense(
  expense: Expense & {
    label: Label | null;
  },
) {
  const jalaliDate = moment(expense.createdAt).format(
    "jYYYY-jMM-jDD hh:mm:ss a",
  );
  return `title: ${expense.title}\r\namount: ${expense.amount}\r\nlabel: ${
    expense.label?.name ?? "ندارد"
  }\r\ndate: ${jalaliDate}\r\ndescription: ${
    !!expense.description ? expense.description : "ندارد"
  }`;
}
