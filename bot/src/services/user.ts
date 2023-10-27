import { User } from "telegraf/types";
import { prisma } from "../prisma";

export async function getUserExpenses(telegramId: string) {
  const user = await prisma.user.findFirst({
    where: {
      telegramId: telegramId.toString(),
    },
    include: {
      expenses: {
        include: {
          user: {},
        },
      },
    },
  });
  return user?.expenses;
}

export async function getUser(telegramId: string) {
  return prisma.user.findUnique({
    where: {
      telegramId: telegramId,
    },
  });
}

export async function createUserExpense(
  telegramId: string,
  amount: string,
  title: string,
  labelId: number | undefined,
) {
  return prisma.expense.create({
    data: {
      user: {
        connect: { telegramId: telegramId.toString() },
      },
      label: {
        connect: {
          id: labelId,
        },
      },
      amount: amount,
      title: title,
      description: "",
    },
    include: {
      user: {},
    },
  });
}

export async function createNewUserIfNotExists(user: User) {
  return prisma.user.upsert({
    create: {
      telegramId: user.id.toString(),
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
    },
    where: {
      telegramId: user.id.toString(),
    },
    update: {},
  });
}
