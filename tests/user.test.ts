import {
  createNewUserIfNotExists,
  createUserExpense,
  getUser,
  getUserExpenses,
} from "../src/services/user";
import { fakerFA } from "@faker-js/faker";
import { prisma } from "../src/prisma";

describe("User service functionalities test", () => {
  const telegramId = fakerFA.number.int({ min: 1, max: 10000000 });
  const firstName = fakerFA.person.firstName();
  afterAll(async () => {
    await prisma.user.delete({
      where: {
        telegramId: telegramId.toString(),
      },
    });
  });
  test("test function createNewUserIfNotExists", async () => {
    const user = await createNewUserIfNotExists({
      is_bot: false,
      first_name: firstName,
      id: telegramId,
    });
    expect(user.telegramId).toBe(telegramId.toString());
    expect(user.firstName).toBe(firstName);
  });

  test("test function createUserExpense", async () => {
    const user = await getUser(telegramId.toString());
    if (user) {
      const expense = await createUserExpense(
        telegramId.toString(),
        "1000",
        "Test",
        (await prisma.label.findMany())?.[0]?.id,
      );
      expect(expense.user.telegramId).toBe(telegramId.toString());
      await prisma.expense.delete({
        where: {
          id: expense.id,
        },
      });
    }
  });

  test("test function getUser", async () => {
    const user = await getUser(telegramId.toString());
    expect(user?.telegramId).toBe(telegramId.toString());
  });

  test("test function getUserExpenses", async () => {
    const user = await getUser(telegramId.toString());
    if (user) {
      const expense = await createUserExpense(
        telegramId.toString(),
        "1000",
        "Test",
        (await prisma.label.findMany())?.[0]?.id,
      );
      expect(expense.user.telegramId).toBe(telegramId.toString());

      const expenses = await getUserExpenses(telegramId.toString());
      for (const exp of expenses ?? []) {
        expect(exp.user.telegramId).toBe(telegramId.toString());
      }
      await prisma.expense.delete({
        where: {
          id: expense.id,
        },
      });
    }
  });
});
