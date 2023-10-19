import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

async function main() {
  await prismaClient.label.create({
    data: {
      name: "مخارج شخصی",
    },
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
