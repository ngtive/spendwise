import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

async function main() {
  await prismaClient.label.createMany({
    data: [
      {
        name: "مخارج شخصی",
      },
      {
        name: 'خرید خونه',
      },
      {
        name: 'مخارج سفر',
      },
    ],
  });
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
